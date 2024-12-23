/** @format */

"use client";

import { Card, CardBody } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { EthereumAddress } from "@/types/generic";
import { FundUnfundAccountModal } from "../modals/FundUnfundAccountModal";
import { IDCADataStructures } from "@/types/contracts/contracts/base/DCAAccount";

import { AccountCard } from "../ui/account/AccountCard";
import { Signer } from "ethers";
import { NetworkKeys } from "@/types";
import { LoadingCard } from "../common/LoadingCard";
import { useDCAProvider } from "@/lib/providers/DCAStatsProvider";

interface AccountsViewProps {
  onAccountSelect: (address: string) => void;
  ACTIVE_NETWORK: NetworkKeys;
  Signer: Signer;
}

export function AccountsView({
  onAccountSelect,
  ACTIVE_NETWORK,
  Signer,
}: AccountsViewProps) {
  const { accounts, selectedAccount, setSelectedAccount, isLoading } =
    useDCAProvider();

  // const { getUsersAccounts } = useDCAFactory();
  const [expandedAccount, setExpandedAccount] = useState<string | null>(null);
  // const [isLoading, setIsLoading] = useState(true);
  const [isFundModalOpen, setIsFundModalOpen] = useState(false);
  const [modalTokens, setModalTokens] = useState<
    IDCADataStructures.TokenDataStruct[]
  >([]);
  const [actionType, setActionType] = useState<"fund" | "unfund" | "withdraw">(
    "fund"
  );

  useEffect(() => {
    console.log("[AccountsView] accounts", accounts);
  }, [accounts]);

  const handleAccountClick = (address: EthereumAddress) => {
    console.log("Account clicked:", address);
    if (expandedAccount === address) {
      console.log("Collapsing account:", address);
      setExpandedAccount(null);
    } else {
      console.log("Expanding account:", address);
      setExpandedAccount(address as string);
      setSelectedAccount(address as string);
      onAccountSelect(address as string);
    }
  };

  const handleFundingModal = (
    type: "fund" | "unfund" | "withdraw",
    tokens: IDCADataStructures.TokenDataStruct[]
  ) => {
    setModalTokens(tokens);
    setActionType(type);
    setIsFundModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6">
        {[1, 2].map((i) => (
          <Card key={i} className="w-full animate-pulse">
            <LoadingCard />
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
            No DCA accounts found. Create your first account to get started!
          </p>
        </CardBody>
      </Card>
    );
  } else
    return (
      <div className="grid grid-cols-1 gap-6">
        {accounts.map((account) => {
          return (
            <div key={account.account as string}>
              <AccountCard
                handleAccountClick={handleAccountClick}
                handleFundingModal={handleFundingModal}
                selectedAccount={selectedAccount}
                ACTIVE_NETWORK={ACTIVE_NETWORK!}
                Signer={Signer!}
                accountAddress={account.account}
                isExpanded={expandedAccount === (account.account as string)}
              />
            </div>
          );
        })}
        <FundUnfundAccountModal
          isOpen={isFundModalOpen}
          onClose={() => {
            setIsFundModalOpen(false);
            setActionType("fund");
          }}
          tokens={modalTokens}
          actionType={actionType}
          accountAddress={selectedAccount as EthereumAddress}
        />
      </div>
    );
}
