/** @format */

"use client";

import { useCallback, useEffect, useState } from "react";
import { useAppKitAccount } from "@reown/appkit/react";
import { toast } from "sonner";
import {
  DCAAccount,
  IDCADataStructures,
} from "@/types/contracts/contracts/base/DCAAccount";
import { connectToDCAAccount } from "./helpers/connectToContract";
import useSigner from "./useSigner";
import { ContractTransactionReport } from "@/types/contractReturns";
import { BigNumberish } from "ethers";
import { EthereumAddress } from "@/types/generic";
import { TokenData } from "@/constants/tokens";
import { useAccountStore } from "@/lib/store/accountStore";

export function useDCAAccount(accountAddress?: EthereumAddress) {
  const { address } = useAppKitAccount();
  const { Signer } = useSigner();
  const { accountStrategies } = useAccountStore();

  const getOrCreateAccountInstance = useCallback(async () => {
    if (!accountAddress || !Signer) return null;

    try {
      return await connectToDCAAccount(accountAddress.toString(), Signer);
    } catch (error) {
      console.error("Error connecting to DCA account:", error);
      return null;
    }
  }, [accountAddress, Signer]);

  const createStrategy = useCallback(
    async ({
      strategy,
      fundAmount,
      subscribe,
    }: {
      strategy: IDCADataStructures.StrategyStruct;
      fundAmount: bigint;
      subscribe: boolean;
    }): Promise<ContractTransactionReport | false> => {
      if (!Signer || !address) {
        toast.error("Please connect your wallet first");
        throw new Error("No signer available");
      }

      try {
        const dcaAccount = await getOrCreateAccountInstance();
        if (!dcaAccount) throw new Error("Error connecting to account");

        const tx = await dcaAccount.SetupStrategy(
          strategy,
          fundAmount,
          subscribe
        );
        return { tx, hash: tx.hash };
      } catch (error: any) {
        if (error.code === 4001 || error.message?.includes("rejected")) {
          throw error;
        }
        console.error("Error creating strategy:", error);
        toast.error("Failed to create strategy");
        return false;
      }
    },
    [Signer, address, getOrCreateAccountInstance]
  );

  const fundAccount = useCallback(
    async (token: IDCADataStructures.TokenDataStruct, amount: bigint) => {
      if (!Signer || !address) {
        toast.error("Please connect your wallet first");
        throw new Error("No signer available");
      }

      try {
        const dcaAccount = await getOrCreateAccountInstance();
        if (!dcaAccount) throw new Error("Error connecting to account");
        toast.info("Please accept the Funding Transaction...");
        const tx = await dcaAccount.FundAccount(token.tokenAddress, amount);
        toast.loading("Funding Transaction Approved...");
        await tx.wait();
        toast.success("Funding Transaction Approved.");
        return { tx, hash: tx.hash };
      } catch (error: any) {
        console.error("Error funding account:", error);
        return false;
      }
    },
    [Signer, address, getOrCreateAccountInstance]
  );

  const defundAccount = useCallback(
    async (token: IDCADataStructures.TokenDataStruct, amount: bigint) => {
      if (!Signer || !address) {
        toast.error("Please connect your wallet first");
        throw new Error("No signer available");
      }

      try {
        const dcaAccount = await getOrCreateAccountInstance();
        if (!dcaAccount) throw new Error("Error connecting to account");

        const tx = await dcaAccount.UnFundAccount(token.tokenAddress, amount);
        return { tx, hash: tx.hash };
      } catch (error: any) {
        console.error("Error withdrawing funds from account:", error);
        return false;
      }
    },
    [Signer, address, getOrCreateAccountInstance]
  );

  const WithdrawSavings = useCallback(
    async (token: IDCADataStructures.TokenDataStruct, amount: bigint) => {
      if (!Signer || !address) {
        toast.error("Please connect your wallet first");
        throw new Error("No signer available");
      }

      try {
        const dcaAccount = await getOrCreateAccountInstance();
        if (!dcaAccount) throw new Error("Error connecting to account");

        const tx = await dcaAccount.WithdrawSavings(token.tokenAddress, amount);
        return { tx, hash: tx.hash };
      } catch (error: any) {
        console.error("Error withdrawing target token:", error);
        return false;
      }
    },
    [Signer, address, getOrCreateAccountInstance]
  );

  const subscribeStrategy = useCallback(
    async (strategyId: BigNumberish) => {
      if (!Signer || !address) {
        toast.error("Please connect your wallet first");
        throw new Error("No signer available");
      }

      try {
        const dcaAccount = await getOrCreateAccountInstance();
        if (!dcaAccount) throw new Error("Error connecting to account");

        const tx = await dcaAccount.SubscribeStrategy(strategyId);
        return { tx, hash: tx.hash };
      } catch (error: any) {
        if (error.code === 4001 || error.message?.includes("rejected")) {
          throw error;
        }
        console.error("Error subscribing to strategy:", error);
        toast.error("Failed to subscribe to strategy");
        return false;
      }
    },
    [Signer, address, getOrCreateAccountInstance]
  );

  const unsubscribeStrategy = useCallback(
    async (strategyId: BigNumberish) => {
      if (!Signer || !address) {
        toast.error("Please connect your wallet first");
        throw new Error("No signer available");
      }

      try {
        const dcaAccount = await getOrCreateAccountInstance();
        if (!dcaAccount) throw new Error("Error connecting to account");

        const tx = await dcaAccount.UnsubscribeStrategy(strategyId);
        return { tx, hash: tx.hash };
      } catch (error: any) {
        if (error.code === 4001 || error.message?.includes("rejected")) {
          throw error;
        }
        console.error("Error unsubscribing from strategy:", error);
        toast.error("Failed to unsubscribe from strategy");
        return false;
      }
    },
    [Signer, address, getOrCreateAccountInstance]
  );

  const getBaseBalance = useCallback(
    async (tokenAddress: EthereumAddress): Promise<number> => {
      if (!Signer || !address) {
        toast.error("Please connect your wallet first");
        throw new Error("No signer available");
      }

      try {
        const dcaAccount = await getOrCreateAccountInstance();
        if (!dcaAccount) throw new Error("Error connecting to account");

        const balance = await dcaAccount.getBaseBalance(tokenAddress);
        return Number(balance);
      } catch (error: any) {
        console.error("Error getting base balance:", error);
        return 0;
      }
    },
    [Signer, address, getOrCreateAccountInstance]
  );

  const getAccountBaseTokens = () => {
    const strategies = accountStrategies[accountAddress as string] || [];
    const tokens = strategies.map((strategy) => strategy.baseToken);
    return Array.from(
      new Map(tokens.map((token) => [token.ticker, token])).values()
    );
  };

  const getAccountTargetTokens = () => {
    const strategies = accountStrategies[accountAddress as string] || [];
    const tokens = strategies.map((strategy) => strategy.targetToken);
    return Array.from(
      new Map(tokens.map((token) => [token.ticker, token])).values()
    );
  };

  return {
    createStrategy,
    fundAccount,
    defundAccount,
    WithdrawSavings,
    subscribeStrategy,
    unsubscribeStrategy,
    getBaseBalance,
    getOrCreateAccountInstance,
    getAccountBaseTokens,
    getAccountTargetTokens,
  };
}
