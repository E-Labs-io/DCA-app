/** @format */

"use client";

import { useCallback, useEffect, useState } from "react";
import { useAppKitAccount } from "@reown/appkit/react";
import { toast } from "sonner";
import { DCAFactoryAddress } from "@/constants/contracts";
import { connectToDCAFactory } from "./helpers/connectToContract";

import { ContractTransactionReport } from "@/types/contractReturns";
import { DCAFactory } from "@/types/contracts";
import useSigner from "./useSigner";

const DCA_FACTORY_ADDRESS = DCAFactoryAddress.ETH_SEPOLIA!;

export function useDCAFactory() {
  const { address } = useAppKitAccount();
  const { Signer } = useSigner();
  const [accounts, setAccounts] = useState<string[]>([]);
  const [DCAFactory, setDCAFactory] = useState<DCAFactory | null>(null);

  useEffect(() => {
    if (Signer) {
      connectToDCAFactory(DCA_FACTORY_ADDRESS, Signer).then((factory) =>
        setDCAFactory(factory)
      );
    }
  }, [Signer]);

  const getUsersAccounts = useCallback(async (): Promise<string[]> => {
    if (!Signer || !address) {
      toast.error("Please connect your wallet first");
      throw new Error("No signer available");
    }

    const factory = await connectToDCAFactory(DCA_FACTORY_ADDRESS, Signer);
    const accounts: string[] = await factory.getDCAAccountsOfUser(address);
    setAccounts(accounts);
    return accounts;
  }, [address, Signer]);

  const createAccount = useCallback(async (): Promise<
    ContractTransactionReport | false
  > => {
    if (!Signer || !address) {
      toast.error("Please connect your wallet first");
      throw new Error("No signer available");
    }

    if (!DCAFactory) throw new Error("DCA Factory not found");
    try {
      const tx = await DCAFactory.CreateAccount();

      await tx.wait();

      return { tx, hash: tx.hash };
    } catch (error: any) {
      console.error("Error creating DCA account:", error);
      if (error.code === 4001 || error.message?.includes("rejected")) {
        throw error;
      }
      toast.error("Failed to create DCA account");
      return false;
    }
  }, [address, Signer]);

  return { DCAFactory, createAccount, getUsersAccounts, accounts };
}
