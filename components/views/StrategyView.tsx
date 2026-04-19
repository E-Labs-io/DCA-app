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
import { useDCAProvider } from "@/providers/DCAStatsProvider";
import { dbg } from '@/helpers/debug';

export interface StrategyViewProps {
  ACTIVE_NETWORK: NetworkKeys;
  Signer: Signer;
}

export function StrategyView({ ACTIVE_NETWORK, Signer }: StrategyViewProps) {
  dbg("[StrategyView] Component rendered/re-rendered");

  const {
    accounts,
    walletStats,
    selectedAccount,
    setSelectedAccount,
    getAccountBalances,
  } = useDCAProvider();

  dbg("[StrategyView] useDCAProvider returned:", {
    accountsCount: accounts?.length || 0,
    walletStats,
    selectedAccount,
  });

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
    dbg("[StrategyView] ===== ACCOUNTS CHANGED =====");
    dbg("[StrategyView] Accounts received:", {
      accountsCount: accounts?.length || 0,
      accountsDetails:
        accounts?.map((a) => ({
          address: a.account,
          strategiesCount: a.strategies?.length || 0,
          strategiesIds: a.strategies?.map((s) => s.strategyId) || [],
        })) || [],
    });

    if (accounts && accounts.length > 0) {
      const strategies: IDCADataStructures.StrategyStruct[] = [];
      accounts.forEach((account) => {
        dbg(`[StrategyView] Processing account ${account.account}:`, {
          strategiesCount: account.strategies?.length || 0,
          strategies:
            account.strategies?.map((s) => ({
              id: s.strategyId,
              active: s.active,
              baseToken: s.baseToken.ticker,
              targetToken: s.targetToken.ticker,
            })) || [],
        });

        if (account.strategies && account.strategies.length > 0) {
          strategies.push(...account.strategies);
        }
      });

      dbg("[StrategyView] Final strategies to display:", {
        totalCount: strategies.length,
        strategies: strategies.map((s) => ({
          id: s.strategyId,
          active: s.active,
          baseToken: s.baseToken.ticker,
          targetToken: s.targetToken.ticker,
          accountAddress: s.accountAddress,
        })),
      });

      setAllStrategies(strategies);
      setIsLoading(false);
      dbg(
        "[StrategyView] Updated allStrategies state and set loading to false"
      );
    } else {
      dbg(
        "[StrategyView] No accounts available or accounts array is empty"
      );
    }
    dbg("[StrategyView] ===== ACCOUNTS PROCESSING COMPLETE =====");
  }, [
    accounts,
    accounts
      ?.map((a) =>
        // This will cause re-render when any strategy's active state changes
        a.strategies?.map((s) => s.active).join(",")
      )
      .join(","),
  ]);

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
