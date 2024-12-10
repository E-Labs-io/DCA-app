/** @format */

"use client";

import { Card, CardBody, Button, Progress, Chip } from "@nextui-org/react";
import { Play, Pause, Settings } from "lucide-react";
import { tokenList } from "@/lib/config/tokens";
import Image from "next/image";
import { IDCADataStructures } from "@/types/contracts/contracts/base/DCAAccount";

interface StrategyListProps {
  accountAddress: string;
  strategies: IDCADataStructures.StrategyStruct[]; // Array of strategy structs
}

export function StrategyList({
  accountAddress,
  strategies,
}: StrategyListProps) {
  return (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold">Active Strategies</h4>
      <div className="space-y-4">
        {strategies.map(
          (strategy: IDCADataStructures.StrategyStruct, index) => (
            <Card key={index} className="w-full">
              <CardBody>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Image
                        src={tokenList[strategy.baseToken.ticker as keyof typeof tokenList]?.icon ?? ""}
                        alt={strategy.baseToken.ticker}
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                      <span>{strategy.baseToken.ticker}</span>
                      <span>→</span>
                      <Image
                        src={tokenList[strategy.targetToken.ticker as keyof typeof tokenList]?.icon ?? ""}
                        alt={strategy.targetToken.ticker}
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                      <span>{strategy.targetToken.ticker}</span>
                    </div>
                    <Chip color="success" size="sm">
                      Active
                    </Chip>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Next Execution</p>
                      <p className="font-semibold">2h 15m</p>
                    </div>
                    <Button
                      size="sm"
                      color="warning"
                      variant="light"
                      isIconOnly
                      startContent={<Pause size={18} />}
                    />
                    <Button
                      size="sm"
                      color="primary"
                      variant="light"
                      isIconOnly
                      startContent={<Settings size={18} />}
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">
                      Progress until next execution
                    </span>
                    <span className="text-gray-400">75%</span>
                  </div>
                  <Progress value={75} color="primary" size="sm" />
                </div>
              </CardBody>
            </Card>
          )
        )}
      </div>
    </div>
  );
}
