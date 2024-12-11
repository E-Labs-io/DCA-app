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

export function useDCAAccount(accountAddress?: EthereumAddress) {
  const { address } = useAppKitAccount();
  const { Signer } = useSigner();

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
    async (token: IDCADataStructures.TokenDataStruct, amount: number) => {
      if (!Signer || !address) {
        toast.error("Please connect your wallet first");
        throw new Error("No signer available");
      }

      try {
        const dcaAccount = await getOrCreateAccountInstance();
        if (!dcaAccount) throw new Error("Error connecting to account");

        const tx = await dcaAccount.FundAccount(token.tokenAddress, amount);
        return { tx, hash: tx.hash };
      } catch (error: any) {
        console.error("Error funding account:", error);
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

  return {
    createStrategy,
    fundAccount,
    subscribeStrategy,
    unsubscribeStrategy,
    getBaseBalance,
    getOrCreateAccountInstance,
  };
}
