/** @format */

import React from "react";
import { Card, CardBody, Button, Progress, Tooltip } from "@nextui-org/react";
import {
  DCAAccount,
  IDCADataStructures,
} from "@/types/contracts/contracts/base/DCAAccount";
import { useReinvest } from "@/hooks/useReinvest";
import { formatUnits, Signer } from "ethers";
import Image from "next/image";

interface StrategyReinvestCardProps {
  strategy: IDCADataStructures.StrategyStruct;
  reinvestData: IDCADataStructures.ReinvestStruct;
  dcaAccount: DCAAccount;
  Signer: Signer;
  onSetupReinvest: () => void;
}

export function StrategyReinvestCard({
  strategy,
  reinvestData,
  dcaAccount,
  Signer,
  onSetupReinvest,
}: StrategyReinvestCardProps) {
  const { disableReinvest, loading } = useReinvest(dcaAccount, Signer);

  // If no reinvestment is active
  if (!reinvestData || !reinvestData.active) {
    return (
      <Card>
        <CardBody className="flex flex-col items-center p-6">
          <h4 className="text-lg font-semibold mb-4">Reinvestment</h4>
          <p className="text-gray-500 text-center mb-4">
            Reinvest your target tokens to generate additional returns
          </p>
          <Button color="primary" onPress={onSetupReinvest}>
            Setup Reinvestment
          </Button>
        </CardBody>
      </Card>
    );
  }

  // Get module info based on the active module
  const moduleInfo = getModuleInfo(reinvestData.moduleId);

  // For active reinvestment
  return (
    <Card>
      <CardBody className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h4 className="text-lg font-semibold">Reinvestment Active</h4>
          <div className="flex items-center space-x-2">
            <Image
              src={moduleInfo.logo}
              alt={moduleInfo.name}
              width={24}
              height={24}
            />
            <span>{moduleInfo.name}</span>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <div className="flex justify-between mb-1">
              <span>Total Reinvested</span>
              <span>
                {formatUnits(
                  strategy.totalReinvested || 0,
                  strategy.targetToken.decimals
                )}{" "}
                {strategy.targetToken.ticker}
              </span>
            </div>
            <Progress
              value={strategy.reinvestPercentage || 0}
              color="success"
              size="sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">APY</p>
              <p className="font-semibold">{moduleInfo.apy}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Earnings</p>
              <p className="font-semibold">
                {formatUnits(
                  strategy.reinvestEarnings || 0,
                  strategy.targetToken.decimals
                )}{" "}
                {strategy.targetToken.ticker}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Tooltip content="Disable reinvestment and withdraw tokens">
            <Button
              color="danger"
              variant="light"
              onPress={() => disableReinvest(Number(strategy.strategyId))}
              isLoading={loading}
            >
              Disable Reinvestment
            </Button>
          </Tooltip>
        </div>
      </CardBody>
    </Card>
  );
}

// Helper function to get module information
function getModuleInfo(moduleId: number) {
  switch (moduleId) {
    case 0x01:
      return {
        name: "Forward",
        logo: "/icons/forward.svg",
        apy: 0, // No APY for forwarding
      };
    case 0x12:
      return {
        name: "Aave V3",
        logo: "/icons/aave.svg",
        apy: 4.2,
      };
    case 0x11:
      return {
        name: "Compound V3",
        logo: "/icons/compound.svg",
        apy: 3.8,
      };
    default:
      return {
        name: "Unknown",
        logo: "/icons/unknown.svg",
        apy: 0,
      };
  }
}
