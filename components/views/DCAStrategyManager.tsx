'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody, Button, Spinner, Tooltip } from '@nextui-org/react';
import { Plus, Play, Pause, RefreshCw, Trash2, Clock } from 'lucide-react';
import { useDCAAccount } from '@/hooks/useDCAAccount';
import { useAccountStats } from '@/hooks/useAccountStats';
import { useDCAStrategy } from '@/hooks/useDCAStrategy';
import { CreateStrategyModal } from '@/components/modals/CreateStrategyModal';
import { toast } from 'sonner';
import { formatUnits } from 'viem';
import { usePublicClient } from 'wagmi';
import { type StrategyStruct } from '@/lib/types/dca';

interface DCAStrategyManagerProps {
  accountAddress: string;
}

interface StrategyCardProps {
  strategy: StrategyStruct;
  accountAddress: string;
}

function StrategyCard({ strategy, accountAddress }: StrategyCardProps) {
  const publicClient = usePublicClient();
  const { getTimeTillNextExecution, pauseStrategy, resumeStrategy, deleteStrategy } = useDCAStrategy(accountAddress, BigInt(strategy.strategyId));
  const [isProcessing, setIsProcessing] = useState(false);
  const [timeTillNextExecution, setTimeTillNextExecution] = useState<{
    lastExecution: number;
    secondsLeft: number;
    isReady: boolean;
  } | null>(null);

  // Fetch time till next execution periodically
  useEffect(() => {
    let interval: NodeJS.Timeout;

    const fetchTime = async () => {
      const time = await getTimeTillNextExecution();
      setTimeTillNextExecution(time);
    };

    // Initial fetch
    fetchTime();

    // Update every minute
    interval = setInterval(fetchTime, 60000);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [getTimeTillNextExecution]);

  const handleStrategyAction = async (action: 'pause' | 'resume' | 'delete') => {
    if (isProcessing || !publicClient) return;
    setIsProcessing(true);

    try {
      let hash;
      switch (action) {
        case 'pause':
          hash = await pauseStrategy();
          break;
        case 'resume':
          hash = await resumeStrategy();
          break;
        case 'delete':
          hash = await deleteStrategy();
          break;
      }

      if (hash) {
        toast.loading('Waiting for confirmation...');
        await publicClient.waitForTransactionReceipt({ 
          hash
        });
        toast.success(`Strategy ${action}d successfully`);
      }
    } catch (error: any) {
      toast.error(error.message || `Failed to ${action} strategy`);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTimeLeft = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  return (
    <Card className="w-full">
      <CardBody>
        <div className="flex justify-between items-center">
          <div>
            <h4 className="font-medium">
              {strategy.baseToken.ticker} → {strategy.targetToken.ticker}
            </h4>
            <p className="text-sm text-gray-500">
              {formatUnits(BigInt(strategy.amount), Number(strategy.baseToken.decimals))}{' '}
              {strategy.baseToken.ticker} every {Number(strategy.interval) / 3600} hours
            </p>
            {timeTillNextExecution && (
              <div className="flex items-center gap-1 mt-1">
                <Clock size={14} className="text-gray-400" />
                <span className="text-xs text-gray-400">
                  {timeTillNextExecution.isReady 
                    ? 'Ready for execution'
                    : `Next execution in ${formatTimeLeft(timeTillNextExecution.secondsLeft)}`
                  }
                </span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Tooltip content={strategy.active ? 'Pause Strategy' : 'Resume Strategy'}>
              <Button
                isIconOnly
                variant="light"
                onClick={() => handleStrategyAction(strategy.active ? 'pause' : 'resume')}
                isLoading={isProcessing}
              >
                {strategy.active ? <Pause size={20} /> : <Play size={20} />}
              </Button>
            </Tooltip>
            <Tooltip content="Delete Strategy">
              <Button
                isIconOnly
                variant="light"
                color="danger"
                onClick={() => handleStrategyAction('delete')}
                isLoading={isProcessing}
              >
                <Trash2 size={20} />
              </Button>
            </Tooltip>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

export function DCAStrategyManager({ accountAddress }: DCAStrategyManagerProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { strategies = [], isCreatingStrategy } = useDCAAccount(accountAddress);
  const { isLoading: isLoadingStats } = useAccountStats();

  const handleCreateStrategy = () => {
    setIsCreateModalOpen(true);
  };

  if (isLoadingStats) {
    return (
      <Card className="w-full">
        <CardBody className="flex items-center justify-center py-8">
          <Spinner size="lg" />
        </CardBody>
      </Card>
    );
  }

  return (
    <>
      <Card className="w-full">
        <CardBody>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">DCA Strategies</h3>
            <Button
              color="primary"
              endContent={<Plus size={20} />}
              onClick={handleCreateStrategy}
              isLoading={isCreatingStrategy}
            >
              Create Strategy
            </Button>
          </div>

          {!Array.isArray(strategies) || strategies.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No strategies found</p>
              <Button
                color="primary"
                variant="flat"
                onClick={handleCreateStrategy}
                isLoading={isCreatingStrategy}
              >
                Create your first strategy
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {strategies.map((strategy: StrategyStruct) => (
                <StrategyCard 
                  key={strategy.strategyId.toString()} 
                  strategy={strategy}
                  accountAddress={accountAddress}
                />
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      <CreateStrategyModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        accountAddress={accountAddress}
      />
    </>
  );
} 