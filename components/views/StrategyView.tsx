/** @format */

"use client";

import { Card, CardBody, ButtonGroup, Chip } from "@nextui-org/react";

import { EthereumAddress } from "@/types/generic";

interface StrategyViewProps {}

interface StrategyStats {
  active: true;
  totalExecutions: number;
  baseTokenBalances: { [key: string]: bigint };
  targetTokenBalances: { [key: string]: bigint };
  averageExecutionAmount?: number;
  reinvestLibraryVersion: string;
}

export function StrategyView({}: StrategyViewProps) {
  const getStrategyStats = (
    accountAddress: EthereumAddress,
    strategyId: number
  ): StrategyStats => {
    return {
      active: true,
      totalExecutions: 0,
      baseTokenBalances: {},
      targetTokenBalances: {},
      reinvestLibraryVersion: "v0.5",
    };
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      {[1, 2].map((i) => (
        <Card key={i} className="w-full animate-pulse">
          <CardBody className="h-24" />
        </Card>
      ))}
    </div>
  );
}
