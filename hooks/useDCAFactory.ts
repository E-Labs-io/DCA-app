/** @format */

"use client";

import { useCallback, useState } from "react";
import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";
import { BrowserProvider, ethers } from "ethers";
import { toast } from "sonner";
import { DCAFactoryAddress } from "@/constants/contracts";
import { connectToDCAFactory } from "./helpers/connectToContract";
import { Signer } from "ethers";
import { Provider } from "ethers";
import { ContractTransactionReport } from "@/types/contractReturns";

const DCA_FACTORY_ADDRESS = DCAFactoryAddress.ETH_SEPOLIA!;

export function useDCAFactory() {
  const { address } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider("eip155");
  const [Signer, setSigner] = useState<Signer | null>(null);
  const [accounts, setAccounts] = useState<string[]>([]);

  const getProvider = useCallback(async () => {
    if (!Signer) {
      const provider = new BrowserProvider(walletProvider as any);
      const newSigner = await provider.getSigner();
      setSigner(newSigner);
      return newSigner;
    }
    return Signer;
  }, [Signer, walletProvider]);

  const getUsersAccounts = useCallback(async (): Promise<string[]> => {
    const signer = await getProvider();
    if (!signer || !address) {
      toast.error("Please connect your wallet first");
      throw new Error("No signer available");
    }

    const factory = await connectToDCAFactory(DCA_FACTORY_ADDRESS, signer);
    const accounts: string[] = await factory.getDCAAccountsOfUser(address);
    setAccounts(accounts);
    return accounts;
  }, [address, getProvider]);

  const createAccount = useCallback(async (): Promise<
    ContractTransactionReport | false
  > => {
    const signer = await getProvider();

    if (!signer || !address) {
      toast.error("Please connect your wallet first");
      throw new Error("No signer available");
    }

    try {
      const factory = await connectToDCAFactory(DCA_FACTORY_ADDRESS, signer);
      const tx = await factory.CreateAccount();

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
  }, [address, getProvider]);

  return {
    createAccount,
    getUsersAccounts,
    accounts,
  };
}
