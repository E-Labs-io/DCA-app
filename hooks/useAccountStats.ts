'use client';

import { useAccount } from 'wagmi';
import { useReadContract, useReadContracts } from 'wagmi';
import { DCAFactoryABI } from '@/lib/contracts/abis/DCAFactory';
import { DCAAccountABI } from '@/lib/contracts/abis/DCAAccount';
import { DCAFactoryAddress } from '@/lib/config/networks';
import { useEffect } from 'react';
import { useAccountStore } from '@/lib/store/accountStore';

export function useAccountStats() {
  const { address } = useAccount();
  const setAccounts = useAccountStore((state) => state.setAccounts);

  const { data: userAccounts = [], isLoading: isLoadingAccounts } = useReadContract({
    address: DCAFactoryAddress.ETH_SEPOLIA,
    abi: DCAFactoryABI,
    functionName: 'getDCAAccountsOfUser',
    args: [address as `0x${string}`],
    enabled: !!address,
  });

  const { data: strategiesData, isLoading: isLoadingStrategies } = useReadContracts({
    contracts: userAccounts.map(account => ({
      address: account,
      abi: DCAAccountABI,
      functionName: 'getStrategies',
    })),
    enabled: userAccounts.length > 0,
  });

  useEffect(() => {
    if (userAccounts) {
      setAccounts(userAccounts);
    }
  }, [userAccounts, setAccounts]);

  const accountsWithStrategies = userAccounts.map((account, index) => ({
    account,
    strategies: strategiesData?.[index]?.result || [],
  }));

  const totalAccounts = userAccounts.length;
  const totalStrategies = accountsWithStrategies.reduce(
    (acc, curr) => acc + (curr.strategies?.length || 0),
    0
  );

  return {
    accounts: userAccounts,
    accountsWithStrategies,
    totalAccounts,
    totalStrategies,
    isLoading: isLoadingAccounts || isLoadingStrategies,
  };
}