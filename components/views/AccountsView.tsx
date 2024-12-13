/** @format */

"use client";

import { Card, CardBody, Chip, Button } from "@nextui-org/react";
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { useAccountStats } from "@/hooks/useAccountStats";
import { useAccountStore } from "@/lib/store/accountStore";
import { useState, useEffect } from "react";
import { StrategyList } from "../ui/StrategyList";
import { EthereumAddress } from "@/types/generic";
import { useDCAFactory } from "@/hooks/useDCAFactory";
import { useAppKitAccount } from "@reown/appkit/react";
import { FundUnfundAccountModal } from "../modals/FundUnfundAccountModal";
import Image from "next/image";
import {
  getTokenDecimals,
  getTokenIcon,
  getTokenTicker,
} from "@/lib/helpers/tokenData";
import { formatDistanceToNow } from "date-fns";
import { IDCADataStructures } from "@/types/contracts/contracts/base/DCAAccount";
import { useDCAAccount } from "@/hooks/useDCAAccount";
import useSigner from "@/hooks/useSigner";
import { buildNetworkScanLink } from "@/lib/helpers/buildScanLink";
import { ethers } from "ethers";
import { AccountCard } from "../ui/AccountCard";

interface AccountsViewProps {
  onAccountSelect: (address: string) => void;
}

export function AccountsView({ onAccountSelect }: AccountsViewProps) {
  const { accounts, selectedAccount, setSelectedAccount, setAccounts } =
    useAccountStore();
  const {
    getAllData,
    isLoading: isStatsLoading,
    tokenBalances,
    executionTimings,
  } = useAccountStats();

  const { getUsersAccounts } = useDCAFactory();
  const { isConnected } = useAppKitAccount();
  const { ACTIVE_NETWORK } = useSigner();
  const [expandedAccount, setExpandedAccount] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFundModalOpen, setIsFundModalOpen] = useState(false);
  const [modalTokens, setModalTokens] = useState<
    IDCADataStructures.TokenDataStruct[]
  >([]);
  const [actionType, setActionType] = useState<"fund" | "unfund" | "withdraw">(
    "fund"
  );

  useEffect(() => {
    console.log("useEffect triggered with isConnected:", isConnected);
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

  if (!isConnected) {
    return (
      <Card>
        <CardBody className="text-center py-8">
          <p className="text-gray-400">
            Please connect your wallet to view your DCA accounts.
          </p>
        </CardBody>
      </Card>
    );
  }
  if (isLoading || isStatsLoading) {
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
            No DCA accounts found. Create your first account to get started!
          </p>
        </CardBody>
      </Card>
    );
  } else
    return (
      <div className="grid grid-cols-1 gap-6">
        {accounts.map((accountAddress) => {
          return (
            <div key={accountAddress as string}>
              <AccountCard
                handleAccountClick={handleAccountClick}
                handleFundingModal={handleFundingModal}
                selectedAccount={selectedAccount}
                ACTIVE_NETWORK={ACTIVE_NETWORK!}
                accountAddress={accountAddress}
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
