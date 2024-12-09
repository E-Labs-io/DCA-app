'use client';

import { useWriteContract, useReadContract } from 'wagmi';
import { erc20Abi } from 'viem';
import { parseUnits } from 'viem';

export function useTokenApproval(tokenAddress: string, decimals: number = 18) {
  const { writeContract: approve } = useWriteContract();
  const { data: allowanceData, refetch } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: erc20Abi,
    functionName: 'allowance',
    enabled: false,
  });

  const checkAllowance = async (owner: string, spender: string, amount: string) => {
    if (!tokenAddress) {
      console.error('Token address is required for allowance check');
      return false;
    }

    try {
      const allowance = await refetch({
        args: [owner as `0x${string}`, spender as `0x${string}`],
      });

      if (!allowance.data) {
        console.warn('No allowance data returned');
        return false;
      }
      
      const requiredAmount = parseUnits(amount, decimals);
      return BigInt(allowance.data) >= requiredAmount;
    } catch (error: any) {
      console.error('Error checking allowance:', {
        error,
        tokenAddress,
        owner,
        spender,
        amount,
        message: error?.message,
      });
      return false;
    }
  };

  const approveToken = async (spender: string, amount: string) => {
    if (!tokenAddress) {
      throw new Error('Token address is required for approval');
    }

    try {
      console.log('Approving token:', {
        tokenAddress,
        spender,
        amount,
        parsedAmount: parseUnits(amount, decimals).toString(),
      });

      const { hash } = await approve({
        address: tokenAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: 'approve',
        args: [spender as `0x${string}`, parseUnits(amount, decimals)],
      });

      if (!hash) throw new Error('No transaction hash returned from approval');
      return hash;
    } catch (error: any) {
      console.error('Error approving token:', {
        error,
        tokenAddress,
        spender,
        amount,
        message: error?.message,
        code: error?.code,
      });
      throw error;
    }
  };

  return {
    checkAllowance,
    approveToken,
  };
}