'use client';

import { useState, useEffect } from 'react';
import { useReadContract } from 'wagmi';
import { DCAAccountABI } from '@/lib/contracts/abis/DCAAccount';
import { tokenList, type TokenTickers } from '@/lib/config/tokens';
import { formatUnits } from 'viem';

interface TokenBalance {
  token: TokenTickers;
  balance: string;
  balanceUSD: number | null;
  address: string;
}

interface TokenBalanceResult {
  data?: bigint;
  isLoading: boolean;
  error?: Error;
}

export function useAccountBalances(accountAddress: string) {
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalValueUSD, setTotalValueUSD] = useState<number | null>(null);

  // Get token balances for all supported tokens
  const tokenBalanceResults = Object.entries(tokenList).map(([ticker, token]) => {
    return useReadContract({
      address: accountAddress as `0x${string}`,
      abi: DCAAccountABI,
      functionName: 'getTargetBalance',
      args: [token.contractAddress.ETH_SEPOLIA as `0x${string}`],
    }) as TokenBalanceResult;
  });

  useEffect(() => {
    async function fetchPrices() {
      try {
        const balancePromises = Object.entries(tokenList).map(async ([ticker, token], index) => {
          const balance = tokenBalanceResults[index].data || BigInt(0);
          
          // TODO: Implement price fetching from a reliable source
          // For now, we'll use mock prices
          const mockPrices: Record<string, number> = {
            WETH: 2200,
            USDC: 1,
            WBTC: 42000,
          };

          const formattedBalance = formatUnits(balance, token.decimals);
          const balanceUSD = mockPrices[ticker] 
            ? Number(formattedBalance) * mockPrices[ticker]
            : null;

          return {
            token: ticker as TokenTickers,
            balance: formattedBalance,
            balanceUSD,
            address: token.contractAddress.ETH_SEPOLIA,
          };
        });

        const newBalances = await Promise.all(balancePromises);
        setBalances(newBalances);

        const total = newBalances.reduce((sum, balance) => {
          return sum + (balance.balanceUSD || 0);
        }, 0);
        setTotalValueUSD(total);
      } catch (error) {
        console.error('Error fetching token prices:', error);
      } finally {
        setIsLoading(false);
      }
    }

    if (accountAddress && tokenBalanceResults.every(result => !result.isLoading)) {
      fetchPrices();
    }
  }, [accountAddress, tokenBalanceResults]);

  const getTokenBalance = (ticker: TokenTickers) => {
    return balances.find(b => b.token === ticker);
  };

  return {
    balances,
    totalValueUSD,
    getTokenBalance,
    isLoading,
  };
} 