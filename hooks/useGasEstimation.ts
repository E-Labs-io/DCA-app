/** @format */

"use client";

import { useState, useCallback } from 'react';
import { BrowserProvider, Contract, ContractTransactionResponse } from 'ethers';
import { useAppKitProvider } from '@reown/appkit/react';

export interface GasEstimate {
  gasLimit: bigint;
  gasPrice: bigint;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
  estimatedCostWei: bigint;
  estimatedCostEth: number;
  estimatedCostUsd: number;
}

export function useGasEstimation() {
  const [isEstimating, setIsEstimating] = useState(false);
  const { walletProvider } = useAppKitProvider('eip155');

  const estimateGas = useCallback(async (
    tx: () => Promise<ContractTransactionResponse>,
    ethPrice: number = 2500 // Default ETH price, should be fetched from API
  ): Promise<GasEstimate | null> => {
    if (!walletProvider) return null;

    setIsEstimating(true);

    try {
      const provider = new BrowserProvider(walletProvider as any);

      // Get fee data
      const feeData = await provider.getFeeData();

      // Execute the transaction function to get the populated transaction
      const populatedTx = await tx();

      // Estimate gas limit
      const gasLimit = await provider.estimateGas({
        to: populatedTx.to,
        data: populatedTx.data,
        value: populatedTx.value || 0n,
      });

      // Use EIP-1559 fees if available, otherwise legacy gas price
      const gasPrice = feeData.gasPrice || 0n;
      const maxFeePerGas = feeData.maxFeePerGas;
      const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas;

      // Calculate estimated cost
      const effectiveGasPrice = maxFeePerGas || gasPrice;
      const estimatedCostWei = gasLimit * effectiveGasPrice;
      const estimatedCostEth = Number(estimatedCostWei) / 1e18;
      const estimatedCostUsd = estimatedCostEth * ethPrice;

      return {
        gasLimit,
        gasPrice,
        maxFeePerGas,
        maxPriorityFeePerGas,
        estimatedCostWei,
        estimatedCostEth,
        estimatedCostUsd,
      };

    } catch (error) {
      console.error('Gas estimation failed:', error);
      return null;
    } finally {
      setIsEstimating(false);
    }
  }, [walletProvider]);

  const getGasPriceOptions = useCallback(async () => {
    if (!walletProvider) return null;

    try {
      const provider = new BrowserProvider(walletProvider as any);
      const feeData = await provider.getFeeData();

      if (!feeData.maxFeePerGas || !feeData.maxPriorityFeePerGas) {
        return null;
      }

      const baseFee = feeData.maxFeePerGas - feeData.maxPriorityFeePerGas;

      return {
        slow: {
          maxFeePerGas: baseFee + (feeData.maxPriorityFeePerGas * 80n / 100n),
          maxPriorityFeePerGas: feeData.maxPriorityFeePerGas * 80n / 100n,
        },
        standard: {
          maxFeePerGas: feeData.maxFeePerGas,
          maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
        },
        fast: {
          maxFeePerGas: baseFee + (feeData.maxPriorityFeePerGas * 120n / 100n),
          maxPriorityFeePerGas: feeData.maxPriorityFeePerGas * 120n / 100n,
        },
      };
    } catch (error) {
      console.error('Failed to get gas price options:', error);
      return null;
    }
  }, [walletProvider]);

  return {
    estimateGas,
    getGasPriceOptions,
    isEstimating,
  };
}