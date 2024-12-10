/** @format */

"use client";

import { useCallback, useState } from "react";
import {
  useAppKit,
  useAppKitAccount,
  useAppKitProvider,
} from "@reown/appkit/react";
import { toast } from "sonner";
import { IDCADataStructures } from "@/types/contracts/contracts/base/DCAAccount";
import { connectToDCAAccount } from "./helpers/connectToContract";
import useSigner from "./useSigner";
import { ContractTransactionReport } from "@/types/contractReturns";

export function useDCAAccount(accountAddress: string) {
  const { address } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider("eip155");
  const { Signer } = useSigner();

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
        const dcaAccount = await connectToDCAAccount(accountAddress, Signer);
        if (!dcaAccount) throw "error connecting to account";
        const tx = await dcaAccount.SetupStrategy(
          strategy,
          fundAmount,
          subscribe
        );
        return { tx, hash: tx.hash };
      } catch (error: any) {
        console.error("Error creating strategy:", error);
        if (error.code === 4001 || error.message?.includes("rejected")) {
          throw error;
        }
        toast.error("Failed to create strategy");
        return false;
      }
    },
    [Signer, address, accountAddress]
  );

  const fundAccount = useCallback(async () => {
    if (!Signer || !address) {
      toast.error("Please connect your wallet first");
      throw new Error("No signer available");
    }
  }, [Signer, address, accountAddress]);

  return {
    createStrategy,
    fundAccount,
  };
}
