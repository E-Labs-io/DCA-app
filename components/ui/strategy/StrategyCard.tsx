/** @format */

import React from "react";
import { Button, Card, CardBody } from "@nextui-org/react";
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
import { ExecutionStats, useDCAProvider } from "@/providers/DCAStatsProvider";
import { format } from "date-fns";
import { useTokenFormatter } from "@/hooks/useTokenFormatter";
import { getTokenTicker } from "@/helpers/tokenData";

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
  amount: number;
  cumulative: number;
}

// Execution amounts are amountIn, so everything here is denominated in the
// base token — we chart spend per execution and cumulative spend, not a
// target-token series we don't have data for.
function prepareChartData(
  executions: ExecutionStats[] | undefined,
  strategy: IDCADataStructures.StrategyStruct
): ChartDataPoint[] {
  if (!executions || executions.length === 0) return [];

  let cumulative = 0;
  return executions.map((execution) => {
    const timestamp = format(
      new Date(execution.timestamp * 1000),
      "MMM dd HH:mm"
    );
    const amount =
      Number(execution.amount) / 10 ** Number(strategy.baseToken.decimals);
    cumulative += amount;

    return {
      timestamp,
      amount,
      cumulative,
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
  const { formatTokenAmount } = useTokenFormatter();

  const stats = getStrategyStats(
    strategy.accountAddress,
    Number(strategy.strategyId)
  );

  const chartData = prepareChartData(stats?.executions, strategy);
  const baseTicker = getTokenTicker(strategy.baseToken);

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
            stats={stats}
            isExpanded={isExpanded}
            onToggle={onSelect}
          />

          {isExpanded && (
            <div className="mt-4 space-y-6">
              {chartData.length > 0 ? (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <XAxis dataKey="timestamp" />
                      <YAxis />
                      <Tooltip />
                      <Legend />

                      <Line
                        type="monotone"
                        dataKey="amount"
                        name={`${baseTicker} per Execution`}
                        stroke="#82ca9d"
                      />
                      <Line
                        type="monotone"
                        dataKey="cumulative"
                        name={`Total ${baseTicker} Invested`}
                        stroke="#8884d8"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 w-full flex items-center justify-center text-gray-500">
                  No executions yet
                </div>
              )}

              <div className="flex justify-between items-center text-sm text-gray-500">
                <div>Total Executions: {stats?.totalExecutions ?? 0}</div>
                <div>
                  Total Invested:{" "}
                  {stats
                    ? `${formatTokenAmount(
                        BigInt(stats.totalCumulated),
                        strategy.baseToken
                      )} ${baseTicker}`
                    : "No executions yet"}
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
              </div>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
