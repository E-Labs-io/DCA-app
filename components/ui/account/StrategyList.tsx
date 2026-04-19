/** @format */

"use client";

import { Card, CardBody, Button, Chip, Select, SelectItem, Input, Pagination, Checkbox } from "@nextui-org/react";
import { Play, StopCircle, Settings, AlertCircle, Wallet, Filter, SortAsc, Grid, List, CheckSquare, Square } from "lucide-react";
import { tokenList, TokenTickers } from "@/constants/tokens";
import Image from "next/image";
import { IDCADataStructures } from "@/types/contracts/contracts/base/DCAAccount";
import { useDCAAccount } from "@/hooks/useDCAAccount";
import { toast } from "sonner";
import { formatUnits } from "viem";
import { useState, useEffect, useMemo } from "react";
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

type SortOption = "nextExecution" | "creationDate" | "amount" | "performance";
type FilterStatus = "all" | "active" | "inactive";
type ViewMode = "list" | "grid";

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
  const { subscribeStrategy, unsubscribeStrategy, batchSubscribeStrategies, batchUnsubscribeStrategies, getAccountBaseTokens } =
    useDCAAccount(getAccountInstance(accountAddress as string)!, Signer!);
  const [selectedStrategy, setSelectedStrategy] =
    useState<IDCADataStructures.StrategyStruct | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(
    Math.floor(Date.now() / 1000)
  );

  const [isCreateStrategyOpen, setIsCreateStrategyOpen] = useState(false);

  // Filtering and sorting state
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [tokenFilter, setTokenFilter] = useState<string>("all");
  const [intervalFilter, setIntervalFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("nextExecution");
  const [searchQuery, setSearchQuery] = useState("");

  // UI state
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStrategies, setSelectedStrategies] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  const itemsPerPage = 10;

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Polling fallback for real-time updates (every 30 seconds)
  useEffect(() => {
    const pollTimer = setInterval(() => {
      // Force refresh of strategy data
      if (getAccountBalances && accountAddress) {
        getAccountBalances(accountAddress);
      }
    }, 30000); // 30 seconds

    return () => clearInterval(pollTimer);
  }, [accountAddress, getAccountBalances]);

  // Filtered and sorted strategies
  const filteredAndSortedStrategies = useMemo(() => {
    let filtered = strategies?.filter((strategy) => {
      // Status filter
      if (statusFilter === "active" && !strategy.active) return false;
      if (statusFilter === "inactive" && strategy.active) return false;

      // Token filter
      if (tokenFilter !== "all") {
        const baseMatch = strategy.baseToken.ticker.toLowerCase().includes(tokenFilter.toLowerCase());
        const targetMatch = strategy.targetToken.ticker.toLowerCase().includes(tokenFilter.toLowerCase());
        if (!baseMatch && !targetMatch) return false;
      }

      // Interval filter
      if (intervalFilter !== "all" && strategy.interval.toString() !== intervalFilter) return false;

      // Search query
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const matchesId = strategy.strategyId.toString().includes(searchLower);
        const matchesBaseToken = strategy.baseToken.ticker.toLowerCase().includes(searchLower);
        const matchesTargetToken = strategy.targetToken.ticker.toLowerCase().includes(searchLower);
        if (!matchesId && !matchesBaseToken && !matchesTargetToken) return false;
      }

      return true;
    }) || [];

    // Sort strategies
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "nextExecution": {
          const aTiming = getExecutionTiming(a);
          const bTiming = getExecutionTiming(b);
          const aTime = aTiming?.nextExecutionIn || 0;
          const bTime = bTiming?.nextExecutionIn || 0;
          return aTime - bTime;
        }
        case "creationDate":
          // For now, sort by strategy ID (assuming higher ID = newer)
          return Number(b.strategyId) - Number(a.strategyId);
        case "amount":
          return Number(b.amount) - Number(a.amount);
        case "performance": {
          const aStats = getStrategyStats(accountAddress, Number(a.strategyId));
          const bStats = getStrategyStats(accountAddress, Number(b.strategyId));
          const aPerf = aStats?.totalExecutions || 0;
          const bPerf = bStats?.totalExecutions || 0;
          return bPerf - aPerf;
        }
        default:
          return 0;
      }
    });

    return filtered;
  }, [strategies, statusFilter, tokenFilter, intervalFilter, sortBy, searchQuery, currentTime]);

  // Paginated strategies
  const paginatedStrategies = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedStrategies.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedStrategies, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedStrategies.length / itemsPerPage);

  // Unique filter options
  const uniqueTokens = useMemo(() => {
    const tokens = new Set<string>();
    strategies?.forEach(strategy => {
      tokens.add(strategy.baseToken.ticker);
      tokens.add(strategy.targetToken.ticker);
    });
    return Array.from(tokens).sort();
  }, [strategies]);

  const uniqueIntervals = useMemo(() => {
    const intervals = new Set<string>();
    strategies?.forEach(strategy => {
      intervals.add(strategy.interval.toString());
    });
    return Array.from(intervals).sort();
  }, [strategies]);

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

  const handleBatchSubscribe = async () => {
    const strategyIds = Array.from(selectedStrategies).map(id => BigInt(id));
    if (strategyIds.length === 0) return;

    try {
      await batchSubscribeStrategies(strategyIds);
      setSelectedStrategies(new Set());
      toast.success(`Successfully subscribed ${strategyIds.length} strategies`);
    } catch (error) {
      toast.error("Failed to batch subscribe strategies");
    }
  };

  const handleBatchUnsubscribe = async () => {
    const strategyIds = Array.from(selectedStrategies).map(id => BigInt(id));
    if (strategyIds.length === 0) return;

    try {
      await batchUnsubscribeStrategies(strategyIds);
      setSelectedStrategies(new Set());
      toast.success(`Successfully unsubscribed ${strategyIds.length} strategies`);
    } catch (error) {
      toast.error("Failed to batch unsubscribe strategies");
    }
  };

  const toggleStrategySelection = (strategyId: string) => {
    const newSelected = new Set(selectedStrategies);
    if (newSelected.has(strategyId)) {
      newSelected.delete(strategyId);
    } else {
      newSelected.add(strategyId);
    }
    setSelectedStrategies(newSelected);
  };

  const selectAllStrategies = () => {
    const allIds = paginatedStrategies.map(s => s.strategyId.toString());
    setSelectedStrategies(new Set(allIds));
  };

  const clearSelection = () => {
    setSelectedStrategies(new Set());
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
      <div className="flex justify-between items-center">
        <h4 className="text-lg font-semibold">Account Strategies ({filteredAndSortedStrategies.length})</h4>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="light"
            startContent={<Filter size={16} />}
            onPress={() => setShowFilters(!showFilters)}
          >
            Filters
          </Button>
          <Button
            size="sm"
            variant="light"
            startContent={viewMode === "list" ? <Grid size={16} /> : <List size={16} />}
            onPress={() => setViewMode(viewMode === "list" ? "grid" : "list")}
          >
            {viewMode === "list" ? "Grid" : "List"}
          </Button>
          {paginatedStrategies.length > 0 && (
            <Button
              size="sm"
              variant="light"
              startContent={<CheckSquare size={16} />}
              onPress={selectAllStrategies}
            >
              Select All
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="Search by ID or token..."
                value={searchQuery}
                onValueChange={setSearchQuery}
                size="sm"
              />
              <Select
                placeholder="Filter by status"
                selectedKeys={[statusFilter]}
                onSelectionChange={(keys) => setStatusFilter(Array.from(keys)[0] as FilterStatus)}
                size="sm"
              >
                <SelectItem key="all">All Status</SelectItem>
                <SelectItem key="active">Active Only</SelectItem>
                <SelectItem key="inactive">Inactive Only</SelectItem>
              </Select>
              <Select
                placeholder="Filter by token"
                selectedKeys={[tokenFilter]}
                onSelectionChange={(keys) => setTokenFilter(Array.from(keys)[0] as string)}
                size="sm"
              >
                <SelectItem key="all">All Tokens</SelectItem>
                {uniqueTokens.map(token => (
                  <SelectItem key={token}>{token}</SelectItem>
                ))}
              </Select>
              <Select
                placeholder="Sort by"
                selectedKeys={[sortBy]}
                onSelectionChange={(keys) => setSortBy(Array.from(keys)[0] as SortOption)}
                size="sm"
              >
                <SelectItem key="nextExecution">Next Execution</SelectItem>
                <SelectItem key="creationDate">Creation Date</SelectItem>
                <SelectItem key="amount">Amount</SelectItem>
                <SelectItem key="performance">Performance</SelectItem>
              </Select>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Batch Operations */}
      {selectedStrategies.size > 0 && (
        <Card>
          <CardBody>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <CheckSquare size={16} />
                <span>{selectedStrategies.size} strategies selected</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" color="success" onPress={handleBatchSubscribe}>
                  Subscribe Selected
                </Button>
                <Button size="sm" color="warning" onPress={handleBatchUnsubscribe}>
                  Unsubscribe Selected
                </Button>
                <Button size="sm" variant="light" onPress={clearSelection}>
                  Clear
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      <div className="space-y-4">
        {paginatedStrategies?.map((strategy) => {
          const baseTokenBalance = getTokenBalance(strategy.baseToken);
          const executionTiming = getExecutionTiming(strategy);

          return (
            <div key={strategy.strategyId}>
              <Card className="w-full">
                <CardBody>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <Checkbox
                        isSelected={selectedStrategies.has(strategy.strategyId.toString())}
                        onValueChange={() => toggleStrategySelection(strategy.strategyId.toString())}
                        size="sm"
                      />
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center">
            <Pagination
              total={totalPages}
              page={currentPage}
              onChange={setCurrentPage}
              size="sm"
            />
          </div>
        )}

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
