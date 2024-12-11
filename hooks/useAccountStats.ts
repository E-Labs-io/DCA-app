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

interface StrategyExecutionTiming {
  lastExecution: number;
  nextExecution: number;
}

interface ExecutionTimings {
  [strategyId: string]: StrategyExecutionTiming;
}

export function useAccountStats() {
  const { getUsersAccounts } = useDCAFactory();
  const { 
    accounts, 
    setAccounts, 
    accountStrategies, 
    setAccountStrategies, 
    accountInstances,
    setAccountInstance 
  } = useAccountStore();
  const { strategies, setStrategies } = useStrategyStore();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [totalExecutions, setTotalExecutions] = useState<number>(0);
  const [tokenBalances, setTokenBalances] = useState<{ [accountAddress: string]: TokenBalances }>({});
  const [executionTimings, setExecutionTimings] = useState<{ [accountAddress: string]: ExecutionTimings }>({});

  const { Signer } = useSigner();

  const getOrCreateAccountInstance = useCallback(async (accountAddress: string) => {
    const address = accountAddress.toString();
    let dcaAccount = accountInstances[address];
    
    if (!dcaAccount && Signer) {
      dcaAccount = await connectToDCAAccount(address, Signer);
      if (dcaAccount) {
        setAccountInstance(address, dcaAccount);
      }
    }
    
    return dcaAccount;
  }, [accountInstances, Signer, setAccountInstance]);

  const fetchTokenBalances = useCallback(async (accountAddress: string, strategies: IDCADataStructures.StrategyStruct[], dcaAccount: DCAAccount) => {
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
      Object.entries(tokenStrategies).map(async ([tokenAddress, strategies]) => {
        const balance = await dcaAccount.getBaseBalance(tokenAddress);
        
        // Calculate total amount needed per execution for this token
        const totalPerExecution = strategies.reduce((sum, strategy) => {
          return strategy.active ? sum + BigInt(strategy.amount) : sum;
        }, BigInt(0));

        // Calculate remaining executions
        const remainingExecutions = totalPerExecution > 0 
          ? Number(balance / totalPerExecution)
          : 0;

        balances[tokenAddress] = {
          balance,
          remainingExecutions,
          needsTopUp: remainingExecutions < 5
        };
      })
    );

    return balances;
  }, [Signer]);

  const calculateExecutionTimings = useCallback(async (
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

    await Promise.all(
      strategies.map(async (strategy) => {
        try {
          const executions = await getStrategyExecutionEvents(
            dcaAccount,
            Number(strategy.strategyId)
          );

          // Sort executions by block number to get the latest
          const sortedExecutions = executions.sort((a, b) => b.blockNumber - a.blockNumber);
          const lastExecution = sortedExecutions[0]?.blockNumber || 0;

          // Calculate next execution time
          const nextExecution = lastExecution > 0
            ? lastExecution + Number(strategy.interval)
            : currentTime + Number(strategy.interval);

          timings[strategy.strategyId.toString()] = {
            lastExecution,
            nextExecution,
          };
        } catch (error) {
          console.error(`Error fetching execution timing for strategy ${strategy.strategyId}:`, error);
        }
      })
    );

    return timings;
  }, [Signer, getOrCreateAccountInstance]);

  const fetchAccountStrategies = useCallback(
    async (accountAddress: string) => {
      if (!Signer) return [];
      setIsLoading(true);

      try {
        const dcaAccount = await getOrCreateAccountInstance(accountAddress);
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
        
        setAccountStrategies(accountAddress, strategies);
        setStrategies(strategies);

        // Fetch token balances for this account
        const balances = await fetchTokenBalances(accountAddress, strategies, dcaAccount);
        setTokenBalances(prev => ({
          ...prev,
          [accountAddress]: balances
        }));

        // Calculate execution timings
        const timings = await calculateExecutionTimings(accountAddress, strategies);
        setExecutionTimings(prev => ({
          ...prev,
          [accountAddress]: timings
        }));

        return strategies;
      } catch (error) {
        console.error("Error fetching strategies:", error);
        return [];
      }
    },
    [
      Signer,
      setAccountStrategies,
      setStrategies,
      fetchTokenBalances,
      calculateExecutionTimings,
      getOrCreateAccountInstance
    ]
  );

  const fetchStrategyExecutions = useCallback(
    async (accountAddress: string) => {
      if (!Signer) return [];
      setIsLoading(true);

      try {
        const dcaAccount = await getOrCreateAccountInstance(accountAddress);
        if (!dcaAccount) return [];

        const strategies = accountStrategies[accountAddress] || await fetchAccountStrategies(accountAddress);
        const executionData: AccountStrategyExecutionEvent[] = (
          await Promise.all(
            strategies.map((strategy) =>
              getStrategyExecutionEvents(dcaAccount, Number(strategy.strategyId))
            )
          )
        ).flat();

        return executionData;
      } catch (error) {
        console.error("Error fetching executions:", error);
        return [];
      }
    },
    [Signer, fetchAccountStrategies, accountStrategies, getOrCreateAccountInstance]
  );

  const calculateTotalExecutions = useCallback(async () => {
    let executionCount = 0;

    for (const account of accounts) {
      const executionData = await fetchStrategyExecutions(account.toString());
      executionCount += executionData.length;
    }

    setTotalExecutions(executionCount);
  }, [accounts, fetchStrategyExecutions]);

  const getAllData = useCallback(async () => {
    if (accounts.length === 0) {
      const userAccounts = await getUsersAccounts();
      setAccounts(userAccounts as `0x${string}`[]);
    }

    setIsLoading(true);

    await Promise.all(
      accounts.map(async (accountAddress) => {
        const address = accountAddress.toString();
        if (!accountStrategies[address]) {
          await fetchAccountStrategies(address);
        }
        await fetchStrategyExecutions(address);
      })
    );

    await calculateTotalExecutions();

    setIsLoading(false);
  }, [
    getUsersAccounts,
    setAccounts,
    fetchAccountStrategies,
    fetchStrategyExecutions,
    calculateTotalExecutions,
    accounts,
    accountStrategies,
  ]);

  useEffect(() => {
    getAllData();
  }, [getAllData]);

  return {
    getAllData,
    isLoading,
    totalExecutions,
    tokenBalances,
    executionTimings,
  };
}
