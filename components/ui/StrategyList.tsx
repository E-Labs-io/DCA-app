/** @format */

"use client";

import { Card, CardBody, Button, Chip } from "@nextui-org/react";
import { Play, StopCircle, Settings, AlertCircle, Wallet } from "lucide-react";
import { tokenList, TokenTickers } from "@/constants/tokens";
import Image from "next/image";
import { IDCADataStructures } from "@/types/contracts/contracts/base/DCAAccount";
import { useDCAAccount } from "@/hooks/useDCAAccount";
import { useAccountStats } from "@/hooks/useAccountStats";
import { useAccountStore } from "@/lib/store/accountStore";
import { toast } from "sonner";
import { formatUnits } from "viem";
import { useState } from "react";
import { FundStrategyModal } from "../modals/FundStrategyModal";

interface StrategyListProps {
  accountAddress: string;
  strategies: IDCADataStructures.StrategyStruct[];
}

const INTERVAL_LABELS: { [key: number]: string } = {
  60: "1 Minute [DEV]",
  300: "5 Minutes [DEV]",
  3600: "1 Hour",
  86400: "1 Day",
  604800: "1 Week",
  2592000: "1 Month",
};

export function StrategyList({
  accountAddress,
  strategies,
}: StrategyListProps) {
  const { subscribeStrategy, unsubscribeStrategy } =
    useDCAAccount(accountAddress);
  const { tokenBalances, getAllData } = useAccountStats();
  const { setAccountStrategies } = useAccountStore();
  const [selectedStrategy, setSelectedStrategy] =
    useState<IDCADataStructures.StrategyStruct | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const handleSubscriptionToggle = async (
    strategy: IDCADataStructures.StrategyStruct
  ) => {
    try {
      setIsUpdating(Number(strategy.strategyId).toString());
      if (strategy.active) {
        await toast.promise(
          unsubscribeStrategy(strategy.strategyId).then(async (result) => {
            if (result) {
              const updatedStrategies = strategies.map((s) =>
                s.strategyId === strategy.strategyId
                  ? { ...s, active: false }
                  : s
              );
              setAccountStrategies(accountAddress, updatedStrategies);
              await getAllData();
            }
            return result;
          }),
          {
            loading: "Unsubscribing from strategy...",
            success: "Successfully unsubscribed from strategy",
            error: "Failed to unsubscribe from strategy",
          }
        );
      } else {
        await toast.promise(
          subscribeStrategy(strategy.strategyId).then(async (result) => {
            if (result) {
              const updatedStrategies = strategies.map((s) =>
                s.strategyId === strategy.strategyId
                  ? { ...s, active: true }
                  : s
              );
              setAccountStrategies(accountAddress, updatedStrategies);
              await getAllData();
            }
            return result;
          }),
          {
            loading: "Subscribing to strategy...",
            success: "Successfully subscribed to strategy",
            error: "Failed to subscribe to strategy",
          }
        );
      }
    } catch (error) {
      console.error("Error toggling strategy subscription:", error);
    } finally {
      setIsUpdating(null);
    }
  };

  const getTokenIcon = (token: IDCADataStructures.TokenDataStruct) => {
    if (!token?.ticker) return "";
    const ticker = token.ticker as TokenTickers;
    return tokenList[ticker]?.icon ?? "";
  };

  const getTokenTicker = (token: IDCADataStructures.TokenDataStruct) => {
    if (!token?.ticker) return "Unknown";
    return token.ticker;
  };

  const getTokenBalance = (token: IDCADataStructures.TokenDataStruct) => {
    const accountBalances = tokenBalances[accountAddress];
    if (!accountBalances) return null;

    const balance = accountBalances[token.tokenAddress.toString()];
    if (!balance) return null;

    return {
      ...balance,
      formattedBalance: formatUnits(balance.balance, Number(token.decimals)),
    };
  };

  const getIntervalLabel = (interval: bigint) => {
    return INTERVAL_LABELS[Number(interval)] || `${interval} seconds`;
  };

  return (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold">Active Strategies</h4>
      <div className="space-y-4">
        {strategies?.map((strategy) => {
          const baseTokenBalance = getTokenBalance(strategy.baseToken);

          return (
            <div key={strategy.strategyId}>
              <Card className="w-full">
                <CardBody>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Image
                          src={getTokenIcon(strategy.baseToken)}
                          alt={getTokenTicker(strategy.baseToken)}
                          width={24}
                          height={24}
                          className="rounded-full"
                        />
                        <span>{getTokenTicker(strategy.baseToken)}</span>
                        <span>→</span>
                        <Image
                          src={getTokenIcon(strategy.targetToken)}
                          alt={getTokenTicker(strategy.targetToken)}
                          width={24}
                          height={24}
                          className="rounded-full"
                        />
                        <span>{getTokenTicker(strategy.targetToken)}</span>
                      </div>
                      <div className="flex gap-2">
                        <Chip
                          color={strategy.active ? "success" : "warning"}
                          size="sm"
                        >
                          {strategy.active ? "Active" : "Paused"}
                        </Chip>
                        <Chip color="primary" size="sm">
                          {getIntervalLabel(BigInt(strategy.interval))}
                        </Chip>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <p className="text-sm text-gray-400">Balance:</p>
                          <p className="font-semibold">
                            {baseTokenBalance ? (
                              <>
                                {baseTokenBalance.formattedBalance}{" "}
                                {getTokenTicker(strategy.baseToken)}
                                {baseTokenBalance.needsTopUp && (
                                  <span className="ml-2 text-warning">
                                    <AlertCircle size={16} className="inline" />
                                    {baseTokenBalance.remainingExecutions}{" "}
                                    executions remaining
                                  </span>
                                )}
                              </>
                            ) : (
                              "Loading..."
                            )}
                          </p>
                        </div>
                        <p className="text-sm text-gray-400">
                          Amount per execution:{" "}
                          {formatUnits(
                            BigInt(strategy.amount),
                            Number(strategy.baseToken.decimals)
                          )}{" "}
                          {getTokenTicker(strategy.baseToken)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          color="primary"
                          variant="light"
                          isIconOnly
                          startContent={<Wallet size={18} />}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedStrategy(strategy);
                          }}
                        />
                        <Button
                          size="sm"
                          color={strategy.active ? "warning" : "success"}
                          variant="light"
                          isIconOnly
                          isLoading={isUpdating === strategy.strategyId}
                          startContent={
                            strategy.active ? (
                              <StopCircle size={18} />
                            ) : (
                              <Play size={18} />
                            )
                          }
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSubscriptionToggle(strategy);
                          }}
                        />
                        <Button
                          size="sm"
                          color="primary"
                          variant="light"
                          isIconOnly
                          startContent={<Settings size={18} />}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          );
        })}
        {(!strategies || strategies.length === 0) && (
          <Card>
            <CardBody className="text-center py-8">
              <p className="text-gray-400">
                No strategies found. Create your first strategy to get started!
              </p>
            </CardBody>
          </Card>
        )}
      </div>

      <FundStrategyModal
        isOpen={!!selectedStrategy}
        onClose={() => setSelectedStrategy(null)}
        strategy={selectedStrategy!}
      />
    </div>
  );
}
