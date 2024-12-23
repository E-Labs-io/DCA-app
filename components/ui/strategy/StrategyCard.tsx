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
import { IDCADataStructures } from "@/types/contracts/contracts/base/DCAAccount";
import { StrategyHeader } from "./StrategyHeader";
import { EthereumAddress } from "@/types/generic";
import { NetworkKeys } from "@/types/Chains";
import { useDCAProvider } from "@/lib/providers/DCAStatsProvider";

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

export function StrategyCard({
  strategy,
  ACTIVE_NETWORK,
  setSelectedStrategy,
  handleFundingModal,
  isExpanded,
}: StrategyCardProps) {
  const { getStrategyStats } = useDCAProvider();

  const mockChartData = Array.from({ length: 10 }, (_, i) => ({
    execution: `Execution ${i + 1}`,
    amount: Math.random() * 1000 + 500,
  }));

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
