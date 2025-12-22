/** @format */

import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
  Button,
} from "@nextui-org/react";
import { useAppKitAccount } from "@reown/appkit/react";
import { useExecutorAdmin } from "@/hooks/useExecutorAdmin";
import { useFactoryAdmin } from "@/hooks/useFactoryAdmin";
import { useReinvest } from "@/hooks/useReinvest";
import { useDCAProvider } from "@/providers/DCAStatsProvider";
import useSigner from "@/hooks/useSigner";
import { RefreshCw } from "lucide-react";
import { AddressLink } from "@/components/common/AddressLink";
import { NetworkKeys } from "@/types/Chains";
import { DCAExecutorAddress } from "@/constants/contracts";

export function SystemMetrics() {
  const { address } = useAppKitAccount();
  const { Signer, isInitializing, ACTIVE_NETWORK } = useSigner();
  const { getSystemState } = useExecutorAdmin();
  const { getFactoryState } = useFactoryAdmin();
  const { getAvailableModules } = useReinvest();
  const { walletStats } = useDCAProvider();

  const [executorState, setExecutorState] = useState<any>(null);
  const [factoryState, setFactoryState] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (address && Signer && !isInitializing) {
      loadSystemData();
      // Refresh every 30 seconds
      const interval = setInterval(loadSystemData, 30000);
      return () => clearInterval(interval);
    } else if (!address) {
      setLoading(false);
    }
  }, [address, Signer, isInitializing]);

  const loadSystemData = async () => {
    if (!address || !Signer || isInitializing) {
      console.log("Signer not ready, skipping system data load");
      return;
    }

    try {
      if (!refreshing) setLoading(true);

      // Load executor and factory states from contracts
      const [executorData, factoryData] = await Promise.all([
        getSystemState().catch((error) => {
          console.warn("Failed to load executor state:", error);
          return null;
        }),
        getFactoryState().catch((error) => {
          console.warn("Failed to load factory state:", error);
          return null;
        }),
      ]);

      setExecutorState(executorData);
      setFactoryState(factoryData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error loading system data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSystemData();
  };

  const availableModules = getAvailableModules();

  if (!address) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold">System Metrics</h3>
        </CardHeader>
        <CardBody>
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">
              Please connect your wallet to view system metrics
            </p>
            <Chip color="warning" variant="flat">
              Wallet Not Connected
            </Chip>
          </div>
        </CardBody>
      </Card>
    );
  }

  if (isInitializing) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold">System Metrics</h3>
        </CardHeader>
        <CardBody>
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">
              Initializing wallet connection...
            </p>
            <Chip color="primary" variant="flat">
              Loading...
            </Chip>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold">System Metrics</h3>
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
          isLoading={refreshing}
          className="text-gray-500 hover:text-gray-700"
        >
          <RefreshCw size={16} />
        </Button>
      </CardHeader>
      <CardBody className="space-y-6">
        {/* Network Status */}
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-medium text-blue-800 dark:text-blue-300">
              Network: {ACTIVE_NETWORK || "Unknown"}
            </span>
            <div className="flex gap-2">
              <Chip 
                color={executorState && factoryState ? "success" : "warning"} 
                size="sm" 
                variant="flat"
              >
                {executorState && factoryState ? "Contracts OK" : "Loading..."}
              </Chip>
              <Chip color="success" size="sm" variant="flat">
                Connected
              </Chip>
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xs text-blue-600 dark:text-blue-400">
              💡 If you see "eth_newFilter not supported" errors, real-time notifications are disabled but core functionality works normally.
            </p>
          </div>
        </div>

        {/* System Status - Using real contract data */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {loading ? "..." : factoryState?.totalAccounts || 0}
            </p>
            <p className="text-sm text-gray-500">Total Accounts (Factory)</p>
          </div>

          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {loading ? "..." : executorState?.totalActiveStrategies || 0}
            </p>
            <p className="text-sm text-gray-500">
              Active Strategies (Executor)
            </p>
          </div>

          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">
              {loading ? "..." : executorState?.totalExecutions || 0}
            </p>
            <p className="text-sm text-gray-500">Total Executions (Executor)</p>
          </div>

          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {walletStats?.totalAccounts || 0}
            </p>
            <p className="text-sm text-gray-500">Your Accounts</p>
          </div>
        </div>

        <Divider />

        {/* Contract Status - Using real contract states */}
        <div className="space-y-4">
          <h4 className="font-semibold">Contract Status</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Executor Status */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h5 className="font-medium">DCA Executor</h5>
                <Chip
                  color={executorState?.isActive ? "success" : "danger"}
                  size="sm"
                  variant="flat"
                >
                  {loading
                    ? "Loading..."
                    : executorState?.isActive
                    ? "Active"
                    : "Paused"}
                </Chip>
              </div>
              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <p>
                  Active Strategies:{" "}
                  {loading ? "..." : executorState?.totalActiveStrategies || 0}
                </p>
                <p>
                  Total Executions:{" "}
                  {loading ? "..." : executorState?.totalExecutions || 0}
                </p>
                <div className="mt-2 space-y-1">
                  <AddressLink
                    address={
                      DCAExecutorAddress[ACTIVE_NETWORK as NetworkKeys] || ""
                    }
                    network={ACTIVE_NETWORK as NetworkKeys}
                    label="Contract"
                    className="text-xs"
                  />
                  {executorState?.executorAddress && (
                    <AddressLink
                      address={executorState.executorAddress}
                      network={ACTIVE_NETWORK as NetworkKeys}
                      label="Executor EOA"
                      className="text-xs"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Factory Status */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h5 className="font-medium">DCA Factory</h5>
                <Chip
                  color={factoryState?.isActive ? "success" : "danger"}
                  size="sm"
                  variant="flat"
                >
                  {loading
                    ? "Loading..."
                    : factoryState?.isActive
                    ? "Active"
                    : "Paused"}
                </Chip>
              </div>
              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <p>
                  Total Accounts:{" "}
                  {loading ? "..." : factoryState?.totalAccounts || 0}
                </p>
                <p>
                  Reinvest Version:{" "}
                  {loading ? "..." : factoryState?.reinvestVersion || "Unknown"}
                </p>
                {factoryState?.executorAddress && (
                  <div className="mt-2">
                    <AddressLink
                      address={factoryState.executorAddress}
                      network={ACTIVE_NETWORK as NetworkKeys}
                      label="Executor"
                      className="text-xs"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <Divider />

        {/* Reinvest Modules */}
        <div className="space-y-4">
          <h4 className="font-semibold">Reinvest Modules</h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {availableModules.map((module) => (
              <div
                key={module.id}
                className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
              >
                <div className="flex justify-between items-center">
                  <h5 className="font-medium text-blue-800 dark:text-blue-300">
                    {module.name}
                  </h5>
                  <Chip
                    color="success"
                    variant="flat"
                    size="sm"
                    className="text-xs"
                  >
                    Available
                  </Chip>
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  {module.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {loading && (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">Loading system metrics...</p>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
