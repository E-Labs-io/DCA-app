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

export function useAccountStats() {
  const { getUsersAccounts } = useDCAFactory();
  const { accounts, setAccounts, accountStrategies, setAccountStrategies } = useAccountStore();
  const { strategies, setStrategies } = useStrategyStore();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [totalExecutions, setTotalExecutions] = useState<number>(0);

  const { Signer } = useSigner();

  const fetchAccountStrategies = useCallback(
    async (accountAddress: string) => {
      if (!Signer) return [];
      setIsLoading(true);

      try {
        const dcaAccount: DCAAccount = await connectToDCAAccount(
          accountAddress,
          Signer
        );
        if (!dcaAccount) return [];

        const strategyEvents = await getAccountStrategyCreationEvents(dcaAccount);
        const strategies = await Promise.all(
          strategyEvents.map(async (event) => {
            const strategyData = await dcaAccount.getStrategyData(event.id);
            return { ...event, ...strategyData };
          })
        );
        setAccountStrategies(accountAddress, strategies);
        setStrategies(strategies);

        return strategies;
      } catch (error) {
        console.error("Error fetching strategies:", error);
        return [];
      }
    },
    [Signer, setAccountStrategies, setStrategies]
  );

  const fetchStrategyExecutions = useCallback(
    async (accountAddress: string) => {
      if (!Signer) return [];
      setIsLoading(true);

      try {
        const dcaAccount: DCAAccount = await connectToDCAAccount(
          accountAddress,
          Signer
        );
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
    [Signer, fetchAccountStrategies, accountStrategies]
  );

  const calculateTotalExecutions = useCallback(async () => {
    let executionCount = 0;

    for (const account of accounts) {
      const executionData = await fetchStrategyExecutions(account);
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
        if (!accountStrategies[accountAddress]) {
          await fetchAccountStrategies(accountAddress);
        }
        await fetchStrategyExecutions(accountAddress);
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
  };
}
