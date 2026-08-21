/** @format */

"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import {
  DCAAccount,
  IDCADataStructures,
} from "@/types/contracts/contracts/base/DCAAccount";
import { ContractTransactionReport } from "@/types/contractReturns";
import { BigNumberish, Signer, keccak256, toUtf8Bytes, ethers, TransactionReceipt } from "ethers";
import { EthereumAddress } from "@/types/generic";
import { clearAccountCache } from "@/hooks/helpers/getAccountEvents";
import { connectERC20 } from "./helpers/connectToContract";
import { useTransaction } from "./useTransaction";
import { useTransactions } from "@/context/TransactionContext";
import { useGasEstimation } from "./useGasEstimation";
import { dbg, dbgWarn } from '@/helpers/debug';
import { DCAAccount__factory } from "@/types/contracts";

// Module-level interface for decoding DCAAccount custom errors from raw
// revert data. Ethers only pre-decodes (error.revert) when the ABI is on
// the failing call; estimateGas failures often arrive with bare data.
const dcaAccountInterface = new ethers.Interface(DCAAccount__factory.abi);

/**
 * Decode custom contract errors into user-friendly messages
 */
const decodeContractError = (error: any): string => {
  if (error.code === 4001 || error.message?.includes("rejected")) {
    return "Transaction was rejected by user";
  }

  if (error.code === -32000 || error.message?.includes("insufficient funds")) {
    return "Insufficient funds for transaction";
  }

  // Real custom-error decoding first: pull revert data from the shapes
  // ethers v6 uses and parse it against the account ABI, so users see
  // the contract's actual complaint (with its arguments) instead of a
  // raw CALL_EXCEPTION dump.
  try {
    const revertData =
      error?.revert ??
      (() => {
        const data =
          error?.data ?? error?.info?.error?.data ?? error?.error?.data;
        if (!data || data === "0x") return null;
        const parsed = dcaAccountInterface.parseError(data);
        return parsed ? { name: parsed.name, args: parsed.args } : null;
      })();

    if (revertData?.name === "InsufficientFundsForSubscription") {
      const [required, available] = revertData.args;
      return `Not enough funds in the account to activate: the contract requires 5x the per-swap amount (${required} base units, account holds ${available}). Fund the difference and try again.`;
    }
    if (revertData?.name) {
      // Reuse the message map below by matching on the decoded name.
      error = { ...error, message: String(revertData.name) };
    }
  } catch {
    // Fall through to string matching on the original error.
  }

  if (error.message?.includes("StrategyNotActive")) {
    return "Strategy is not active";
  }

  if (error.message?.includes("InsufficientBalance")) {
    return "Insufficient token balance";
  }

  if (error.message?.includes("StrategyAlreadySubscribed")) {
    return "Strategy is already subscribed";
  }

  if (error.message?.includes("StrategyAlreadyUnsubscribed")) {
    return "Strategy is already unsubscribed";
  }

  if (error.message?.includes("InsufficientFundsForSubscription")) {
    return "Insufficient funds to subscribe strategy (need 5x execution amount)";
  }

  if (error.message?.includes("NotInExecutionWindow")) {
    return "Strategy is not in execution window";
  }

  if (error.message?.includes("IntervalNotActive")) {
    return "Selected interval is not active";
  }

  if (error.message?.includes("NotAllowedBaseToken")) {
    return "Token is not allowed as base currency";
  }

  if (error.message?.includes("InvalidStrategyData")) {
    return "Invalid strategy parameters";
  }

  // Fallback for unknown errors
  return error.message || "Transaction failed";
};

export function useDCAAccount(dcaAccount: DCAAccount, Signer: Signer) {
  const { executeTransaction, retryTransaction } = useTransaction();
  const { beginWalletPrompt, endWalletPrompt } = useTransactions();
  const { estimateGas } = useGasEstimation();

  // Tell DCAStatsProvider that on-chain balances changed so every view
  // refreshes immediately (mirrors the existing strategy-created event).
  const announceFundsUpdated = useCallback(() => {
    window.dispatchEvent(
      new CustomEvent("funds-updated", {
        detail: { accountAddress: dcaAccount?.target?.toString() },
      })
    );
  }, [dcaAccount]);

  const createStrategy = useCallback(
    async ({
      strategy,
      fundAmount,
      subscribe,
    }: {
      strategy: IDCADataStructures.StrategyStruct;
      fundAmount: bigint;
      subscribe: boolean;
    }): Promise<
      | false
      | { success: boolean; receipt?: TransactionReceipt; error?: any }
    > => {
      if (!Signer) {
        toast.error("Please connect your wallet first");
        throw new Error("No signer available");
      }

      try {
        if (!dcaAccount) throw new Error("Error connecting to account");

        dbg("[useDCAAccount] Creating strategy:", {
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

        // Estimate gas before sending
        const gasEstimate = await estimateGas(() =>
          dcaAccount.SetupStrategy(strategy, fundAmount, subscribe)
        );

        if (gasEstimate && gasEstimate.estimatedCostUsd !== null) {
          toast.info(`Estimated cost: $${gasEstimate.estimatedCostUsd.toFixed(2)}`);
        }

        const result = await executeTransaction(
          dcaAccount.SetupStrategy(strategy, fundAmount, subscribe),
          {
            description: "Create DCA strategy",
            onSuccess: async (receipt) => {
              dbg("[useDCAAccount] Transaction confirmed, receipt:", {
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

              dbg(
                "[useDCAAccount] Strategy created event found:",
                !!strategyCreatedEvent
              );

              if (strategyCreatedEvent) {
                // Parse the event to get the strategyId
                const parsedEvent =
                  dcaAccount.interface.parseLog(strategyCreatedEvent);
                const newStrategyId = parsedEvent?.args[0]; // First arg is strategyId

                dbg(
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

                  dbg("[useDCAAccount] Fetched strategy data:", {
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

                  dbg(
                    "[useDCAAccount] About to dispatch strategy-created event:",
                    eventDetail
                  );

                  window.dispatchEvent(
                    new CustomEvent("strategy-created", {
                      detail: eventDetail,
                    })
                  );

                  dbg(
                    "[useDCAAccount] Dispatched strategy-created event successfully"
                  );
                } else {
                  dbgWarn("[useDCAAccount] No strategy ID found in event");
                }
              } else {
                dbgWarn(
                  "[useDCAAccount] No StrategyCreated event found in transaction logs"
                );
              }

              toast.success("Strategy created successfully!");
            },
          }
        );

        return result;
      } catch (setupError: any) {
          console.error("[useDCAAccount] SetupStrategy failed:", setupError);

          // Check if it's an "already subscribed" error and retry without subscription
          if (
            subscribe &&
            (setupError.message?.toLowerCase().includes("already") ||
              setupError.message?.toLowerCase().includes("subscribed") ||
              setupError.message?.toLowerCase().includes("subscription"))
          ) {
            dbgWarn(
              "[useDCAAccount] Retrying strategy creation without subscription"
            );
            // Previous loading toast owned by executeTransaction — no manual
            // dismiss needed (loadingToastId was a stale reference from an
            // earlier refactor).
            const retryToastId = toast.loading(
              "Retrying without subscription..."
            );

            try {
              const retryTx = await dcaAccount.SetupStrategy(
                strategy,
                fundAmount,
                false // Force subscribe to false
              );

              dbg(
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
              // Match the function's return shape after the executeTransaction
              // refactor: {success, receipt} rather than the older {tx, hash}.
              return { success: true, receipt: retryReceipt ?? undefined };
            } catch (retryError: any) {
              toast.dismiss(retryToastId);
              throw retryError;
            }
          } else {
            // Loading toast managed by executeTransaction — see comment above
            const errorMessage = decodeContractError(setupError);
            toast.error(errorMessage);
            console.error("Error creating strategy:", setupError);
            if (setupError.code === 4001 || setupError.message?.includes("rejected")) {
              throw setupError;
            }
            return false;
          }
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

      let progressToast: string | number | undefined;
      try {
        if (!dcaAccount) throw new Error("Error connecting to account");

        // AddFunds does safeTransferFrom(msg.sender, account, amount), so
        // the account must have an allowance first. The standalone fund
        // flow never approved (only the create-strategy flow did), so
        // funding reverted for anyone who hadn't previously created a
        // strategy with that token. Approve up-front if the allowance is
        // short.
        const tokenAddress = String(token.tokenAddress);
        const erc20 = await connectERC20(tokenAddress, Signer);
        const owner = await Signer.getAddress();
        const currentAllowance: bigint = await erc20.allowance(
          owner,
          dcaAccount.target
        );

        if (currentAllowance < amount) {
          toast.info("Please approve the account to spend your token...");
          beginWalletPrompt();
          let approveTx;
          try {
            approveTx = await erc20.approve(dcaAccount.target, amount);
          } finally {
            endWalletPrompt();
          }
          // Reuse the loading toast's id so the chip resolves in place instead
          // of leaking a stuck spinner (sonner loading toasts never expire).
          progressToast = toast.loading("Approval is confirming...");
          await approveTx.wait();
          toast.success("Approval confirmed.", { id: progressToast });
        }

        toast.info("Please accept the Funding Transaction...");
        beginWalletPrompt();
        let tx;
        try {
          tx = await dcaAccount.AddFunds(tokenAddress, amount);
        } finally {
          endWalletPrompt();
        }
        progressToast = toast.loading("Funding Transaction is Confirming...");
        await tx.wait();
        announceFundsUpdated();
        toast.success("Funding Transaction Approved.", { id: progressToast });
        return { tx, hash: tx.hash };
      } catch (error: any) {
        if (progressToast !== undefined) toast.dismiss(progressToast);
        const errorMessage = decodeContractError(error);
        toast.error(errorMessage);
        console.error("Error funding account:", error);
        return false;
      }
    },
    [Signer, dcaAccount, beginWalletPrompt, endWalletPrompt, announceFundsUpdated]
  );

  const defundAccount = useCallback(
    async (token: IDCADataStructures.TokenDataStruct, amount: bigint) => {
      if (!Signer) {
        toast.error("Please connect your wallet first");
        throw new Error("No signer available");
      }

      let progressToast: string | number | undefined;
      try {
        if (!dcaAccount) throw new Error("Error connecting to account");
        toast.info("Please accept the Transaction...");

        beginWalletPrompt();
        let tx;
        try {
          tx = await dcaAccount.WithdrawFunds(token.tokenAddress, amount);
        } finally {
          endWalletPrompt();
        }
        progressToast = toast.loading("Transaction is Confirming...");
        await tx.wait();
        announceFundsUpdated();
        toast.success("Transaction Approved.", { id: progressToast });
        return { tx, hash: tx.hash };
      } catch (error: any) {
        if (progressToast !== undefined) toast.dismiss(progressToast);
        const errorMessage = decodeContractError(error);
        toast.error(errorMessage);
        console.error("Error withdrawing funds from account:", error);
        return false;
      }
    },
    [Signer, dcaAccount, beginWalletPrompt, endWalletPrompt, announceFundsUpdated]
  );

  const withdrawSavings = useCallback(
    async (token: IDCADataStructures.TokenDataStruct, amount: bigint) => {
      if (!Signer) {
        toast.error("Please connect your wallet first");
        throw new Error("No signer available");
      }

      let progressToast: string | number | undefined;
      try {
        if (!dcaAccount) throw new Error("Error connecting to account");

        toast.info("Please accept the Withdrawal Transaction");
        beginWalletPrompt();
        let tx;
        try {
          tx = await dcaAccount.WithdrawSavings(token.tokenAddress, amount);
        } finally {
          endWalletPrompt();
        }
        progressToast = toast.loading("Withdrawal Transaction Confirming...");
        await tx.wait();
        announceFundsUpdated();
        toast.success("Withdrawal Transaction Approved.", { id: progressToast });

        return { tx, hash: tx.hash };
      } catch (error: any) {
        if (progressToast !== undefined) toast.dismiss(progressToast);
        const errorMessage = decodeContractError(error);
        toast.error(errorMessage);
        console.error("Error withdrawing target token:", error);
        return false;
      }
    },
    [Signer, dcaAccount, beginWalletPrompt, endWalletPrompt, announceFundsUpdated]
  );

  const subscribeStrategy = useCallback(
    async (strategyId: BigNumberish) => {
      if (!Signer) {
        toast.error("Please connect your wallet first");
        throw new Error("No signer available");
      }

      let progressToast: string | number | undefined;
      try {
        if (!dcaAccount) throw new Error("Error connecting to account");

        toast.info("Please accept the transaction...");
        beginWalletPrompt();
        let tx;
        try {
          tx = await dcaAccount.SubscribeStrategy(strategyId);
        } finally {
          endWalletPrompt();
        }
        progressToast = toast.loading("Transaction is confirming...");
        await tx.wait();
        toast.success("Account was subscribed to the Executor", { id: progressToast });
        return { tx, hash: tx.hash };
      } catch (error: any) {
        if (progressToast !== undefined) toast.dismiss(progressToast);
        const errorMessage = decodeContractError(error);
        toast.error(errorMessage);
        console.error("Error subscribing to strategy:", error);
        if (error.code === 4001 || error.message?.includes("rejected")) {
          throw error;
        }
        return false;
      }
    },
    [Signer, dcaAccount, beginWalletPrompt, endWalletPrompt]
  );

  const unsubscribeStrategy = useCallback(
    async (strategyId: BigNumberish) => {
      if (!Signer) {
        toast.error("Please connect your wallet first");
        throw new Error("No signer available");
      }

      let progressToast: string | number | undefined;
      try {
        if (!dcaAccount) throw new Error("Error connecting to account");
        toast.info("Please accept the transaction...");
        beginWalletPrompt();
        let tx;
        try {
          tx = await dcaAccount.UnsubscribeStrategy(strategyId);
        } finally {
          endWalletPrompt();
        }
        progressToast = toast.loading("Transaction is confirming...");
        await tx.wait();
        toast.success("Account was unsubscribed to the Executor", { id: progressToast });
        return { tx, hash: tx.hash };
      } catch (error: any) {
        if (progressToast !== undefined) toast.dismiss(progressToast);
        if (error.code === 4001 || error.message?.includes("rejected")) {
          throw error;
        }
        console.error("Error unsubscribing from strategy:", error);
        toast.error(decodeContractError(error));
        return false;
      }
    },
    [Signer, dcaAccount, beginWalletPrompt, endWalletPrompt]
  );

  const setStrategyReinvest = useCallback(
    async (
      strategyId: BigNumberish,
      reinvest: IDCADataStructures.ReinvestStruct
    ) => {
      if (!Signer) {
        toast.error("Please connect your wallet first");
        throw new Error("No signer available");
      }

      let progressToast: string | number | undefined;
      try {
        if (!dcaAccount) throw new Error("Error connecting to account");
        toast.info("Please accept the transaction...");
        beginWalletPrompt();
        let tx;
        try {
          tx = await dcaAccount.setStrategyReinvest(strategyId, reinvest);
        } finally {
          endWalletPrompt();
        }
        progressToast = toast.loading("Updating reinvest settings...");
        await tx.wait();
        toast.success("Reinvest settings updated", { id: progressToast });
        return { tx, hash: tx.hash };
      } catch (error: any) {
        if (progressToast !== undefined) toast.dismiss(progressToast);
        if (error.code === 4001 || error.message?.includes("rejected")) {
          throw error;
        }
        toast.error(decodeContractError(error));
        console.error("Error setting strategy reinvest:", error);
        return false;
      }
    },
    [Signer, dcaAccount, beginWalletPrompt, endWalletPrompt]
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

  const batchSubscribeStrategies = useCallback(
    async (strategyIds: BigNumberish[]) => {
      if (!Signer) {
        toast.error("Please connect your wallet first");
        throw new Error("No signer available");
      }

      let progressToast: string | number | undefined;
      try {
        if (!dcaAccount) throw new Error("Error connecting to account");
        toast.info("Please accept the batch subscription transaction...");
        beginWalletPrompt();
        let tx;
        try {
          tx = await dcaAccount.batchSubscribeStrategies(strategyIds);
        } finally {
          endWalletPrompt();
        }
        progressToast = toast.loading("Batch subscription transaction is confirming...");
        await tx.wait();
        toast.success("Strategies subscribed successfully", { id: progressToast });
        return { tx, hash: tx.hash };
      } catch (error: any) {
        if (progressToast !== undefined) toast.dismiss(progressToast);
        if (error.code === 4001 || error.message?.includes("rejected")) {
          toast.error("Transaction was rejected");
          throw error;
        }
        console.error("Error batch subscribing strategies:", error);
        toast.error("Failed to batch subscribe strategies");
        return false;
      }
    },
    [Signer, dcaAccount, beginWalletPrompt, endWalletPrompt]
  );

  const batchUnsubscribeStrategies = useCallback(
    async (strategyIds: BigNumberish[]) => {
      if (!Signer) {
        toast.error("Please connect your wallet first");
        throw new Error("No signer available");
      }

      let progressToast: string | number | undefined;
      try {
        if (!dcaAccount) throw new Error("Error connecting to account");
        toast.info("Please accept the batch unsubscription transaction...");
        beginWalletPrompt();
        let tx;
        try {
          tx = await dcaAccount.batchUnsubscribeStrategies(strategyIds);
        } finally {
          endWalletPrompt();
        }
        progressToast = toast.loading("Batch unsubscription transaction is confirming...");
        await tx.wait();
        toast.success("Strategies unsubscribed successfully", { id: progressToast });
        return { tx, hash: tx.hash };
      } catch (error: any) {
        if (progressToast !== undefined) toast.dismiss(progressToast);
        if (error.code === 4001 || error.message?.includes("rejected")) {
          toast.error("Transaction was rejected");
          throw error;
        }
        console.error("Error batch unsubscribing strategies:", error);
        toast.error("Failed to batch unsubscribe strategies");
        return false;
      }
    },
    [Signer, dcaAccount, beginWalletPrompt, endWalletPrompt]
  );

  return {
    createStrategy,
    fundAccount,
    defundAccount,
    withdrawSavings,
    subscribeStrategy,
    unsubscribeStrategy,
    setStrategyReinvest,
    batchSubscribeStrategies,
    batchUnsubscribeStrategies,
    getBaseBalance,
    getTargetBalance,
    getAccountBaseTokens,
    getAccountTargetTokens,
  };
}
