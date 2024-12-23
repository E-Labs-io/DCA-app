/** @format */

"use client";

import { Card, CardBody, Button, Chip } from "@nextui-org/react";
import { Play, StopCircle, Settings, AlertCircle, Wallet } from "lucide-react";
import { tokenList, TokenTickers } from "@/constants/tokens";
import Image from "next/image";
import { IDCADataStructures } from "@/types/contracts/contracts/base/DCAAccount";
import { useDCAAccount } from "@/hooks/useDCAAccount";
import { toast } from "sonner";
import { formatUnits } from "viem";
import { useState, useEffect } from "react";
import { getTokenIcon, getTokenTicker } from "@/helpers/tokenData";
import { FundUnfundAccountModal } from "../../modals/FundUnfundAccountModal";
import { EthereumAddress } from "@/types/generic";
import useSigner from "@/hooks/useSigner";
import { useDCAProvider } from "@/providers/DCAStatsProvider";
import { CreateStrategyModal } from "@/components/modals/CreateStrategyModal";

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
  const { Signer, ACTIVE_NETWORK } = useSigner();
  const {
    getAccountInstance,
    selectedAccount,
    getAccountBalances,
    getStrategyStats,
  } = useDCAProvider();
  const { subscribeStrategy, getAccountBaseTokens, unsubscribeStrategy } =
    useDCAAccount(getAccountInstance(accountAddress as string)!, Signer!);
  const [selectedStrategy, setSelectedStrategy] =
    useState<IDCADataStructures.StrategyStruct | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(
    Math.floor(Date.now() / 1000)
  );

  const [isCreateStrategyOpen, setIsCreateStrategyOpen] = useState(false);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSubscriptionToggle = async (
    strategy: IDCADataStructures.StrategyStruct
  ) => {
    try {
      setIsUpdating(Number(strategy.strategyId).toString());
      if (strategy.active) {
        toast.promise(
          unsubscribeStrategy(strategy.strategyId).then(async (result) => {
            if (result) {
              const updatedStrategies = strategies.map((s) =>
                s.strategyId === strategy.strategyId
                  ? { ...s, active: false }
                  : s
              );
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
        toast.promise(
          subscribeStrategy(strategy.strategyId).then(async (result) => {
            if (result) {
              const updatedStrategies = strategies.map((s) =>
                s.strategyId === strategy.strategyId
                  ? { ...s, active: true }
                  : s
              );
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

  const getTokenBalance = (token: IDCADataStructures.TokenDataStruct) => {
    const accountBalances = getAccountBalances(accountAddress);
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

  const getExecutionTiming = (strategy: IDCADataStructures.StrategyStruct) => {
    const accountTimings = getStrategyStats(
      accountAddress,
      Number(strategy.strategyId)
    );
    if (!accountTimings) return null;

    const nextExecutionIn = accountTimings?.lastExecution ?? 0 - currentTime;
    return {
      nextExecutionIn,
      formattedNextExecution:
        nextExecutionIn > 0
          ? `Next execution in ${formatTimeRemaining(nextExecutionIn)}`
          : "Execution pending...",
    };
  };

  const formatTimeRemaining = (seconds: number) => {
    if (seconds <= 0) return "now";

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (remainingSeconds > 0 && hours === 0) parts.push(`${remainingSeconds}s`);

    return parts.join(" ");
  };

  const getBaseTokenData = (strategy: IDCADataStructures.StrategyStruct) => {
    return {
      address: strategy.baseToken.tokenAddress,
      label: strategy.baseToken.ticker,
      ticker: strategy.baseToken.ticker,
      icon: getTokenIcon(strategy.baseToken),
    };
  };

  return (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold">Account Strategies</h4>
      <div className="space-y-4">
        {strategies?.map((strategy) => {
          const baseTokenBalance = getTokenBalance(strategy.baseToken);
          const executionTiming = getExecutionTiming(strategy);

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

                        <Chip color="default" size="sm">
                          ID: {strategy.strategyId.toString()}
                        </Chip>

                        {strategy.active &&
                          executionTiming &&
                          executionTiming.nextExecutionIn > 0 && (
                            <Chip color="default" size="sm">
                              {executionTiming.formattedNextExecution}
                            </Chip>
                          )}
                        {strategy.reinvest.active && (
                          <Chip color="success" size="sm">
                            Reinvest Active
                          </Chip>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <p className="text-sm text-gray-400">Balance:</p>
                          <p className="font-semibold">
                            {baseTokenBalance ? (
                              <a
                                href={`https://etherscan.io/token/${strategy.baseToken}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Image
                                  src={getTokenIcon(strategy.baseToken)}
                                  alt={getTokenTicker(strategy.baseToken)}
                                  width={16}
                                  height={16}
                                  className="inline-block mr-1"
                                />
                                {getTokenTicker(strategy.baseToken)}
                              </a>
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
              <br />
              <Button
                color="secondary"
                startContent={<Settings size={20} />}
                onPress={() => setIsCreateStrategyOpen(true)}
              >
                New Strategy
              </Button>
            </CardBody>
          </Card>
        )}
      </div>
      {selectedStrategy && (
        <FundUnfundAccountModal
          isOpen={!!selectedStrategy}
          onClose={() => setSelectedStrategy(null)}
          tokens={selectedStrategy ? [selectedStrategy.baseToken] : []}
          actionType="fund"
          accountAddress={accountAddress as EthereumAddress}
        />
      )}
      {isCreateStrategyOpen && selectedAccount && (
        <CreateStrategyModal
          isOpen={isCreateStrategyOpen}
          onClose={() => setIsCreateStrategyOpen(false)}
          accountAddress={getAccountInstance(accountAddress as string)!}
          Signer={Signer}
          ACTIVE_NETWORK={ACTIVE_NETWORK!}
        />
      )}
    </div>
  );
}
