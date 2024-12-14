/** @format */

import React from "react";
import { Button, Card, CardBody } from "@nextui-org/react";
import { Settings } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import useSigner from "@/hooks/useSigner";
import { IDCADataStructures } from "@/types/contracts/contracts/base/DCAAccount";
import { StrategyHeader } from "./StrategyHeader";
import { useAccountStats } from "@/hooks/useAccountStats";
import { EthereumAddress } from "@/types/generic";
import { ExternalLink } from "lucide-react";
import { buildNetworkScanLink } from "@/lib/helpers/buildScanLink";
import { formatDistanceToNow } from "date-fns";

export interface StrategyCardProps {
  strategy: IDCADataStructures.StrategyStruct;
  selectedStrategy: string | null;
  setSelectedStrategy: (strategyId: string | null) => void;
  handleFundingModal: (
    type: "fund" | "unfund" | "withdraw",
    tokens: IDCADataStructures.TokenDataStruct[],
    accountAddress: EthereumAddress
  ) => void;
}

export function StrategyCard({
  strategy,
  selectedStrategy,
  setSelectedStrategy,
  handleFundingModal,
}: StrategyCardProps) {
  const { ACTIVE_NETWORK } = useSigner();
  const { executionTimings } = useAccountStats();

  const getStrategyStats = () => {
    const timing =
      executionTimings[strategy.accountAddress as string]?.[
        Number(strategy.strategyId)
      ];
    const isExpanded = selectedStrategy === strategy.strategyId;

    // Mock values - replace with real data from events
    const executionCount = 10;
    const totalSpent = BigInt(1000000);
    const averageExecution = totalSpent / BigInt(executionCount);

    return { isExpanded, timing, executionCount, totalSpent, averageExecution };
  };

  // Mock chart data - replace with real data from events
  const mockChartData = Array.from({ length: 10 }, (_, i) => ({
    execution: `Execution ${i + 1}`,
    amount: Math.random() * 1000 + 500,
  }));

  return (
    <Card
      key={`${strategy.accountAddress}-${strategy.strategyId}`}
      className="w-full cursor-pointer"
      onClick={() =>
        setSelectedStrategy(
          getStrategyStats().isExpanded ? null : strategy.strategyId.toString()
        )
      }
    >
      <CardBody>
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <StrategyHeader
              strategy={strategy}
              executionCount={getStrategyStats().executionCount}
              totalSpent={getStrategyStats().totalSpent}
              averageExecution={getStrategyStats().averageExecution}
            />

            <div className="flex items-center gap-2">
              <Button
                as="a"
                href={buildNetworkScanLink({
                  network: ACTIVE_NETWORK!,
                  address: strategy.accountAddress as string,
                })}
                target="_blank"
                rel="noopener noreferrer"
                isIconOnly
                variant="light"
                size="sm"
              >
                <ExternalLink size={18} />
              </Button>
            </div>
          </div>

          {/* Basic Stats Always Visible */}
          <div className="flex justify-between items-center text-sm text-gray-500">
            <div>
              Next Execution:{" "}
              {getStrategyStats().timing?.nextExecution
                ? formatDistanceToNow(
                    new Date(getStrategyStats().timing.nextExecution * 1000),
                    {
                      addSuffix: true,
                    }
                  )
                : "N/A"}
            </div>
            <div>Total Executions: {getStrategyStats().executionCount}</div>
          </div>

          {/* Expanded Content */}
          {getStrategyStats().isExpanded && (
            <div className="mt-4 space-y-6">
              {/* Chart */}
              <div className="h-64 w-full">
                <ResponsiveContainer>
                  <LineChart data={mockChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="execution" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="#8884d8"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Button
                    color="primary"
                    onPress={() =>
                      handleFundingModal(
                        "fund",
                        [strategy.baseToken],
                        strategy.accountAddress
                      )
                    }
                  >
                    Fund
                  </Button>
                  <Button
                    color="warning"
                    onPress={() =>
                      handleFundingModal(
                        "unfund",
                        [strategy.baseToken],
                        strategy.accountAddress
                      )
                    }
                  >
                    Unfund
                  </Button>
                  <Button
                    color="secondary"
                    onPress={() =>
                      handleFundingModal(
                        "withdraw",
                        [strategy.targetToken],
                        strategy.accountAddress
                      )
                    }
                  >
                    Withdraw
                  </Button>
                </div>

                <Button
                  color="primary"
                  variant="bordered"
                  startContent={<Settings size={18} />}
                >
                  Reinvest Settings
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
