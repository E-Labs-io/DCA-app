/** @format */

import React from "react";
import { Button, Card, CardBody } from "@nextui-org/react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
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

// Dark-surface categorical slots 1 and 2 from the validated dataviz
// palette. Received and price are different entities, so they carry
// different hues; each chart is single-series on a single axis.
const SERIES_RECEIVED = "#3987e5";
const SERIES_PRICE = "#d95926";
const INK_SECONDARY = "#c3c2b7";
const GRID_STROKE = "rgba(195, 194, 183, 0.15)";

const chartTooltipStyle = {
  backgroundColor: "#1a1a19",
  border: "1px solid #3f3f46",
  borderRadius: 8,
  color: "#ffffff",
};

interface ChartDataPoint {
  timestamp: string;
  // Target token received in this execution (normalised units); null when
  // the tx receipt couldn't be read.
  received: number | null;
  // Base per target actually paid in this execution (e.g. USDC per WETH).
  price: number | null;
}

function prepareChartData(
  executions: ExecutionStats[] | undefined,
  strategy: IDCADataStructures.StrategyStruct
): ChartDataPoint[] {
  if (!executions || executions.length === 0) return [];

  const baseDecimals = Number(strategy.baseToken.decimals);
  const targetDecimals = Number(strategy.targetToken.decimals);

  return executions.map((execution) => {
    const spent = Number(execution.amount) / 10 ** baseDecimals;
    const received =
      execution.amountOut !== null && execution.amountOut > 0
        ? execution.amountOut / 10 ** targetDecimals
        : null;

    return {
      timestamp: format(new Date(execution.timestamp * 1000), "MMM dd HH:mm"),
      received,
      price: received ? spent / received : null,
    };
  });
}

const formatTargetAmount = (value: number) =>
  value >= 1 ? value.toFixed(4) : value.toPrecision(4);

const formatPrice = (value: number) =>
  value.toLocaleString(undefined, { maximumFractionDigits: 2 });

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-content2 px-3 py-2">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
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
  const targetTicker = getTokenTicker(strategy.targetToken);

  const baseDecimals = Number(strategy.baseToken.decimals);
  const targetDecimals = Number(strategy.targetToken.decimals);

  const totalInvested = stats ? stats.totalCumulated / 10 ** baseDecimals : 0;
  const totalReceived =
    stats?.totalReceived != null
      ? stats.totalReceived / 10 ** targetDecimals
      : null;
  const avgPrice =
    totalReceived && totalReceived > 0 ? totalInvested / totalReceived : null;

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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <StatTile
                  label={`Total Invested (${baseTicker})`}
                  value={
                    stats
                      ? formatTokenAmount(
                          BigInt(stats.totalCumulated),
                          strategy.baseToken
                        )
                      : "—"
                  }
                />
                <StatTile
                  label={`Total Received (${targetTicker})`}
                  value={
                    totalReceived != null
                      ? formatTargetAmount(totalReceived)
                      : "—"
                  }
                />
                <StatTile
                  label={`Avg Buy Price (${baseTicker}/${targetTicker})`}
                  value={avgPrice != null ? formatPrice(avgPrice) : "—"}
                />
                <StatTile
                  label="Executions"
                  value={String(stats?.totalExecutions ?? 0)}
                />
              </div>

              {chartData.length > 0 ? (
                <>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">
                      {targetTicker} received per execution
                    </div>
                    <div className="h-52 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid
                            stroke={GRID_STROKE}
                            vertical={false}
                          />
                          <XAxis
                            dataKey="timestamp"
                            tick={{ fill: INK_SECONDARY, fontSize: 11 }}
                            tickLine={false}
                            axisLine={{ stroke: GRID_STROKE }}
                            minTickGap={40}
                          />
                          <YAxis
                            tick={{ fill: INK_SECONDARY, fontSize: 11 }}
                            tickLine={false}
                            axisLine={false}
                            width={80}
                            tickFormatter={formatTargetAmount}
                          />
                          <Tooltip
                            contentStyle={chartTooltipStyle}
                            formatter={(value) => [
                              `${formatTargetAmount(Number(value))} ${targetTicker}`,
                              "Received",
                            ]}
                          />
                          <Bar
                            dataKey="received"
                            fill={SERIES_RECEIVED}
                            radius={[4, 4, 0, 0]}
                            maxBarSize={24}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-400 mb-1">
                      Buy price ({baseTicker} per {targetTicker})
                    </div>
                    <div className="h-52 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid
                            stroke={GRID_STROKE}
                            vertical={false}
                          />
                          <XAxis
                            dataKey="timestamp"
                            tick={{ fill: INK_SECONDARY, fontSize: 11 }}
                            tickLine={false}
                            axisLine={{ stroke: GRID_STROKE }}
                            minTickGap={40}
                          />
                          <YAxis
                            domain={["auto", "auto"]}
                            tick={{ fill: INK_SECONDARY, fontSize: 11 }}
                            tickLine={false}
                            axisLine={false}
                            width={80}
                            tickFormatter={formatPrice}
                          />
                          <Tooltip
                            contentStyle={chartTooltipStyle}
                            formatter={(value) => [
                              `${formatPrice(Number(value))} ${baseTicker}/${targetTicker}`,
                              "Price",
                            ]}
                          />
                          {avgPrice != null && (
                            <ReferenceLine
                              y={avgPrice}
                              stroke={INK_SECONDARY}
                              strokeDasharray="4 4"
                              label={{
                                value: `avg ${formatPrice(avgPrice)}`,
                                fill: INK_SECONDARY,
                                fontSize: 11,
                                position: "insideTopRight",
                              }}
                            />
                          )}
                          <Line
                            type="monotone"
                            dataKey="price"
                            stroke={SERIES_PRICE}
                            strokeWidth={2}
                            dot={{ r: 3, fill: SERIES_PRICE }}
                            connectNulls
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-40 w-full flex items-center justify-center text-gray-500">
                  No executions yet
                </div>
              )}

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
