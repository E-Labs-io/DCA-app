/** @format */

"use client";

import { Card, CardBody, Chip, Button } from "@nextui-org/react";
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { useAccountStats } from "@/hooks/useAccountStats";
import { useAccountStore } from "@/lib/store/accountStore";
import { useState, useEffect } from "react";
import { StrategyList } from "../ui/StrategyList";
import { formatEther } from "viem";
import { EthereumAddress } from "@/types/generic";
import { useDCAFactory } from "@/hooks/useDCAFactory";
import { useAppKitAccount } from "@reown/appkit/react";
import { FundUnfundAccountModal } from "../modals/FundUnfundAccountModal";
import Image from "next/image";
import { getTokenIcon, getTokenTicker } from "@/lib/helpers/tokenData";
import { formatDistanceToNow } from "date-fns";
import { IDCADataStructures } from "@/types/contracts/contracts/base/DCAAccount";
import { useDCAAccount } from "@/hooks/useDCAAccount";
import useSigner from "@/hooks/useSigner";
import { buildNetworkScanLink } from "@/lib/helpers/buildScanLink";

interface AccountsViewProps {
  onAccountSelect: (address: string) => void;
}

interface AccountStats {
  totalStrategies: number;
  activeStrategies: number;
  totalExecutions: number;
  baseTokenBalances: { [key: string]: bigint };
  reinvestLibraryVersion: string;
}

export function AccountsView({ onAccountSelect }: AccountsViewProps) {
  const {
    accounts,
    selectedAccount,
    setSelectedAccount,
    accountStrategies,
    setAccounts,
  } = useAccountStore();
  const {
    getAllData,
    isLoading: isStatsLoading,
    totalExecutions,
    tokenBalances,
    lastRefresh,
    executionTimings,
  } = useAccountStats();
  const { ACTIVE_NETWORK } = useSigner();
  const { getAccountBaseTokens, getAccountTargetTokens } = useDCAAccount(
    selectedAccount as EthereumAddress
  );
  const { getUsersAccounts } = useDCAFactory();
  const { isConnected } = useAppKitAccount();
  const [expandedAccount, setExpandedAccount] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFundModalOpen, setIsFundModalOpen] = useState(false);
  const [isUnfundModalOpen, setIsUnfundModalOpen] = useState(false);
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
  }, [isConnected, getUsersAccounts, setAccounts, getAllData]);

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

  const getAccountStats = (accountAddress: EthereumAddress): AccountStats => {
    const strategies = accountStrategies[accountAddress as string] || [];
    const accountBalances = tokenBalances[accountAddress as string] || {};

    return {
      totalStrategies: strategies.length,
      activeStrategies: strategies.filter((s) => s.active).length,
      totalExecutions: totalExecutions,
      baseTokenBalances: Object.entries(accountBalances).reduce(
        (acc, [token, data]) => {
          acc[token] = data.balance;
          return acc;
        },
        {} as { [key: string]: bigint }
      ),
      reinvestLibraryVersion: "v1.0",
    };
  };

  const getEtherscanUrl = (address: string) =>
    buildNetworkScanLink({ network: ACTIVE_NETWORK!, address });

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
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      {accounts.map((accountAddress) => {
        const account = accountAddress as string;
        const stats = getAccountStats(account as string);
        const accountBalances = tokenBalances[account] || {};

        const accountExecutionTimings =
          executionTimings[selectedAccount as string] ?? {};

        const lastExecutionTime: number = Object.values(
          accountExecutionTimings
        ).reduce((max, timing) => Math.max(max, timing.lastExecution), 0);

        const timeAgo = formatDistanceToNow(
          new Date(lastExecutionTime * 1000),
          {
            addSuffix: true,
          }
        );

        return (
          <div key={account as string}>
            <Card
              className={`w-full transition-all duration-200 ${
                selectedAccount === account
                  ? "border-2 border-primary shadow-lg"
                  : "hover:scale-[1.01]"
              }`}
              isPressable
              onPress={() => handleAccountClick(account)}
            >
              <CardBody>
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">
                        {`${account.slice(0, 6)}...${account.slice(-4)}`}
                      </h3>
                      <a
                        href={getEtherscanUrl(account)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary-400"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink size={16} />
                      </a>
                      <p className="text-sm text-gray-400">
                        {stats.activeStrategies} Active /{" "}
                        {stats.totalStrategies} Total Strategies
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      {expandedAccount === account ? (
                        <ChevronUp size={20} />
                      ) : (
                        <ChevronDown size={20} />
                      )}
                    </div>
                  </div>

                  {expandedAccount === account && (
                    <div
                      className="mt-4 space-y-6 border-t pt-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                          <CardBody>
                            <h4 className="text-sm font-semibold mb-2">
                              Account Info
                            </h4>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-400">
                                  Reinvest Library:
                                </span>
                                <Chip size="sm" color="primary">
                                  {stats.reinvestLibraryVersion}
                                </Chip>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-400">
                                  Last Execution:
                                </span>
                                <span className="text-sm">{timeAgo}</span>
                              </div>
                              <div className="flex gap-2 mt-2">
                                <Button
                                  size="sm"
                                  color="primary"
                                  onPress={() => {
                                    setModalTokens(getAccountBaseTokens());
                                    setActionType("fund");
                                    setIsFundModalOpen(true);
                                  }}
                                >
                                  Fund
                                </Button>
                                <Button
                                  size="sm"
                                  color="secondary"
                                  onPress={() => {
                                    setModalTokens(getAccountBaseTokens());
                                    setActionType("unfund");
                                    setIsFundModalOpen(true);
                                  }}
                                >
                                  Unfund
                                </Button>
                                <Button
                                  size="sm"
                                  color="warning"
                                  onPress={() => {
                                    setModalTokens(getAccountTargetTokens());
                                    setActionType("withdraw");
                                    setIsFundModalOpen(true);
                                  }}
                                >
                                  Withdraw
                                </Button>
                              </div>
                            </div>
                          </CardBody>
                        </Card>

                        <Card>
                          <CardBody>
                            <h4 className="text-sm font-semibold mb-2">
                              Strategy Stats
                            </h4>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-400">
                                  Total Strategies:
                                </span>
                                <span>{stats.totalStrategies}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-400">
                                  Active Strategies:
                                </span>
                                <span>{stats.activeStrategies}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-400">
                                  Total Executions:
                                </span>
                                <span>{stats.totalExecutions}</span>
                              </div>
                            </div>
                          </CardBody>
                        </Card>

                        <Card>
                          <CardBody>
                            <h4 className="text-sm font-semibold mb-2">
                              Token Balances
                            </h4>
                            <div className="space-y-2">
                              {Object.entries(accountBalances).map(
                                ([tokenAddress, data]) => {
                                  const tokenData = accountStrategies[
                                    selectedAccount as string
                                  ]?.find(
                                    (strategy) =>
                                      strategy.baseToken.tokenAddress ===
                                      tokenAddress
                                  )?.baseToken;
                                  if (!tokenData) return null;
                                  return (
                                    <div
                                      key={tokenAddress}
                                      className="flex justify-between"
                                    >
                                      <div className="flex items-center gap-2">
                                        <a
                                          href={`https://etherscan.io/token/${tokenAddress}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                        >
                                          <Image
                                            src={getTokenIcon(tokenData)}
                                            alt={getTokenTicker(tokenData)}
                                            width={16}
                                            height={16}
                                            className="inline-block mr-1"
                                          />
                                          {getTokenTicker(tokenData)}
                                        </a>
                                      </div>
                                      <div className="text-right">
                                        <span>{formatEther(data.balance)}</span>
                                      </div>
                                    </div>
                                  );
                                }
                              )}
                            </div>
                          </CardBody>
                        </Card>
                      </div>

                      <StrategyList
                        accountAddress={account}
                        strategies={accountStrategies[account] || []}
                      />
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
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
