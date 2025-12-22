/** @format */

"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import {
  DCAAccount,
  IDCADataStructures,
} from "@/types/contracts/contracts/base/DCAAccount";
import { ContractTransactionReport } from "@/types/contractReturns";
import { BigNumberish, Signer, keccak256, toUtf8Bytes } from "ethers";
import { EthereumAddress } from "@/types/generic";
import { clearAccountCache } from "@/hooks/helpers/getAccountEvents";

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

        console.log("[useDCAAccount] Creating strategy:", {
          accountAddress: dcaAccount.target,
          strategy: {
            baseToken: strategy.baseToken.ticker,
            targetToken: strategy.targetToken.ticker,
            amount: strategy.amount.toString(),
            interval: strategy.interval.toString(),
          },
          fundAmount: fundAmount.toString(),
          subscribe,
        });

        const loadingToastId = toast.loading("Creating strategy...");

        try {
          const tx = await dcaAccount.SetupStrategy(
            strategy,
            fundAmount,
            subscribe
          );

          console.log("[useDCAAccount] Transaction sent:", tx.hash);

          // Wait for transaction to be mined to get strategyId from events
          const receipt = await tx.wait();
          toast.dismiss(loadingToastId);

          console.log("[useDCAAccount] Transaction confirmed, receipt:", {
            transactionHash: receipt.hash,
            blockNumber: receipt.blockNumber,
            logsCount: receipt.logs.length,
          });

          // Find the StrategyCreated event in the transaction receipt
          const strategyCreatedEvent = receipt?.logs.find(
            (log: any) =>
              log.topics[0] ===
              dcaAccount.interface.getEvent("StrategyCreated").topicHash
          );

          console.log(
            "[useDCAAccount] Strategy created event found:",
            !!strategyCreatedEvent
          );

          if (strategyCreatedEvent) {
            // Parse the event to get the strategyId
            const parsedEvent =
              dcaAccount.interface.parseLog(strategyCreatedEvent);
            const newStrategyId = parsedEvent?.args[0]; // First arg is strategyId

            console.log(
              "[useDCAAccount] Parsed strategy ID:",
              newStrategyId?.toString()
            );

            // If we got a strategyId, update the UI manually
            if (newStrategyId) {
              // Clear the cache to ensure fresh data
              clearAccountCache(dcaAccount.target as string);

              // Fetch the complete strategy data with the right ID
              const strategyData = await dcaAccount.getStrategyData(
                newStrategyId
              );

              console.log("[useDCAAccount] Fetched strategy data:", {
                strategyId: strategyData.strategyId.toString(),
                active: strategyData.active,
                baseToken: strategyData.baseToken.ticker,
                targetToken: strategyData.targetToken.ticker,
              });

              // Force a refresh by dispatching a custom event
              const eventDetail = {
                accountAddress: dcaAccount.target,
                strategyId: Number(newStrategyId),
              };

              console.log(
                "[useDCAAccount] About to dispatch strategy-created event:",
                eventDetail
              );

              window.dispatchEvent(
                new CustomEvent("strategy-created", {
                  detail: eventDetail,
                })
              );

              console.log(
                "[useDCAAccount] Dispatched strategy-created event successfully"
              );
            } else {
              console.warn("[useDCAAccount] No strategy ID found in event");
            }
          } else {
            console.warn(
              "[useDCAAccount] No StrategyCreated event found in transaction logs"
            );
          }

          toast.success("Strategy created successfully!");
          return { tx, hash: tx.hash };
        } catch (setupError: any) {
          console.error("[useDCAAccount] SetupStrategy failed:", setupError);

          // Check if it's an "already subscribed" error and retry without subscription
          if (
            subscribe &&
            (setupError.message?.toLowerCase().includes("already") ||
              setupError.message?.toLowerCase().includes("subscribed") ||
              setupError.message?.toLowerCase().includes("subscription"))
          ) {
            console.warn(
              "[useDCAAccount] Retrying strategy creation without subscription"
            );
            toast.dismiss(loadingToastId);
            const retryToastId = toast.loading(
              "Retrying without subscription..."
            );

            try {
              const retryTx = await dcaAccount.SetupStrategy(
                strategy,
                fundAmount,
                false // Force subscribe to false
              );

              console.log(
                "[useDCAAccount] Retry transaction sent:",
                retryTx.hash
              );

              // Handle retry transaction
              const retryReceipt = await retryTx.wait();
              toast.dismiss(retryToastId);

              // Process retry receipt the same way
              const retryStrategyCreatedEvent = retryReceipt?.logs.find(
                (log: any) =>
                  log.topics[0] ===
                  dcaAccount.interface.getEvent("StrategyCreated").topicHash
              );

              if (retryStrategyCreatedEvent) {
                const retryParsedEvent = dcaAccount.interface.parseLog(
                  retryStrategyCreatedEvent
                );
                const retryNewStrategyId = retryParsedEvent?.args[0];

                if (retryNewStrategyId) {
                  clearAccountCache(dcaAccount.target as string);
                  const retryStrategyData = await dcaAccount.getStrategyData(
                    retryNewStrategyId
                  );

                  window.dispatchEvent(
                    new CustomEvent("strategy-created", {
                      detail: {
                        accountAddress: dcaAccount.target,
                        strategyId: Number(retryNewStrategyId),
                      },
                    })
                  );
                }
              }

              toast.success(
                "Strategy created successfully (without subscription)!"
              );
              return { tx: retryTx, hash: retryTx.hash };
            } catch (retryError: any) {
              toast.dismiss(retryToastId);
              throw retryError;
            }
          } else {
            toast.dismiss(loadingToastId);
            throw setupError;
          }
        }
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
        const tx = await dcaAccount.AddFunds(token.tokenAddress, amount);
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

        const tx = await dcaAccount.WithdrawFunds(token.tokenAddress, amount);
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
