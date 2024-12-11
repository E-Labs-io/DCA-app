/** @format */

"use client";

import { useCallback, useEffect, useState } from "react";
import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";
import { BrowserProvider, ethers } from "ethers";
import { DCAAccount__factory, DCAFactory__factory } from "@/types/contracts";
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

interface TokenBalance {
  balance: bigint;
  remainingExecutions: number;
  needsTopUp: boolean;
}

interface TokenBalances {
  [tokenAddress: string]: TokenBalance;
}

export interface StrategyExecutionTiming {
  lastExecution: number;
  nextExecution: number;
}

interface ExecutionTimings {
  [strategyId: string]: StrategyExecutionTiming;
}

const REFRESH_INTERVAL = 30000; // 30 seconds

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

      // Group strategies by base token
      const tokenStrategies = strategies.reduce((acc, strategy) => {
        const tokenAddress = strategy.baseToken.tokenAddress.toString();
        if (!acc[tokenAddress]) {
          acc[tokenAddress] = [];
        }
        acc[tokenAddress].push(strategy);
        return acc;
      }, {} as { [tokenAddress: string]: IDCADataStructures.StrategyStruct[] });

      // Fetch balances and calculate executions for each token
      await Promise.all(
        Object.entries(tokenStrategies).map(
          async ([tokenAddress, strategies]) => {
            try {
              const balance = await dcaAccount.getBaseBalance(tokenAddress);

              // Calculate total amount needed per execution for this token
              const totalPerExecution = strategies.reduce((sum, strategy) => {
                return strategy.active ? sum + BigInt(strategy.amount) : sum;
              }, BigInt(0));

              // Calculate remaining executions
              const remainingExecutions =
                totalPerExecution > 0 ? Number(balance / totalPerExecution) : 0;

              balances[tokenAddress] = {
                balance,
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
      const currentTime = Math.floor(Date.now() / 1000);
      const dcaAccount = await getOrCreateAccountInstance(accountAddress);

      if (!dcaAccount) {
        console.error("No DCA account instance found for", accountAddress);
        return {};
      }

      let totalExecutionsCount = 0;

      await Promise.all(
        strategies.map(async (strategy) => {
          try {
            const executions = await getStrategyExecutionEvents(
              dcaAccount,
              Number(strategy.strategyId)
            );

            const { lastExecution, executionCount, totalAmountReturned } =
              processExecutionEvents(executions);

            totalExecutionsCount += executionCount;

            // Calculate next execution time
            const nextExecution =
              lastExecution > 0
                ? lastExecution + Number(strategy.interval)
                : currentTime + Number(strategy.interval);

            timings[strategy.strategyId.toString()] = {
              lastExecution,
              nextExecution,
            };
          } catch (error) {
            console.error(
              `Error fetching execution timing for strategy ${strategy.strategyId}:`,
              error
            );
          }
        })
      );

      setTotalExecutions(totalExecutionsCount);
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
      getAllData();
    }
  }, [Signer, accounts]);

  // Periodic refresh
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (Signer && accounts.length > 0) {
        getAllData();
      }
    }, REFRESH_INTERVAL);

    return () => clearInterval(intervalId);
  }, [Signer, accounts, getAllData]);

  return {
    isLoading,
    totalExecutions,
    tokenBalances,
    executionTimings,
    getAllData,
    lastRefresh,
  };
}
