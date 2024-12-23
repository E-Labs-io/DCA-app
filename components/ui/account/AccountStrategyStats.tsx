/** @format */

import { AccountStats } from "@/lib/providers/DCAStatsProvider";
import { Card, CardBody } from "@nextui-org/react";

export interface StrategyStatsProps {
  stats: AccountStats;
}

export function AccountStrategyStats({ stats }: StrategyStatsProps) {
  return (
    <Card>
      <CardBody>
        <h4 className="text-sm font-semibold mb-2">Strategy Stats</h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-400">Total Strategies:</span>
            <span>{stats.totalStrategies}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-400">Active Strategies:</span>
            <span>{stats.totalActiveStrategies}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-400">Total Executions:</span>
            <span>{stats.totalExecutions}</span>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
