/** @format */

"use client";

import { Card, CardBody, Skeleton } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { useDCAProvider } from "@/lib/providers/DCAStatsProvider";

export function UserStatsOverview() {
  const { accounts } = useDCAProvider();
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<{
    totalAccounts: number;
    totalStrategies: number;
    totalActiveStrategies: number;
    totalExecutions: number;
  }>({
    totalAccounts: 0,
    totalStrategies: 0,
    totalActiveStrategies: 0,
    totalExecutions: 0,
  });

  useEffect(() => {
    // Calculate statistics
    const totalAccounts = accounts.length;
    let totalStrategies = 0;
    for (const account of accounts) {
      for (const strategy of account.strategies) {
        totalStrategies += 1;
      }
    }
    let totalActiveStrategies = 0;
    for (const account of accounts) {
      for (const strategy of account.strategies) {
        if (strategy.active) {
          totalActiveStrategies += 1;
        }
      }
    }

    let totalExecutions = 0;
    for (const account of accounts) {
      totalExecutions += account.statistics?.totalExecutions || 0;
    }
    setStats({
      totalAccounts,
      totalStrategies,
      totalActiveStrategies,
      totalExecutions,
    });
    setMounted(true);
  }, [accounts]);

  if (!mounted) {
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
              <p className="text-2xl font-bold">{stats.totalAccounts}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Strategies</p>
              <p className="text-2xl font-bold">{stats.totalStrategies}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Active Strategies</p>
              <p className="text-2xl font-bold">
                {stats.totalActiveStrategies}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Executions</p>
              <p className="text-2xl font-bold">{stats.totalExecutions}</p>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
