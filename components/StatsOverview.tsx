'use client';

import { Card, CardBody, Skeleton } from '@nextui-org/react';
import { useState, useEffect } from 'react';
import { useAccountStats } from '@/hooks/useAccountStats';
import { useAccountBalances } from '@/hooks/useAccountBalances';
import { useAccount } from 'wagmi';

export default function StatsOverview() {
  const { address } = useAccount();
  const { totalAccounts, totalStrategies, accounts, isLoading: isLoadingStats } = useAccountStats();
  const [mounted, setMounted] = useState(false);

  // Get balances for all accounts
  const accountBalances = accounts.map(account => useAccountBalances(account));
  const isLoadingBalances = accountBalances.some(balance => balance.isLoading);

  // Calculate total value across all accounts
  const totalPortfolioValue = accountBalances.reduce((total, balance) => {
    return total + (balance.totalValueUSD || 0);
  }, 0);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isLoadingStats || isLoadingBalances) {
    return (
      <Card className="mb-8">
        <CardBody>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-6 w-32 rounded-lg" />
              <Skeleton className="h-4 w-48 rounded-lg" />
            </div>
            <div className="flex gap-8">
              <div>
                <Skeleton className="h-4 w-24 rounded-lg mb-2" />
                <Skeleton className="h-8 w-16 rounded-lg" />
              </div>
              <div>
                <Skeleton className="h-4 w-24 rounded-lg mb-2" />
                <Skeleton className="h-8 w-16 rounded-lg" />
              </div>
              <div>
                <Skeleton className="h-4 w-24 rounded-lg mb-2" />
                <Skeleton className="h-8 w-16 rounded-lg" />
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="mb-8">
      <CardBody>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-col">
            <h2 className="text-xl font-semibold">Overview</h2>
            <p className="text-gray-400">Your DCA Protocol Statistics</p>
          </div>
          <div className="flex gap-8">
            <div>
              <p className="text-sm text-gray-400">Total Accounts</p>
              <p className="text-2xl font-bold">{totalAccounts}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Active Strategies</p>
              <p className="text-2xl font-bold">{totalStrategies}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Portfolio Value</p>
              <p className="text-2xl font-bold">
                ${totalPortfolioValue.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>
        </div>

        {accounts.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-800">
            <h3 className="text-sm font-medium text-gray-400 mb-4">Account Balances</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {accounts.map((account, index) => {
                const { balances, totalValueUSD } = accountBalances[index];
                if (!balances.length) return null;

                return (
                  <Card key={account} className="bg-gray-900">
                    <CardBody>
                      <div className="flex justify-between items-start mb-4">
                        <p className="text-sm font-medium">Account {index + 1}</p>
                        <p className="text-sm text-gray-400">
                          ${totalValueUSD?.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                      <div className="space-y-2">
                        {balances.map(balance => (
                          <div key={balance.token} className="flex justify-between items-center">
                            <span className="text-sm">{balance.token}</span>
                            <span className="text-sm text-gray-400">
                              {Number(balance.balance).toLocaleString(undefined, {
                                minimumFractionDigits: 4,
                                maximumFractionDigits: 8,
                              })}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardBody>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}