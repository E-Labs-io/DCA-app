/** @format */

"use client";

import { useCallback } from 'react';
import { ContractTransactionResponse, TransactionReceipt } from 'ethers';
import { useTransactions } from '@/context/TransactionContext';
import { useAppKitNetwork } from '@reown/appkit/react';
import { toast } from 'sonner';

export interface TransactionOptions {
  description: string;
  onSuccess?: (receipt: TransactionReceipt) => void;
  onError?: (error: any) => void;
  showToast?: boolean;
}

export function useTransaction() {
  const { addTransaction, updateTransaction } = useTransactions();
  const { chainId } = useAppKitNetwork();

  const executeTransaction = useCallback(async (
    txPromise: Promise<ContractTransactionResponse>,
    options: TransactionOptions
  ): Promise<{ success: boolean; receipt?: TransactionReceipt; error?: any }> => {
    const { description, onSuccess, onError, showToast = true } = options;

    try {
      // Send the transaction
      const tx = await txPromise;

      // Add to transaction tracking
      const txId = addTransaction({
        hash: tx.hash,
        description,
        status: 'pending',
        value: tx.value,
        network: chainId?.toString() || 'unknown',
      });

      if (showToast) {
        toast.loading(`${description}...`, { id: txId });
      }

      // Wait for confirmation. ethers v6 returns null if the tx is
      // replaced / dropped; treat that as a confirmation failure.
      const receipt = await tx.wait();
      if (!receipt) {
        throw new Error("Transaction receipt unavailable (replaced or dropped)");
      }

      // Update transaction status
      updateTransaction(txId, {
        status: 'confirmed',
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed,
        gasPrice: receipt.gasPrice,
        explorerUrl: getExplorerUrl(tx.hash, typeof chainId === "string" ? Number(chainId) : chainId),
      });

      if (showToast) {
        toast.success(`${description} confirmed!`, { id: txId });
      }

      onSuccess?.(receipt);

      return { success: true, receipt };

    } catch (error: any) {
      console.error('Transaction failed:', error);

      if (showToast) {
        const errorMessage = error.code === 4001
          ? 'Transaction rejected'
          : 'Transaction failed';
        toast.error(errorMessage);
      }

      onError?.(error);

      return { success: false, error };
    }
  }, [addTransaction, updateTransaction, chainId]);

  const retryTransaction = useCallback(async (
    txFunction: () => Promise<ContractTransactionResponse>,
    options: TransactionOptions,
    maxRetries: number = 3
  ): Promise<{ success: boolean; receipt?: TransactionReceipt; error?: any }> => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await executeTransaction(txFunction(), {
          ...options,
          description: `${options.description} (attempt ${attempt}/${maxRetries})`,
        });

        if (result.success) {
          return result;
        }

        // If this is the last attempt, return the error
        if (attempt === maxRetries) {
          return result;
        }

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 2000 * attempt));

      } catch (error) {
        if (attempt === maxRetries) {
          return { success: false, error };
        }
      }
    }

    return { success: false, error: new Error('Max retries exceeded') };
  }, [executeTransaction]);

  return {
    executeTransaction,
    retryTransaction,
  };
}

function getExplorerUrl(hash: string, chainId?: number): string {
  const explorers: { [key: number]: string } = {
    1: 'https://etherscan.io',
    11155111: 'https://sepolia.etherscan.io',
    8453: 'https://basescan.org',
    84531: 'https://goerli.basescan.org',
  };

  const baseUrl = explorers[chainId || 1] || 'https://etherscan.io';
  return `${baseUrl}/tx/${hash}`;
}