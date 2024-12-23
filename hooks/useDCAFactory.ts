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

export function useDCAFactory() {
  const { Signer, ACTIVE_NETWORK } = useSigner();

  const { address } = useAppKitAccount();
  const [DCAFactory, setDCAFactory] = useState<DCAFactory | null>(null);
  const [DCA_FACTORY_ADDRESS, setDCA_FACTORY_ADDRESS] = useState<string>();

  useEffect(() => {
    if (Signer && DCAFactory === null) {
      const factoryAddress = DCAFactoryAddress[ACTIVE_NETWORK!]!;
      connectToDCAFactory(factoryAddress, Signer).then((factory) => {
        setDCAFactory(factory);
      });
      setDCA_FACTORY_ADDRESS(factoryAddress);
    }
  }, [Signer, DCA_FACTORY_ADDRESS, DCAFactory, ACTIVE_NETWORK]);

  useEffect(() => {
    if (Signer) {
      const factoryAddress = DCAFactoryAddress[ACTIVE_NETWORK!]!;
      connectToDCAFactory(factoryAddress, Signer).then((factory) => {
        setDCAFactory(factory);
      });
      setDCA_FACTORY_ADDRESS(factoryAddress);
    }
  }, [ACTIVE_NETWORK]);

  const getUsersAccountAddresses = useCallback(async (): Promise<string[]> => {
    if (!Signer || !address) {
      toast.error("Please connect your wallet first");
      throw new Error("[useDCAFactory] No signer available");
    }
    const factory = await connectToDCAFactory(DCA_FACTORY_ADDRESS!, Signer);
    const accounts: string[] = await factory.getDCAAccountsOfUser(address);
    const accountList: string[] = [];
    const keys = Object.keys(accounts);
    for (const key of keys) {
      const account = accounts[key as keyof typeof accounts];
      if (typeof account === "string") {
        accountList.push(account);
      }
    }
    return accountList;
  }, [Signer, address, DCA_FACTORY_ADDRESS]);

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
  }, [Signer, address, DCAFactory]);

  return {
    DCAFactory,
    DCA_FACTORY_ADDRESS,
    createAccount,
    getUsersAccountAddresses,
  };
}
