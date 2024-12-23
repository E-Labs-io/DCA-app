/** @format */

"use client";

import { Card, CardBody } from "@nextui-org/react";

import { IDCADataStructures } from "@/types/contracts/contracts/base/DCAAccount";
import { EthereumAddress } from "@/types/generic";
import { FundUnfundAccountModal } from "@/components/modals/FundUnfundAccountModal";
import { useState, useEffect, useRef } from "react";

import { useAppKitAccount } from "@reown/appkit/react";
import { StrategyCard } from "../ui/strategy/StrategyCard";
import { NetworkKeys } from "@/types";
import { Signer } from "ethers";
import { useDCAProvider } from "@/lib/providers/DCAStatsProvider";

export interface StrategyViewProps {
  ACTIVE_NETWORK: NetworkKeys;
  Signer: Signer;
}

export function StrategyView({ ACTIVE_NETWORK, Signer }: StrategyViewProps) {
  const {
    accounts,
    walletStats,
    selectedAccount,
    setSelectedAccount,
    getAccountBalances,
  } = useDCAProvider();

  const [allStrategies, setAllStrategies] = useState<
    IDCADataStructures.StrategyStruct[]
  >([]);

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

  useEffect(() => {
    console.log("[StrategyView] accounts", accounts);
    if (allStrategies.length === 0 && accounts.length > 0) {
      setIsLoading(true);
      const strategies: IDCADataStructures.StrategyStruct[] = [];
      for (const account of accounts) {
        for (const strategy of account.strategies) {
          strategies.push(strategy);
        }
      }
      setAllStrategies(strategies);
      setIsLoading(false);
    }
  }, [accounts]);

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

  if (!accounts.length) {
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
        {allStrategies.map((strategy: IDCADataStructures.StrategyStruct) => {
          const isExpanded =
            selectedStrategy === strategy?.strategyId.toString();
          return (
            <StrategyCard
              key={strategy.strategyId}
              strategy={strategy}
              ACTIVE_NETWORK={ACTIVE_NETWORK}
              setSelectedStrategy={(id) => {
                setSelectedStrategy(isExpanded ? null : id);
              }}
              handleFundingModal={handleFundingModal}
              isExpanded={isExpanded}
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
