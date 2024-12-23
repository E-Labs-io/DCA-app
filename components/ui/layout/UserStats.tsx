/** @format */

"use client";

import { Card, CardBody, Skeleton } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { useDCAProvider } from "@/lib/providers/DCAStatsProvider";

export function UserStatsOverview() {
  const { walletStats } = useDCAProvider();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (walletStats) setMounted(true);
  }, [walletStats]);

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
              <p className="text-2xl font-bold">
                {walletStats?.totalAccounts || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Strategies</p>
              <p className="text-2xl font-bold">
                {walletStats?.totalStrategies || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Active Strategies</p>
              <p className="text-2xl font-bold">
                {walletStats?.totalActiveStrategies || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Executions</p>
              <p className="text-2xl font-bold">
                {walletStats?.totalExecutions || 0}
              </p>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
