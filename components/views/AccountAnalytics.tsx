'use client';

import { Card, CardBody, Spinner } from '@nextui-org/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useAccount } from 'wagmi';
import { DCAAccountABI } from '@/lib/contracts/abis/DCAAccount';
import { formatUnits } from 'viem';

interface AccountAnalyticsProps {
  accountAddress: string;
}

interface ExecutionData {
  timestamp: number;
  baseAmount: bigint;
  targetAmount: bigint;
  baseToken: string;
  targetToken: string;
}

export function AccountAnalytics({ accountAddress }: AccountAnalyticsProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [executionData, setExecutionData] = useState<ExecutionData[]>([]);
  const { connector } = useAccount();

  useEffect(() => {
    async function fetchExecutionHistory() {
      if (!accountAddress || !connector) return;

      try {
        const provider = await connector.getProvider();
        const ethersProvider = new ethers.BrowserProvider(provider);
        const contract = new ethers.Contract(accountAddress, DCAAccountABI, ethersProvider);

        // Get current block
        const currentBlock = await ethersProvider.getBlockNumber();
        // Calculate block from 30 days ago (assuming 12 sec block time)
        const fromBlock = currentBlock - Math.floor(30 * 24 * 60 * 60 / 12);

        // Get execution events
        const filter = contract.filters.StrategyExecuted();
        const events = await contract.queryFilter(filter, fromBlock);

        const executions = await Promise.all(events.map(async (event) => {
          const block = await event.getBlock();
          const args = event.args!;
          return {
            timestamp: Number(block.timestamp),
            baseAmount: args.baseAmount,
            targetAmount: args.targetAmount,
            baseToken: args.baseToken,
            targetToken: args.targetToken,
          };
        }));

        setExecutionData(executions.sort((a, b) => a.timestamp - b.timestamp));
      } catch (error) {
        console.error('Error fetching execution history:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchExecutionHistory();
  }, [accountAddress, connector]);

  const processedData = executionData.reduce((acc: any[], execution) => {
    const date = new Date(execution.timestamp * 1000);
    const dateStr = date.toLocaleDateString();
    
    const existingEntry = acc.find(item => item.date === dateStr);
    if (existingEntry) {
      existingEntry.executions += 1;
      existingEntry.totalBaseAmount += Number(formatUnits(execution.baseAmount, 18));
      existingEntry.totalTargetAmount += Number(formatUnits(execution.targetAmount, 18));
    } else {
      acc.push({
        date: dateStr,
        executions: 1,
        totalBaseAmount: Number(formatUnits(execution.baseAmount, 18)),
        totalTargetAmount: Number(formatUnits(execution.targetAmount, 18)),
      });
    }
    
    return acc;
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardBody className="h-[300px] flex items-center justify-center">
          <Spinner size="lg" />
        </CardBody>
      </Card>
    );
  }

  if (executionData.length === 0) {
    return (
      <Card>
        <CardBody>
          <h4 className="text-lg font-semibold mb-4">Account Performance</h4>
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-gray-500">No execution data available yet</p>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardBody>
        <h4 className="text-lg font-semibold mb-4">Account Performance</h4>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={processedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="executions" 
                stroke="#22c55e" 
                name="Executions"
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="totalTargetAmount" 
                stroke="#3b82f6" 
                name="Total Target Amount"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardBody>
    </Card>
  );
}