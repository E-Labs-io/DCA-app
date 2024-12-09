'use client';

import { useCallback } from 'react';
import { useWriteContract, useReadContract, usePublicClient } from 'wagmi';
import { DCAAccountABI } from '@/lib/contracts/abis/DCAAccount';
import { type StrategyStruct } from '@/lib/types/dca';

export function useDCAAccount(accountAddress: string) {
  const { writeContract, isPending } = useWriteContract();
  const publicClient = usePublicClient();
  
  const { data: strategies = [] } = useReadContract({
    abi: DCAAccountABI,
    address: accountAddress as `0x${string}`,
    functionName: 'getStrategies',
    enabled: !!accountAddress,
  });

  const createStrategy = useCallback(async ({
    strategy,
    fundAmount,
    subscribe
  }: {
    strategy: StrategyStruct;
    fundAmount: bigint;
    subscribe: boolean;
  }) => {
    if (!accountAddress) {
      throw new Error('Missing account address');
    }

    try {
      const { hash } = await writeContract({
        abi: DCAAccountABI,
        address: accountAddress as `0x${string}`,
        functionName: 'SetupStrategy',
        args: [
          strategy,
          fundAmount,
          subscribe,
        ],
      });

      if (!hash) {
        throw new Error('Failed to create strategy - no transaction hash returned');
      }

      return hash;
    } catch (error: any) {
      console.error('Error in createStrategy:', error);
      throw new Error(error?.message || 'Failed to create strategy');
    }
  }, [writeContract, accountAddress]);

  return {
    createStrategy,
    strategies,
    isCreatingStrategy: isPending,
  };
}