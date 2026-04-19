/** @format */

import React, { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  Button,
  Divider,
} from "@nextui-org/react";
import { useDCAProvider } from "@/providers/DCAStatsProvider";
import { RefreshCw, TrendingUp, Users, DollarSign, Lock } from "lucide-react";
import { DCAStatsAPIClient } from "@/utils/dcaApiClient";

export function GlobalStatsCard() {
  const {
    globalStats,
    chainStats,
    loadGlobalStats,
    loadChainStats,
    refreshAllStats,
  } = useDCAProvider();
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Example of direct API usage
  const [liveVolume, setLiveVolume] = useState<string | null>(null);

  useEffect(() => {
    // Load stats on mount
    loadGlobalStats();
    loadChainStats("BASE_MAINNET");
  }, [loadGlobalStats, loadChainStats]);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await refreshAllStats();
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error refreshing stats:", error);
    } finally {
      setLoading(false);
    }
  };

  // Example direct API call
  const fetchLiveVolume = async () => {
    try {
      const volume = await DCAStatsAPIClient.getTotalVolume();
      setLiveVolume(volume);
    } catch (error) {
      console.error("Error fetching live volume:", error);
    }
  };

  useEffect(() => {
    fetchLiveVolume();
    // Refresh live volume every 30 seconds
    const interval = setInterval(fetchLiveVolume, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatLargeNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const formatCurrency = (value: string) => {
    try {
      const num = parseFloat(value);
      return `$${formatLargeNumber(num)}`;
    } catch {
      return "$0";
    }
  };

  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold">Global DCA Statistics</h3>
          {lastUpdated && (
            <p className="text-xs text-gray-500 mt-1">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        <Button
          isIconOnly
          variant="ghost"
          onPress={handleRefresh}
          isLoading={loading}
          className="text-gray-500 hover:text-gray-700"
        >
          <RefreshCw size={16} />
        </Button>
      </CardHeader>
      <CardBody className="space-y-6">
        {/* Global Statistics */}
        {globalStats && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <Users className="text-blue-600" size={20} />
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  {formatLargeNumber(globalStats.totalAccounts)}
                </p>
                <p className="text-sm text-gray-500">Total Accounts</p>
              </div>

              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="text-green-600" size={20} />
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {formatLargeNumber(globalStats.totalExecutions)}
                </p>
                <p className="text-sm text-gray-500">Total Executions</p>
              </div>

              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <DollarSign className="text-purple-600" size={20} />
                </div>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(globalStats.totalVolume)}
                </p>
                <p className="text-sm text-gray-500">Total Volume</p>
              </div>

              <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <Lock className="text-orange-600" size={20} />
                </div>
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(globalStats.totalLockedAmount)}
                </p>
                <p className="text-sm text-gray-500">Total Locked</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-medium mb-2">Active Subscriptions</h4>
                <p className="text-xl font-semibold text-blue-600">
                  {formatLargeNumber(globalStats.totalActiveSubscribers)}
                </p>
                <p className="text-xs text-gray-500">
                  of {formatLargeNumber(globalStats.totalLifetimeSubscribers)}{" "}
                  total
                </p>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-medium mb-2">Avg. Subscription</h4>
                <p className="text-xl font-semibold text-green-600">
                  {globalStats.averageSubscriptionDuration.averageDurationDays}d
                </p>
                <p className="text-xs text-gray-500">
                  {globalStats.averageSubscriptionDuration.averageDurationHours}
                  h average
                </p>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-medium mb-2">Live Volume</h4>
                <p className="text-xl font-semibold text-purple-600">
                  {liveVolume ? formatCurrency(liveVolume) : "Loading..."}
                </p>
                <Chip size="sm" color="success" variant="flat">
                  Real-time
                </Chip>
              </div>
            </div>
          </div>
        )}

        {/* Chain-specific Statistics */}
        {chainStats && (
          <>
            <Divider />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Base Mainnet Statistics</h4>
                <Chip color="success" size="sm" variant="flat">
                  {chainStats.chain}
                </Chip>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-lg font-bold text-blue-600">
                    {formatLargeNumber(chainStats.accounts)}
                  </p>
                  <p className="text-xs text-gray-500">Accounts</p>
                </div>

                <div className="text-center">
                  <p className="text-lg font-bold text-green-600">
                    {formatLargeNumber(chainStats.executions)}
                  </p>
                  <p className="text-xs text-gray-500">Executions</p>
                </div>

                <div className="text-center">
                  <p className="text-lg font-bold text-purple-600">
                    {formatLargeNumber(chainStats.activeStrategies)}
                  </p>
                  <p className="text-xs text-gray-500">Active Strategies</p>
                </div>

                <div className="text-center">
                  <p className="text-lg font-bold text-orange-600">
                    {formatCurrency(chainStats.volume)}
                  </p>
                  <p className="text-xs text-gray-500">Volume</p>
                </div>
              </div>
            </div>
          </>
        )}

        {!globalStats && !chainStats && (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">Loading global statistics...</p>
            <Button
              color="primary"
              variant="light"
              onPress={handleRefresh}
              isLoading={loading}
            >
              Load Stats
            </Button>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
