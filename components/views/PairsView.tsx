'use client';

import { Card, CardBody, Progress } from '@nextui-org/react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export function PairsView() {
  const pairs = [
    {
      id: '1',
      pair: 'ETH/USDC',
      totalValue: '$3,200',
      change24h: '+5.2%',
      isPositive: true,
      strategies: 3,
      nextExecution: '6h',
      progress: 65
    },
    // Add more mock data as needed
  ];

  return (
    <div className="grid grid-cols-1 gap-6">
      {pairs.map((pair) => (
        <Card key={pair.id} className="w-full">
          <CardBody>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-lg font-semibold">{pair.pair}</h3>
                <div className="flex items-center gap-2">
                  <span className={pair.isPositive ? 'text-green-500' : 'text-red-500'}>
                    {pair.isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  </span>
                  <span className={pair.isPositive ? 'text-green-500' : 'text-red-500'}>
                    {pair.change24h}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-8">
                <div>
                  <p className="text-sm text-gray-400">Total Value</p>
                  <p className="text-xl font-bold">{pair.totalValue}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Active Strategies</p>
                  <p className="text-xl font-bold">{pair.strategies}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Next Execution</p>
                  <p className="text-xl font-bold">{pair.nextExecution}</p>
                </div>
              </div>

              <div className="w-full md:w-48">
                <p className="text-sm text-gray-400 mb-2">Execution Progress</p>
                <Progress
                  value={pair.progress}
                  color="primary"
                  className="w-full"
                  showValueLabel={true}
                />
              </div>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}