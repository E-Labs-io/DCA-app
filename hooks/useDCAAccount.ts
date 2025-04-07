/** @format */

"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import {
  DCAAccount,
  IDCADataStructures,
} from "@/types/contracts/contracts/base/DCAAccount";
import { ContractTransactionReport } from "@/types/contractReturns";
import { BigNumberish, Signer } from "ethers";
import { EthereumAddress } from "@/types/generic";

export function useDCAAccount(dcaAccount: DCAAccount, Signer: Signer) {


  
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
      if (!Signer) {
        toast.error("Please connect your wallet first");
        throw new Error("No signer available");
      }

      try {
        if (!dcaAccount) throw new Error("Error connecting to account");

        const loadingToastId = toast.loading("Creating strategy...");
        const tx = await dcaAccount.SetupStrategy(
          strategy,
          fundAmount,
          subscribe
        );
        
        // Wait for transaction to be mined to get strategyId from events
        const receipt = await tx.wait();
        toast.dismiss(loadingToastId);
        
        // Find the StrategyCreated event in the transaction receipt
        const strategyCreatedEvent = receipt.logs.find(
          (log: any) => 
            log.topics[0] === dcaAccount.interface.getEvent('StrategyCreated').topicHash
        );
        
        if (strategyCreatedEvent) {
          // Parse the event to get the strategyId
          const parsedEvent = dcaAccount.interface.parseLog(strategyCreatedEvent);
          const newStrategyId = parsedEvent?.args[0]; // First arg is strategyId
          
          // If we got a strategyId, update the UI manually
          if (newStrategyId) {
            // Fetch the complete strategy data with the right ID
            const strategyData = await dcaAccount.GetStrategy(newStrategyId);
            
            // Force a refresh by dispatching a custom event
            window.dispatchEvent(new CustomEvent('strategy-created', { 
              detail: { 
                accountAddress: dcaAccount.target,
                strategyId: Number(newStrategyId)
              } 
            }));
          }
        }
        
        toast.success("Strategy created successfully!");
        return { tx, hash: tx.hash };
      } catch (error: any) {
        if (error.code === 4001 || error.message?.includes("rejected")) {
          toast.error("Transaction was rejected");
          throw error;
        }
        console.error("Error creating strategy:", error);
        toast.error("Failed to create strategy");
        return false;
      }
    },
    [Signer, dcaAccount]
  );

  const fundAccount = useCallback(
    async (token: IDCADataStructures.TokenDataStruct, amount: bigint) => {
      if (!Signer) {
        toast.error("Please connect your wallet first");
        throw new Error("No signer available");
      }

      try {
        if (!dcaAccount) throw new Error("Error connecting to account");
        toast.info("Please accept the Funding Transaction...");
        const tx = await dcaAccount.FundAccount(token.tokenAddress, amount);
        toast.loading("Funding Transaction is Confirming...");
        await tx.wait();
        toast.success("Funding Transaction Approved.");
        return { tx, hash: tx.hash };
      } catch (error: any) {
        console.error("Error funding account:", error);
        return false;
      }
    },
    [Signer, dcaAccount]
  );

  const defundAccount = useCallback(
    async (token: IDCADataStructures.TokenDataStruct, amount: bigint) => {
      if (!Signer) {
        toast.error("Please connect your wallet first");
        throw new Error("No signer available");
      }

      try {
        if (!dcaAccount) throw new Error("Error connecting to account");
        toast.info("Please accept the Transaction...");

        const tx = await dcaAccount.UnFundAccount(token.tokenAddress, amount);
        toast.loading("Transaction is Confirming...");
        await tx.wait();
        toast.success("Transaction Approved.");
        return { tx, hash: tx.hash };
      } catch (error: any) {
        console.error("Error withdrawing funds from account:", error);
        return false;
      }
    },
    [Signer, dcaAccount]
  );

  const withdrawSavings = useCallback(
    async (token: IDCADataStructures.TokenDataStruct, amount: bigint) => {
      if (!Signer) {
        toast.error("Please connect your wallet first");
        throw new Error("No signer available");
      }

      try {
        if (!dcaAccount) throw new Error("Error connecting to account");

        toast.info("Please accept the Withdrawal Transaction");
        const tx = await dcaAccount.WithdrawSavings(token.tokenAddress, amount);
        toast.loading("Withdrawal Transaction Confirming...");
        await tx.wait();
        toast.success("Withdrawal Transaction Approved.");

        return { tx, hash: tx.hash };
      } catch (error: any) {
        console.error("Error withdrawing target token:", error);
        return false;
      }
    },
    [Signer, dcaAccount]
  );

  const subscribeStrategy = useCallback(
    async (strategyId: BigNumberish) => {
      if (!Signer) {
        toast.error("Please connect your wallet first");
        throw new Error("No signer available");
      }

      try {
        if (!dcaAccount) throw new Error("Error connecting to account");

        toast.info("Please accept the transaction...");
        const tx = await dcaAccount.SubscribeStrategy(strategyId);
        toast.loading("Transaction is confirming...");
        await tx.wait();
        toast.success("Account was subscribed to the Executor");
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
    [Signer, dcaAccount]
  );

  const unsubscribeStrategy = useCallback(
    async (strategyId: BigNumberish) => {
      if (!Signer) {
        toast.error("Please connect your wallet first");
        throw new Error("No signer available");
      }

      try {
        if (!dcaAccount) throw new Error("Error connecting to account");
        toast.info("Please accept the transaction...");
        const tx = await dcaAccount.UnsubscribeStrategy(strategyId);
        toast.loading("Transaction is confirming...");
        await tx.wait();
        toast.success("Account was unsubscribed to the Executor");
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
    [Signer, dcaAccount]
  );

  const getBaseBalance = useCallback(
    async (tokenAddress: EthereumAddress): Promise<number> => {
      if (!Signer) {
        toast.error("Please connect your wallet first");
        throw new Error("No signer available");
      }

      try {
        if (!dcaAccount) throw new Error("Error connecting to account");

        const balance = await dcaAccount.getBaseBalance(tokenAddress);
        return Number(balance);
      } catch (error: any) {
        console.error("Error getting base balance:", error);
        return 0;
      }
    },
    [Signer, dcaAccount]
  );

  const getTargetBalance = useCallback(
    async (tokenAddress: EthereumAddress): Promise<number> => {
      if (!Signer) {
        toast.error("Please connect your wallet first");
        throw new Error("No signer available");
      }

      try {
        if (!dcaAccount) throw new Error("Error connecting to account");

        const balance = await dcaAccount.getTargetBalance(tokenAddress);
        return Number(balance);
      } catch (error: any) {
        console.error("Error getting base balance:", error);
        return 0;
      }
    },
    [Signer, dcaAccount]
  );

  const getAccountBaseTokens = (
    strategies: IDCADataStructures.StrategyStruct[]
  ) => {
    const tokens = strategies.map((strategy) => strategy.baseToken);
    return Array.from(
      new Map(tokens.map((token) => [token.ticker, token])).values()
    );
  };

  const getAccountTargetTokens = (
    strategies: IDCADataStructures.StrategyStruct[]
  ) => {
    const tokens = strategies.map((strategy) => strategy.targetToken);
    return Array.from(
      new Map(tokens.map((token) => [token.ticker, token])).values()
    );
  };

  return {
    createStrategy,
    fundAccount,
    defundAccount,
    withdrawSavings,
    subscribeStrategy,
    unsubscribeStrategy,
    getBaseBalance,
    getTargetBalance,
    getAccountBaseTokens,
    getAccountTargetTokens,
  };
}
