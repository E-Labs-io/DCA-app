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

  const debugContractInterface = useCallback(async () => {
    if (!Signer || !DCA_FACTORY_ADDRESS) {
      console.log("[useDCAFactory] Missing signer or factory address");
      return;
    }

    try {
      const factory = await connectToDCAFactory(DCA_FACTORY_ADDRESS, Signer);
      console.log("[useDCAFactory] Factory instance:", factory);
      console.log("[useDCAFactory] Factory address:", DCA_FACTORY_ADDRESS);
      console.log("[useDCAFactory] Factory interface:", factory.interface);

      // List all available functions
      console.log(
        "[useDCAFactory] Available functions:",
        factory.interface.fragments
          .filter((f) => f.type === "function")
          .map((f) => (f as any).name)
      );

      // Check if getAccountsOfUser exists
      const hasFunction = factory.interface.hasFunction("getAccountsOfUser");
      console.log(
        "[useDCAFactory] Has getAccountsOfUser function:",
        hasFunction
      );

      if (hasFunction) {
        const functionFragment =
          factory.interface.getFunction("getAccountsOfUser");
        console.log("[useDCAFactory] Function fragment:", functionFragment);
        console.log(
          "[useDCAFactory] Function selector:",
          factory.interface.getFunction("getAccountsOfUser").selector
        );
      }

      // Try to get the contract code to verify it's deployed
      const code = await Signer.provider?.getCode(DCA_FACTORY_ADDRESS);
      console.log("[useDCAFactory] Contract code length:", code?.length);

      return factory;
    } catch (error) {
      console.error("[useDCAFactory] Error in debugContractInterface:", error);
      return null;
    }
  }, [Signer, DCA_FACTORY_ADDRESS]);

  const getUsersAccountAddresses = useCallback(async (): Promise<string[]> => {
    if (!Signer || !address) {
      toast.error("Please connect your wallet first");
      throw new Error("[useDCAFactory] No signer available");
    }

    if (!DCA_FACTORY_ADDRESS || DCA_FACTORY_ADDRESS === "") {
      toast.error(`DCA Factory not deployed on ${ACTIVE_NETWORK}`);
      throw new Error(
        `[useDCAFactory] No factory address for ${ACTIVE_NETWORK}`
      );
    }

    try {
      console.log("[useDCAFactory] Debugging contract interface...");
      const factory = await debugContractInterface();

      if (!factory) {
        throw new Error("[useDCAFactory] Failed to connect to factory");
      }

      console.log(
        "[useDCAFactory] Attempting to call getAccountsOfUser with address:",
        address
      );
      console.log("[useDCAFactory] Factory address:", DCA_FACTORY_ADDRESS);

      // Try different approaches to call the function
      try {
        // Method 1: Direct call
        console.log("[useDCAFactory] Trying direct call...");
        const accounts: string[] = await factory.getAccountsOfUser(address);
        console.log(
          "[useDCAFactory] Direct call successful, accounts:",
          accounts
        );

        const accountList: string[] = [];
        const keys = Object.keys(accounts);
        for (const key of keys) {
          const account = accounts[key as keyof typeof accounts];
          if (typeof account === "string") {
            accountList.push(account);
          }
        }
        return accountList;
      } catch (directCallError) {
        console.error("[useDCAFactory] Direct call failed:", directCallError);

        // Method 2: Try using staticCall
        console.log("[useDCAFactory] Trying static call...");
        try {
          const result = await factory.getAccountsOfUser.staticCall(address);
          console.log("[useDCAFactory] Static call result:", result);
          return Array.isArray(result) ? result : [];
        } catch (staticCallError) {
          console.error(
            "[useDCAFactory] Static call also failed:",
            staticCallError
          );

          // Method 3: Try encoding and calling manually
          console.log("[useDCAFactory] Trying manual encoding...");
          const data = factory.interface.encodeFunctionData(
            "getAccountsOfUser",
            [address]
          );
          console.log("[useDCAFactory] Encoded data:", data);

          const result = await Signer.provider?.call({
            to: DCA_FACTORY_ADDRESS,
            data: data,
          });
          console.log("[useDCAFactory] Manual call result:", result);

          if (result && result !== "0x") {
            const decoded = factory.interface.decodeFunctionResult(
              "getAccountsOfUser",
              result
            );
            console.log("[useDCAFactory] Decoded result:", decoded);
            return decoded[0] || [];
          }

          throw staticCallError;
        }
      }
    } catch (error: any) {
      console.error("[useDCAFactory] Complete error details:", {
        message: error.message,
        code: error.code,
        data: error.data,
        reason: error.reason,
        transaction: error.transaction,
      });
      throw error;
    }
  }, [Signer, address, DCA_FACTORY_ADDRESS, debugContractInterface]);

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
    debugContractInterface, // Expose for debugging
  };
}
