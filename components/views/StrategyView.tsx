/** @format */

"use client";

import { Card, CardBody, Button, ButtonGroup } from "@nextui-org/react";

import { useStrategyStore } from "@/lib/store/strategyStore";
import { useAccountStats } from "@/hooks/useAccountStats";
import { IDCADataStructures } from "@/types/contracts/contracts/base/DCAAccount";
import { EthereumAddress } from "@/types/generic";
import { FundUnfundAccountModal } from "@/components/modals/FundUnfundAccountModal";
import { useState } from "react";

import { useAppKitAccount } from "@reown/appkit/react";
import useSigner from "@/hooks/useSigner";
import { StrategyCard } from "../ui/strategy/StrategyCard";



export function StrategyView() {
  const { strategies } = useStrategyStore();
  const { isLoading } = useAccountStats();
  const { isConnected } = useAppKitAccount();
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);
  const [isFundModalOpen, setIsFundModalOpen] = useState(false);
  const [modalTokens, setModalTokens] = useState<
    IDCADataStructures.TokenDataStruct[]
  >([]);
  const [actionType, setActionType] = useState<"fund" | "unfund" | "withdraw">(
    "fund"
  );
  const [selectedAccount, setSelectedAccount] = useState<EthereumAddress>("");

  const handleFundingModal = (
    type: "fund" | "unfund" | "withdraw",
    tokens: IDCADataStructures.TokenDataStruct[],
    accountAddress: EthereumAddress
  ) => {
    setModalTokens(tokens);
    setActionType(type);
    setSelectedAccount(accountAddress);
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

  if (!strategies.length) {
    return (
      <Card>
        <CardBody className="text-center py-8">
          <p className="text-gray-400">
            No strategies found. Create a strategy to get started!
          </p>
          å
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      {strategies.map((strategy: IDCADataStructures.StrategyStruct) => {
        return (
          <StrategyCard
            strategy={strategy}
            selectedStrategy={selectedStrategy}
            setSelectedStrategy={setSelectedStrategy}
            handleFundingModal={handleFundingModal}
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
