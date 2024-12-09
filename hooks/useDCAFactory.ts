'use client';

import { useCallback } from 'react';
import { useWriteContract, useWatchContractEvent, useAccount } from 'wagmi';
import { DCAFactoryABI } from '@/lib/contracts/abis/DCAFactory';
import { DCAFactoryAddress } from '@/lib/config/networks';

export function useDCAFactory() {
  const { writeContract, isPending, isError, error } = useWriteContract();
  const { address: userAddress } = useAccount();

  const createAccount = useCallback(async () => {
    if (!userAddress) {
      throw new Error('Wallet not connected');
    }

    try {
      const { hash } = await writeContract({
        abi: DCAFactoryABI,
        address: DCAFactoryAddress.ETH_SEPOLIA,
        functionName: 'createDCAAccount',
        args: [],
      });
      return hash;
    } catch (error: any) {
      console.error('Error creating DCA account:', error);
      // Extract the most relevant error message
      const errorMessage = error.shortMessage || error.message || 'Failed to create DCA account';
      throw new Error(errorMessage);
    }
  }, [writeContract, userAddress]);

  // Watch for account creation events
  useWatchContractEvent({
    abi: DCAFactoryABI,
    address: DCAFactoryAddress.ETH_SEPOLIA,
    eventName: 'DCAAccountCreated',
    onLogs(logs) {
      const [log] = logs;
      if (log && log.args) {
        const { owner, dcaAccount } = log.args;
        console.log('New DCA account created:', { owner, dcaAccount });
      }
    },
  });

  return {
    createAccount,
    isCreating: isPending,
    isError,
    error,
  };
}