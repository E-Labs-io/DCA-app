/** @format */

"use client";

import { useCallback, useEffect, useState } from "react";

import { useAccountStore } from "@/lib/store/accountStore";
import { useStrategyStore } from "@/lib/store/strategyStore";

import { useDCAFactory } from "./useDCAFactory";
import { Signer } from "ethers";
import useSigner from "./useSigner";
import {
  DCAAccount,
  IDCADataStructures,
} from "@/types/contracts/contracts/base/DCAAccount";
import { connectToDCAAccount } from "./helpers/connectToContract";
import {
  getAccountStrategyCreationEvents,
  getStrategyExecutionEvents,
} from "./helpers/getAccountEvents";
import {
  StrategyCreationEvent,
  AccountStrategyExecutionEvent,
} from "@/types/eventTransactions";
import { buildStrategyStruct } from "./helpers/buildDataTypes";

export interface TokenBalance {
  balance: bigint;
  targetBalance?: bigint;
  remainingExecutions: number;
  needsTopUp: boolean;
}

export interface TokenBalances {
  [tokenAddress: string]: TokenBalance;
}

export interface StrategyExecutionTiming {
  lastExecution: number;
  nextExecution: number;
}

interface ExecutionTimings {
  [strategyId: string]: StrategyExecutionTiming;
}

// Define a new interface for storing execution details
interface StrategyExecutionDetails {
  lastExecution: number;
  nextExecution: number;
  amountIn: bigint;
  reInvested: boolean;
}

// Add a function to process events and calculate statistics
const processExecutionEvents = (
  executions: AccountStrategyExecutionEvent[]
) => {
  const lastExecution = executions.reduce((latest, event) => {
    return event.blockNumber > latest ? event.blockNumber : latest;
  }, 0);

  const executionCount = executions.length;

  const totalAmountReturned = executions.reduce((total, event) => {
    return total + BigInt(event.amountIn);
  }, BigInt(0));

  return { lastExecution, executionCount, totalAmountReturned };
};

// Add event listeners for StrategySubscription and FeesDistributed
const addEventListeners = (dcaAccount: DCAAccount) => {
  dcaAccount.on(
    dcaAccount.filters.StrategySubscribed(),
    (DCAAccountAddress_, strategyId_, strategyInterval_, active_, event) => {
      console.log("StrategySubscription event:", {
        DCAAccountAddress_,
        strategyId_,
        strategyInterval_,
        active_,
      });
      // Handle strategy subscription logic here
    }
  );
};

export function useAccountStats() {
  const { getUsersAccounts } = useDCAFactory();
  const {
    accounts,
    setAccounts,
    accountStrategies,
    setAccountStrategies,
    accountInstances,
    setAccountInstance,
  } = useAccountStore();
  const { strategies, setStrategies } = useStrategyStore();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [totalExecutions, setTotalExecutions] = useState<number>(0);
  const [tokenBalances, setTokenBalances] = useState<{
    [accountAddress: string]: TokenBalances;
  }>({});
  const [executionTimings, setExecutionTimings] = useState<{
    [accountAddress: string]: ExecutionTimings;
  }>({});
  const [lastRefresh, setLastRefresh] = useState<number>(Date.now());

  const { Signer } = useSigner();

  const getOrCreateAccountInstance = useCallback(
    async (accountAddress: string) => {
      const address = accountAddress.toString();
      let dcaAccount = accountInstances[address];

      if (!dcaAccount && Signer) {
        dcaAccount = await connectToDCAAccount(address, Signer);
        if (dcaAccount) {
          setAccountInstance(address, dcaAccount);
        }
      }

      return dcaAccount;
    },
    [accountInstances, Signer, setAccountInstance]
  );

  const fetchTokenBalances = useCallback(
    async (
      accountAddress: string,
      strategies: IDCADataStructures.StrategyStruct[],
      dcaAccount: DCAAccount
    ) => {
      if (!Signer) return {};

      const balances: TokenBalances = {};

      // Group strategies by both base and target tokens
      const tokenStrategies = strategies.reduce((acc, strategy) => {
        const baseTokenAddress = strategy.baseToken.tokenAddress.toString();
        const targetTokenAddress = strategy.targetToken.tokenAddress.toString();

        if (!acc[baseTokenAddress]) {
          acc[baseTokenAddress] = [];
        }
        acc[baseTokenAddress].push(strategy);

        if (!acc[targetTokenAddress]) {
          acc[targetTokenAddress] = [];
        }
        acc[targetTokenAddress].push(strategy);

        return acc;
      }, {} as { [tokenAddress: string]: IDCADataStructures.StrategyStruct[] });

      // Fetch balances and calculate executions for each token
      await Promise.all(
        Object.entries(tokenStrategies).map(
          async ([tokenAddress, strategies]) => {
            try {
              const baseBalance = await dcaAccount.getBaseBalance(tokenAddress);
              const targetBalance = await dcaAccount.getTargetBalance(
                tokenAddress
              );

              // Calculate total amount needed per execution for this token
              const totalPerExecution = strategies.reduce((sum, strategy) => {
                return strategy.active ? sum + BigInt(strategy.amount) : sum;
              }, BigInt(0));

              // Calculate remaining executions
              const remainingExecutions =
                totalPerExecution > 0
                  ? Number(baseBalance / totalPerExecution)
                  : 0;

              balances[tokenAddress] = {
                balance: baseBalance,
                targetBalance,
                remainingExecutions,
                needsTopUp: remainingExecutions < 5,
              };
            } catch (error) {
              console.error(
                `Error fetching balance for token ${tokenAddress}:`,
                error
              );
            }
          }
        )
      );

      return balances;
    },
    [Signer]
  );

  const calculateExecutionTimings = useCallback(
    async (
      accountAddress: string,
      strategies: IDCADataStructures.StrategyStruct[]
    ) => {
      if (!Signer) return {};

      const timings: ExecutionTimings = {};
      const dcaAccount = await getOrCreateAccountInstance(accountAddress);

      if (!dcaAccount) {
        console.error("No DCA account instance found for", accountAddress);
        return {};
      }

      await Promise.all(
        strategies.map(async (strategy) => {
          try {
            const { lastEx, secondsLeft } = await dcaAccount.getTimeTillWindow(
              strategy.strategyId
            );

            const nextExecution = Number(lastEx) + Number(strategy.interval);

            timings[strategy.strategyId.toString()] = {
              lastExecution: Number(lastEx),
              nextExecution,
            };

            // Listen for execution events to update timings
            dcaAccount.on(
              dcaAccount.filters.StrategyExecuted(),
              (strategyId, amountIn, reInvested, event) => {
                if (strategyId.toString() === strategy.strategyId.toString()) {
                  const newLastEx = event.blockNumber;
                  const newNextExecution =
                    newLastEx + Number(strategy.interval);

                  setExecutionTimings((prev) => ({
                    ...prev,
                    [accountAddress]: {
                      ...prev[accountAddress],
                      [strategy.strategyId.toString()]: {
                        lastExecution: newLastEx,
                        nextExecution: newNextExecution,
                        amountIn: BigInt(amountIn),
                        reInvested,
                      },
                    },
                  }));
                }
              }
            );
          } catch (error) {
            console.error(
              `Error fetching execution timing for strategy ${strategy.strategyId}:`,
              error
            );
          }
        })
      );

      return timings;
    },
    [Signer, getOrCreateAccountInstance]
  );

  const fetchAccountStrategies = useCallback(
    async (accountAddress: string) => {
      if (!Signer) return [];
      setIsLoading(true);

      try {
        const dcaAccount = await getOrCreateAccountInstance(accountAddress);
        if (!dcaAccount) return [];

        // Add event listeners
        //addEventListeners(dcaAccount);

        const strategyEvents = await getAccountStrategyCreationEvents(
          dcaAccount
        );
        const strategies = await Promise.all(
          strategyEvents.map(async (event) => {
            const rawStrategyData = await dcaAccount.getStrategyData(event.id);
            const formattedStrategy = buildStrategyStruct(rawStrategyData);
            return {
              ...formattedStrategy,
              account: accountAddress,
              accountContract: dcaAccount,
              blockNumber: event.blockNumber,
              transactionHash: event.transactionHash,
            };
          })
        );

        setAccountStrategies(accountAddress, strategies);
        setStrategies(strategies);

        // Fetch token balances for this account
        const balances = await fetchTokenBalances(
          accountAddress,
          strategies,
          dcaAccount
        );
        setTokenBalances((prev) => ({
          ...prev,
          [accountAddress]: balances,
        }));

        // Calculate execution timings
        const timings = await calculateExecutionTimings(
          accountAddress,
          strategies
        );
        setExecutionTimings((prev) => ({
          ...prev,
          [accountAddress]: timings,
        }));

        return strategies;
      } catch (error) {
        console.error("Error fetching strategies:", error);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [
      Signer,
      setAccountStrategies,
      setStrategies,
      fetchTokenBalances,
      calculateExecutionTimings,
      getOrCreateAccountInstance,
    ]
  );

  const getAllData = useCallback(async () => {
    if (!Signer || !accounts.length) return;
    setIsLoading(true);

    try {
      await Promise.all(
        accounts.map(async (accountAddress) => {
          await fetchAccountStrategies(accountAddress as string);
        })
      );
      setLastRefresh(Date.now());
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [Signer, accounts, fetchAccountStrategies]);

  // Initial data fetch
  useEffect(() => {
    if (Signer && accounts.length > 0) {
      console.log("Fetching all data for accounts:", accounts);
      getAllData();
    }
  }, [Signer, accounts]);

  useEffect(() => {
    console.log("Strategies updated:", strategies);
  }, [strategies]);

  return {
    isLoading,
    totalExecutions,
    tokenBalances,
    executionTimings,
    getAllData,
    lastRefresh,
  };
}
