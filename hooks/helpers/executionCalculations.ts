/** @format */

import { Interval, intervalOptions } from "@/constants/intervals";
import { TokenData } from "@/constants/tokens";
import { getIntervalSeconds } from "@/lib/helpers/intervals";
import { IDCADataStructures } from "@/types/contracts/contracts/base/DCAAccount";

export interface AccountStrategyIntervalCost {
  strategyId: number; // Strategy ID
  interval: number; // in seconds
  executionAmount: number; // amount of base token per execution
  baseToken: string; // Base token address or identifier
}

export function calculateExecutionsLeft(
  baseTokenBalance: number,
  strategies: AccountStrategyIntervalCost[]
): { strategyId: number; executionsLeft: number }[] {
  const results: { strategyId: number; executionsLeft: number }[] = [];

  strategies.forEach((strategy) => {
    // Skip if no balance for the base token
    if (baseTokenBalance === undefined) return;

    const executionsPerMinute = 60 / (strategy.interval / 60); // Convert seconds to minutes
    const totalCostPerMinute = executionsPerMinute * strategy.executionAmount; // Total cost per minute
    const totalMinutes = baseTokenBalance / totalCostPerMinute; // Calculate how many minutes the account can run

    const totalExecutions = Math.floor(totalMinutes * executionsPerMinute); // Total executions left
    results.push({
      strategyId: strategy.strategyId,
      executionsLeft: totalExecutions,
    });
  });

  return results;
}

export function buildAccountStrategyIntervalCost(
  strategies: IDCADataStructures.StrategyStruct[],
  baseToken: TokenData
): AccountStrategyIntervalCost[] {
  return strategies
    .filter(
      (strategy) =>
        strategy.active &&
        (strategy.baseToken.tokenAddress as string) ===
          (baseToken.contractAddress as string)
    ) // Only include active strategies for the specified base token
    .map((strategy) => ({
      strategyId: Number(strategy.strategyId),
      interval: intervalOptions[Number(strategy.interval)].seconds, // Convert interval to seconds
      executionAmount: Number(strategy.amount), // Assuming amount is the execution amount
      baseToken: strategy.baseToken.tokenAddress as string, // Include the base token address
    }));
}

// Example usage:
const baseTokenBalance = 1500; // Example base token balance
const strategies: AccountStrategyIntervalCost[] = [
  {
    strategyId: 1,
    interval: 60,
    executionAmount: 100,
    baseToken: "baseToken1",
  }, // Strategy 1 (1 minute)
  {
    strategyId: 2,
    interval: 300,
    executionAmount: 100,
    baseToken: "baseToken1",
  }, // Strategy 2 (5 minutes)
  {
    strategyId: 3,
    interval: 300,
    executionAmount: 50,
    baseToken: "baseToken1",
  }, // Strategy 2 (5 minutes)
];

const executionsLeft = calculateExecutionsLeft(baseTokenBalance, strategies);
console.log(executionsLeft); // Output: [{ strategyId: 1, executionsLeft: 13 }, { strategyId: 2, executionsLeft: 2 }]
