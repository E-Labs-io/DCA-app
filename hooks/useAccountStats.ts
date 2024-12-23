/** @format */

"use client";

import { useCallback, useState } from "react";

import { useAccountStore } from "@/lib/store/accountStore";
import { useStrategyStore } from "@/lib/store/strategyStore";

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
import { AccountStrategyExecutionEvent } from "@/types/eventTransactions";
import { buildStrategyStruct } from "./helpers/buildDataTypes";
import {
  AccountStrategyIntervalCost,
  buildAccountStrategyIntervalCost,
  calculateExecutionsLeft,
} from "./helpers/executionCalculations";
import { TokenData } from "@/constants/tokens";
import { TokenBalances, useDCAProvider } from "@/lib/providers/DCAStatsProvider";



export function useAccountStats() {
  const {} = useDCAProvider();
  const {
    accounts,
    setAccountStrategies,
    accountInstances,
    setAccountInstance,
    accountStrategies,
  } = useAccountStore();
  const { setStrategies, strategies } = useStrategyStore();
  const [isLoading, setIsLoading] = useState<boolean>(false);
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
    [Signer, accountInstances, setAccountInstance]
  );

  const fetchAccountStrategies = useCallback(
    async (
      accountAddress: string,
      dcaAccount: DCAAccount
    ): Promise<IDCADataStructures.StrategyStruct[]> => {
      if (!Signer) return [];

      const cachedStrategies = accountStrategies[accountAddress];
      if (cachedStrategies && cachedStrategies.length > 0) {
        return cachedStrategies;
      }

      if (!dcaAccount) return [];

      const strategyEvents = await getAccountStrategyCreationEvents(dcaAccount);
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
      console.log("Got account strategies for", strategies);
      setAccountStrategies(accountAddress, strategies);
      setStrategies(strategies);
      return strategies;
    },
    [Signer, accountStrategies, setAccountStrategies, setStrategies]
  );

  const getAccountStrategyBaseRemaining = useCallback(
    async (accountAddress: string, baseToken: TokenData) => {
      const strategies = await fetchAccountStrategies(accountAddress);
      const costArray = buildAccountStrategyIntervalCost(strategies, baseToken);

      // Check local state for the base token balance
      const baseTokenBalance =
        tokenBalances[accountAddress]?.[baseToken.contractAddress as string]
          ?.balance;

      // If balance is not found in local state, fetch it
      const finalBaseTokenBalance = baseTokenBalance;
      return calculateExecutionsLeft(Number(finalBaseTokenBalance), costArray);
    },
    [fetchAccountStrategies, tokenBalances]
  );

  const fetchExecutionEvents = useCallback(
    async (accountAddress: string, strategyId: number) => {
      const dcaAccount = await getOrCreateAccountInstance(accountAddress);
      if (!dcaAccount) return [];
      const executionEvents = await getStrategyExecutionEvents(
        dcaAccount,
        strategyId
      );
      return executionEvents;
    },
    [getOrCreateAccountInstance]
  );

  const processExecutionEvents = useCallback(
    (executionEvents: AccountStrategyExecutionEvent[]) => {
      const executionCount = executionEvents.length;
      const lastExecution = executionEvents.reduce((latest, event) => {
        return event.blockNumber > latest ? event.blockNumber : latest;
      }, 0);

      const totalAmountReturned = executionEvents.reduce((total, event) => {
        return total + BigInt(event.amountIn);
      }, BigInt(0));

      setTotalExecutions(executionCount);
      // Update other stats as needed
    },
    []
  );

  const fetchTokenBalances = useCallback(
    async (
      accountAddress: string,
      strategies: IDCADataStructures.StrategyStruct[],
      dcaAccount: DCAAccount
    ) => {
      if (!Signer) return {};

      console.log("Starting fetchTokenBalances for:", accountAddress);

      const balances: TokenBalances = {};

      try {
        // Get unique tokens from strategies
        const uniqueTokens = new Set<string>();
        strategies.forEach((strategy) => {
          uniqueTokens.add(strategy.baseToken.tokenAddress.toString());
          uniqueTokens.add(strategy.targetToken.tokenAddress.toString());
        });

        console.log("Unique tokens to fetch:", Array.from(uniqueTokens));

        // Fetch balances for each token
        await Promise.all(
          Array.from(uniqueTokens).map(async (tokenAddress) => {
            try {
              console.log(`Fetching balances for token ${tokenAddress}`);

              const baseBalance = await dcaAccount.getBaseBalance(tokenAddress);
              const targetBalance = await dcaAccount.getTargetBalance(
                tokenAddress
              );

              console.log(`Balances for token ${tokenAddress}:`, {
                baseBalance: baseBalance.toString(),
                targetBalance: targetBalance.toString(),
              });

              // Get strategies that use this token as base token
              const relevantStrategies = strategies.filter(
                (s) => s.baseToken.tokenAddress.toString() === tokenAddress
              );

              // Calculate total amount needed per execution
              const totalPerExecution = relevantStrategies.reduce(
                (sum, strategy) => sum + BigInt(strategy.amount),
                BigInt(0)
              );

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
              balances[tokenAddress] = {
                balance: BigInt(0),
                targetBalance: BigInt(0),
                remainingExecutions: 0,
                needsTopUp: false,
              };
            }
          })
        );

        console.log("Final balances for account:", {
          accountAddress,
          balances: Object.fromEntries(
            Object.entries(balances).map(([key, value]) => [
              key,
              {
                ...value,
                balance: value.balance.toString(),
                targetBalance: value.targetBalance.toString(),
              },
            ])
          ),
        });

        return balances;
      } catch (error) {
        console.error("Error in fetchTokenBalances:", error);
        return {};
      }
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

  const getAllData = useCallback(async () => {
    console.log("[useAccountStats] getAllData Account object", accounts);
    if (!accounts.length) return;

    console.log(
      "[useAccountStats] Starting getAllData with accounts:",
      accounts
    );
    setIsLoading(true);

    try {
      const newTokenBalances: { [accountAddress: string]: TokenBalances } = {};

      await Promise.all(
        accounts.map(async (accountAdd) => {
          const accountAddress = accountAdd as string;
          console.log(
            "[useAccountStats] Fetching data for account:",
            accountAddress
          );

          // Get DCA account instance first
          const dcaAccount = await getOrCreateAccountInstance(accountAddress);
          if (!dcaAccount) {
            console.error(
              "[useAccountStats] Failed to get DCA account instance for:",
              accountAddress
            );
            return;
          }

          // Fetch strategies first
          const strategies = await fetchAccountStrategies(accountAddress);
          console.log("[useAccountStats] Fetched strategies for account:", {
            accountAddress,
            strategies,
          });

          // Store strategies in account store
          setAccountStrategies(accountAddress, strategies);

          // Fetch balances only if they are not already fetched
          if (!tokenBalances[accountAddress]) {
            const balances = await fetchTokenBalances(
              accountAddress,
              strategies,
              dcaAccount
            );
            console.log("[useAccountStats] Fetched balances for account:", {
              accountAddress,
              balances: Object.fromEntries(
                Object.entries(balances).map(([key, value]) => [
                  key,
                  {
                    ...value,
                    balance: value.balance.toString(),
                    targetBalance: value.targetBalance.toString(),
                  },
                ])
              ),
            });

            // Store balances in our accumulator
            newTokenBalances[accountAddress] = balances;
          }

          // Fetch execution events
          const executionEvents = await Promise.all(
            strategies.map((strategy) =>
              fetchExecutionEvents(accountAddress, Number(strategy.strategyId))
            )
          );
          executionEvents.forEach(processExecutionEvents);

          // Calculate execution timings
          const timings = await calculateExecutionTimings(
            accountAddress,
            strategies
          );
          setExecutionTimings((prev) => ({
            ...prev,
            [accountAddress]: timings,
          }));
        })
      );

      // Update all token balances at once
      console.log(
        "[useAccountStats] Setting new token balances:",
        newTokenBalances
      );
      setTokenBalances(newTokenBalances);
      setLastRefresh(Date.now());
    } catch (error) {
      console.error("[useAccountStats] Error in getAllData:", error);
    } finally {
      setIsLoading(false);
    }
  }, [
    isLoading,
    Signer,
    accounts,
    getOrCreateAccountInstance,
    fetchAccountStrategies,
    setAccountStrategies,
    tokenBalances,
    processExecutionEvents,
    calculateExecutionTimings,
    fetchTokenBalances,
    fetchExecutionEvents,
  ]);

  return {
    isLoading,
    totalExecutions,
    tokenBalances,
    executionTimings,
    getAllData,
    fetchAccountStrategies,
    fetchTokenBalances,
    lastRefresh,
  };
}
