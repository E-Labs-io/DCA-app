/** @format */

"use client";

import { Card, CardBody } from "@nextui-org/react";

import { useAccountStats } from "@/hooks/useAccountStats";
import { IDCADataStructures } from "@/types/contracts/contracts/base/DCAAccount";
import { EthereumAddress } from "@/types/generic";
import { FundUnfundAccountModal } from "@/components/modals/FundUnfundAccountModal";
import { useState, useEffect, useRef } from "react";

import { useAppKitAccount } from "@reown/appkit/react";
import { StrategyCard } from "../ui/strategy/StrategyCard";
import { NetworkKeys } from "@/types";
import { Signer } from "ethers";
import { useAccountStore } from "@/lib/store/accountStore";
import { useDCAFactory } from "@/hooks/useDCAFactory";
import { useDCAProvider } from "@/lib/providers/DCAStatsProvider";

export interface StrategyViewProps {
  ACTIVE_NETWORK: NetworkKeys;
  Signer: Signer;
}

export function StrategyView({ ACTIVE_NETWORK, Signer }: StrategyViewProps) {
  const { getAllData, tokenBalances, executionTimings, totalExecutions } =
    useAccountStats();
  const {
    accounts,
    selectedAccount,
    setSelectedAccount,
    setAccounts,
    accountStrategies,
  } = useDCAProvider();

  // Get all strategies from all accounts
  const allStrategies = Object.values(accountStrategies).flat();

  // Calculate total active strategies
  const totalActiveStrategies = allStrategies.filter(
    (strategy) => strategy?.active
  ).length;

  const { isConnected } = useAppKitAccount();
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);
  const [isFundModalOpen, setIsFundModalOpen] = useState(false);
  const [modalTokens, setModalTokens] = useState<
    IDCADataStructures.TokenDataStruct[]
  >([]);
  const [actionType, setActionType] = useState<"fund" | "unfund" | "withdraw">(
    "fund"
  );
  const [isLoading, setIsLoading] = useState(true);
  const hasLoadedRef = useRef(false);

  const handleFundingModal = (
    type: "fund" | "unfund" | "withdraw",
    tokens: IDCADataStructures.TokenDataStruct[],
    accountAddress: EthereumAddress
  ) => {
    setModalTokens(tokens);
    setActionType(type);
    setSelectedAccount(accountAddress as string);
    setIsFundModalOpen(true);
  };

  useEffect(() => {
    if (!isConnected || hasLoadedRef.current) return;

    const loadAccounts = async () => {
      try {
        setIsLoading(true);
        const userAccounts = await getUsersAccounts();

        if (userAccounts?.length > 0) {
          setAccounts(userAccounts as `0x${string}`[]);
          await getAllData();
        }

        hasLoadedRef.current = true;
      } catch (error) {
        console.error("Error loading accounts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAccounts();
  }, [isConnected, getUsersAccounts, setAccounts, getAllData]);

  if (!isConnected) {
    return (
      <Card>
        <CardBody className="text-center py-8">
          <p className="text-gray-400">
            Please connect your wallet to view strategies.
          </p>
        </CardBody>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6">
        {[1, 2].map((i) => (
          <Card key={i} className="w-full animate-pulse">
            <CardBody className="h-24" />
          </Card>
        ))}
      </div>
    );
  }

  if (!allStrategies.length) {
    return (
      <Card>
        <CardBody className="text-center py-8">
          <p className="text-gray-400">
            No strategies found. Create a strategy to get started!
          </p>
        </CardBody>
      </Card>
    );
  } else
    return (
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardBody>
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Strategy Overview</h3>
                <p className="text-sm text-gray-400">
                  {totalActiveStrategies} Active / {allStrategies.length} Total
                  Strategies
                </p>
                <p className="text-sm text-gray-400">
                  Total Executions: {totalExecutions}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
        {allStrategies.map((strategy: IDCADataStructures.StrategyStruct) => {
          const isExpanded =
            selectedStrategy === strategy?.strategyId.toString();
          return (
            <StrategyCard
              key={strategy.strategyId}
              strategy={strategy}
              selectedStrategy={selectedStrategy}
              ACTIVE_NETWORK={ACTIVE_NETWORK}
              setSelectedStrategy={(id) => {
                setSelectedStrategy(isExpanded ? null : id);
              }}
              handleFundingModal={handleFundingModal}
              isExpanded={isExpanded}
              tokenBalances={tokenBalances}
              executionTimings={executionTimings}
            />
          );
        })}
        <FundUnfundAccountModal
          isOpen={isFundModalOpen}
          onClose={() => setIsFundModalOpen(false)}
          tokens={modalTokens}
          actionType={actionType}
          accountAddress={selectedAccount}
        />
      </div>
    );
}
