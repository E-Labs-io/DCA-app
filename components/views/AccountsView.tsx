/** @format */

"use client";

import { Card, CardBody, ButtonGroup, Chip } from "@nextui-org/react";
import {
  Settings,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Wallet,
} from "lucide-react";
import { useAccountStats } from "@/hooks/useAccountStats";
import { useAccountStore } from "@/lib/store/accountStore";
import { useState } from "react";
import { StrategyList } from "../ui/StrategyList";
import { formatEther } from "viem";
import { EthereumAddress } from "@/types/generic";

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
  const { accounts, selectedAccount, setSelectedAccount, accountStrategies } =
    useAccountStore();
  const { getAllData, isLoading } = useAccountStats();
  const [expandedAccount, setExpandedAccount] = useState<string | null>(null);

  const handleAccountClick = (address: EthereumAddress) => {
    if (expandedAccount === address) {
      setExpandedAccount(null);
    } else {
      setExpandedAccount(address as string);
      setSelectedAccount(address as string);
      onAccountSelect(address as string);
    }
  };

  const getAccountStats = (accountAddress: EthereumAddress): AccountStats => {
    const strategies = accountStrategies[accountAddress as string] || [];
    return {
      totalStrategies: strategies.length,
      activeStrategies: strategies.filter((s) => s.active).length,
      totalExecutions: 0,
      baseTokenBalances: {},
      reinvestLibraryVersion: "v1.0",
    };
  };

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
                    <div>
                      <h3 className="text-lg font-semibold">
                        {`${account.slice(0, 6)}...${account.slice(-4)}`}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {stats.activeStrategies} Active /{" "}
                        {stats.totalStrategies} Total Strategies
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <ButtonGroup>
                        <div className="flex gap-2">
                          <div
                            className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg hover:bg-default-100 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Add manage functionality
                            }}
                          >
                            <Settings size={18} />
                            <span>Manage</span>
                          </div>
                          <div
                            className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg hover:bg-default-100 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Add analytics functionality
                            }}
                          >
                            <TrendingUp size={18} />
                            <span>Analytics</span>
                          </div>
                        </div>
                      </ButtonGroup>
                      {expandedAccount === account ? (
                        <ChevronUp size={20} />
                      ) : (
                        <ChevronDown size={20} />
                      )}
                    </div>
                  </div>

                  {expandedAccount === account && (
                    <div className="mt-4 space-y-6 border-t pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                              {Object.entries(stats.baseTokenBalances).map(
                                ([token, balance]) => (
                                  <div
                                    key={token}
                                    className="flex justify-between"
                                  >
                                    <span className="text-sm text-gray-400">
                                      {token}:
                                    </span>
                                    <span>{formatEther(balance)}</span>
                                  </div>
                                )
                              )}
                            </div>
                          </CardBody>
                        </Card>

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
    </div>
  );
}
