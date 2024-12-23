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
  Legend,
} from "recharts";
import { IDCADataStructures } from "@/types/contracts/contracts/base/DCAAccount";
import { StrategyHeader } from "./StrategyHeader";
import { EthereumAddress } from "@/types/generic";
import { NetworkKeys } from "@/types/Chains";
import {
  ExecutionStats,
  useDCAProvider,
} from "@/lib/providers/DCAStatsProvider";
import { format } from "date-fns";

export interface StrategyCardProps {
  strategy: IDCADataStructures.StrategyStruct;
  ACTIVE_NETWORK: NetworkKeys;
  setSelectedStrategy: (strategyId: string | null) => void;
  handleFundingModal: (
    type: "fund" | "unfund" | "withdraw",
    tokens: IDCADataStructures.TokenDataStruct[],
    accountAddress: EthereumAddress
  ) => void;
  isExpanded: boolean;
}

interface ChartDataPoint {
  timestamp: string;
  baseAmount: number;
  targetAmount: number;
  rate?: number;
}

function prepareChartData(
  executions: ExecutionStats[] | undefined,
  strategy: IDCADataStructures.StrategyStruct
): ChartDataPoint[] {
  if (!executions || executions.length === 0) return [];

  return executions.map((execution) => {
    const timestamp = format(
      new Date(execution.timestamp * 1000),
      "MMM dd HH:mm"
    );
    const baseAmount =
      Number(execution.amount) / 10 ** Number(strategy.baseToken.decimals);
    const targetAmount =
      Number(execution.amount) / 10 ** Number(strategy.targetToken.decimals);

    // Calculate rate (optional)
    const rate = baseAmount > 0 ? targetAmount / baseAmount : 0;

    return {
      timestamp,
      baseAmount,
      targetAmount,
      rate,
    };
  });
}

export function StrategyCard({
  strategy,
  ACTIVE_NETWORK,
  setSelectedStrategy,
  handleFundingModal,
  isExpanded,
}: StrategyCardProps) {
  const { getStrategyStats } = useDCAProvider();

  const executions = getStrategyStats(
    strategy.accountAddress,
    Number(strategy.strategyId)
  )?.executions;

  const chartData = prepareChartData(executions, strategy);

  const onSelect = () => {
    setSelectedStrategy(isExpanded ? null : strategy.strategyId.toString());
  };

  return (
    <Card
      key={`${strategy.accountAddress}-${strategy.strategyId}`}
      className="w-full cursor-pointer"
      onClick={onSelect}
    >
      <CardBody>
        <div className="flex flex-col gap-4">
          <StrategyHeader
            ACTIVE_NETWORK={ACTIVE_NETWORK}
            strategy={strategy}
            stats={
              getStrategyStats(
                strategy.accountAddress,
                Number(strategy.strategyId)
              )!
            }
            isExpanded={isExpanded}
            onToggle={onSelect}
          />

          {isExpanded && (
            <div className="mt-4 space-y-6">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip />
                    <Legend />

                    <Line
                      type="monotone"
                      dataKey="targetAmount"
                      name={`${strategy.targetToken.ticker} Amount`}
                      stroke="#82ca9d"
                    />
                    <Line
                      type="monotone"
                      dataKey="rate"
                      name="Exchange Rate"
                      stroke="#ffc658"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="flex justify-between items-center text-sm text-gray-500">
                <div>
                  Total Executions:{" "}
                  {
                    getStrategyStats(
                      strategy.accountAddress,
                      Number(strategy.strategyId)
                    )!.totalExecutions
                  }
                </div>
                <div>
                  Strategy Worth:{" "}
                  {getStrategyStats(
                    strategy.accountAddress,
                    Number(strategy.strategyId)
                  )!.totalCumulated.toString()}
                </div>
              </div>

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
