/** @format */

"use client";

import { Card, CardBody } from "@nextui-org/react";

import { useStrategyStore } from "@/lib/store/strategyStore";
import { useAccountStats } from "@/hooks/useAccountStats";
import { IDCADataStructures } from "@/types/contracts/contracts/base/DCAAccount";
import { EthereumAddress } from "@/types/generic";
import { FundUnfundAccountModal } from "@/components/modals/FundUnfundAccountModal";
import { useState, useEffect } from "react";

import { useAppKitAccount } from "@reown/appkit/react";
import { StrategyCard } from "../ui/strategy/StrategyCard";
import { NetworkKeys } from "@/types";
import { Signer } from "ethers";
import { useAccountStore } from "@/lib/store/accountStore";
import { useDCAFactory } from "@/hooks/useDCAFactory";
export interface StrategyViewProps {
  ACTIVE_NETWORK: NetworkKeys;
  Signer: Signer;
}

export function StrategyView({ ACTIVE_NETWORK, Signer }: StrategyViewProps) {
  const { getAllData } = useAccountStats();
  const { accounts, selectedAccount, setSelectedAccount, setAccounts } =
    useAccountStore();
  const { getUsersAccounts } = useDCAFactory();

  const { strategies } = useStrategyStore();
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
    console.log(
      "[Accounts View]: useEffect triggered with isConnected:",
      isConnected
    );
    const loadAccounts = async () => {
      if (!isConnected) {
        console.log("Not connected, setting isLoading to false");
        setIsLoading(false);
        return;
      }

      try {
        console.log("Loading accounts...");
        setIsLoading(true);
        const userAccounts = await getUsersAccounts();
        console.log("User accounts loaded:", userAccounts);
        if (JSON.stringify(userAccounts) !== JSON.stringify(accounts)) {
          setAccounts(userAccounts as `0x${string}`[]);
        }
        if (userAccounts.length > 0) {
          console.log("Fetching all data...");
          await getAllData();
        }
      } catch (error) {
        console.error("Error loading accounts:", error);
      } finally {
        console.log("Setting isLoading to false");
        setIsLoading(false);
      }
    };

    loadAccounts();
  }, [isConnected, getUsersAccounts, setAccounts, getAllData, accounts]);

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

  if (!strategies.length) {
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
        {strategies.map((strategy: IDCADataStructures.StrategyStruct) => {
          const isExpanded = selectedStrategy === strategy.strategyId.toString();
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
