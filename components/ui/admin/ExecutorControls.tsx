/** @format */

import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Switch,
  Input,
  Chip,
  Divider,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { toast } from "sonner";
import { useAppKitAccount } from "@reown/appkit/react";
import { useExecutorAdmin } from "@/hooks/useExecutorAdmin";
import { intervalOptions } from "@/constants/intervals";
import { tokenList } from "@/constants/tokens";
import useSigner from "@/hooks/useSigner";
import { RefreshCw, AlertTriangle } from "lucide-react";

interface IntervalStatus {
  interval: number;
  isActive: boolean;
  totalStrategies: number;
}

export function ExecutorControls() {
  const { address } = useAppKitAccount();
  const { Signer, isInitializing, ACTIVE_NETWORK } = useSigner();
  const {
    loading,
    setActiveState,
    setIntervalActive,
    setBaseTokenAllowance,
    getSystemState,
    getIntervalStatus,
    isTokenAllowedAsBase,
  } = useExecutorAdmin();

  const [systemState, setSystemState] = useState<any>(null);
  const [intervalStatuses, setIntervalStatuses] = useState<IntervalStatus[]>(
    []
  );
  const [selectedInterval, setSelectedInterval] = useState<string>("");
  const [selectedToken, setSelectedToken] = useState<string>("");
  const [tokenAllowanceStatus, setTokenAllowanceStatus] = useState<{
    [key: string]: boolean;
  }>({});
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const {
    isOpen: isIntervalModalOpen,
    onOpen: onIntervalModalOpen,
    onClose: onIntervalModalClose,
  } = useDisclosure();

  const {
    isOpen: isTokenModalOpen,
    onOpen: onTokenModalOpen,
    onClose: onTokenModalClose,
  } = useDisclosure();

  const {
    isOpen: isPauseModalOpen,
    onOpen: onPauseModalOpen,
    onClose: onPauseModalClose,
  } = useDisclosure();

  // Load initial data
  useEffect(() => {
    if (address && Signer && !isInitializing) {
      loadSystemData();
      loadIntervalData();
      loadTokenAllowances();
    }
  }, [address, Signer, isInitializing]);

  const loadSystemData = async () => {
    if (!address || !Signer || isInitializing) {
      console.log("Signer not ready, skipping system data load");
      return;
    }

    try {
      const state = await getSystemState();
      setSystemState(state);
      setLastUpdated(new Date());
      console.log("System state loaded:", state);
    } catch (error) {
      console.error("Error loading system state:", error);
      toast.error(
        "Failed to load executor state. Please check your connection."
      );
      // Set a minimal state to prevent infinite loading
      setSystemState({
        isActive: false,
        totalActiveStrategies: 0,
        totalExecutions: 0,
        feeData: null,
        executorAddress: "Error loading",
      });
    }
  };

  const loadIntervalData = async () => {
    if (!address || !Signer || isInitializing) {
      console.log("Signer not ready, skipping interval data load");
      return;
    }

    try {
      const statuses: IntervalStatus[] = [];
      for (const intervalOption of intervalOptions) {
        const status = await getIntervalStatus(intervalOption.value);
        statuses.push({
          interval: intervalOption.value,
          isActive: status.isActive,
          totalStrategies: status.totalStrategies,
        });
      }
      setIntervalStatuses(statuses);
      console.log("Interval data loaded:", statuses);
    } catch (error) {
      console.error("Error loading interval data:", error);
    }
  };

  const loadTokenAllowances = async () => {
    if (!address || !Signer || isInitializing) {
      console.log("Signer not ready, skipping token allowances load");
      return;
    }

    try {
      const allowances: { [key: string]: boolean } = {};
      for (const [ticker, token] of Object.entries(tokenList)) {
        if (token?.contractAddress.BASE_MAINNET) {
          const isAllowed = await isTokenAllowedAsBase(
            token.contractAddress.BASE_MAINNET as string
          );
          allowances[ticker] = isAllowed;
        }
      }
      setTokenAllowanceStatus(allowances);
      console.log("Token allowances loaded:", allowances);
    } catch (error) {
      console.error("Error loading token allowances:", error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      loadSystemData(),
      loadIntervalData(),
      loadTokenAllowances(),
    ]);
    setRefreshing(false);
  };

  const handleSetActiveState = async (active: boolean) => {
    if (!active) {
      onPauseModalOpen();
      return;
    }

    try {
      const result = await setActiveState(active);
      if (result.success) {
        toast.success(`Executor activated successfully`);
        await loadSystemData();
      } else {
        toast.error("Failed to activate executor");
      }
    } catch (error) {
      console.error("Error updating executor state:", error);
      toast.error("Error updating executor state");
    }
  };

  const handleEmergencyPause = async () => {
    try {
      const result = await setActiveState(false);
      if (result.success) {
        toast.success("Executor paused successfully");
        await loadSystemData();
        onPauseModalClose();
      } else {
        toast.error("Failed to pause executor");
      }
    } catch (error) {
      console.error("Error pausing executor:", error);
      toast.error("Error pausing executor");
    }
  };

  const handleIntervalToggle = async () => {
    if (!selectedInterval) return;

    const intervalValue = parseInt(selectedInterval);
    const currentStatus = intervalStatuses.find(
      (s) => s.interval === intervalValue
    );
    const newStatus = !currentStatus?.isActive;

    try {
      const result = await setIntervalActive(intervalValue, newStatus);
      if (result.success) {
        toast.success(
          `Interval ${newStatus ? "enabled" : "disabled"} successfully`
        );
        await loadIntervalData();
        onIntervalModalClose();
      } else {
        toast.error("Failed to update interval status");
      }
    } catch (error) {
      console.error("Error updating interval status:", error);
      toast.error("Error updating interval status");
    }
  };

  const handleTokenAllowanceToggle = async () => {
    if (!selectedToken) return;

    const token = tokenList[selectedToken as keyof typeof tokenList];
    if (!token?.contractAddress.BASE_MAINNET) return;

    const currentStatus = tokenAllowanceStatus[selectedToken];
    const newStatus = !currentStatus;

    try {
      const result = await setBaseTokenAllowance(
        token.contractAddress.BASE_MAINNET as string,
        newStatus
      );
      if (result.success) {
        toast.success(
          `Token ${newStatus ? "allowed" : "disallowed"} successfully`
        );
        await loadTokenAllowances();
        onTokenModalClose();
      } else {
        toast.error("Failed to update token allowance");
      }
    } catch (error) {
      console.error("Error updating token allowance:", error);
      toast.error("Error updating token allowance");
    }
  };

  if (!address) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold">DCA Executor Controls</h3>
        </CardHeader>
        <CardBody>
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">
              Please connect your wallet to access executor controls
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
          <h3 className="text-xl font-semibold">DCA Executor Controls</h3>
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
          <h3 className="text-xl font-semibold">DCA Executor Controls</h3>
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
            <Chip color="success" size="sm" variant="flat">
              Connected
            </Chip>
          </div>
        </div>

        {/* System Status */}
        {systemState && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>System Status</span>
              <div className="flex items-center gap-2">
                <Chip color={systemState.isActive ? "success" : "danger"}>
                  {systemState.isActive ? "Active" : "Paused"}
                </Chip>
                <Switch
                  isSelected={systemState.isActive}
                  onValueChange={handleSetActiveState}
                  isDisabled={loading}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Active Strategies</p>
                <p className="font-semibold text-lg">
                  {systemState.totalActiveStrategies}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Total Executions</p>
                <p className="font-semibold text-lg">
                  {systemState.totalExecutions}
                </p>
              </div>
            </div>
          </div>
        )}

        <Divider />

        {/* Interval Management */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-semibold">Interval Management</h4>
            <Button
              color="primary"
              variant="solid"
              size="sm"
              onPress={onIntervalModalOpen}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium"
            >
              Manage Intervals
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {intervalStatuses.map((status) => {
              const intervalOption = intervalOptions.find(
                (opt) => opt.value === status.interval
              );
              return (
                <div
                  key={status.interval}
                  className="flex justify-between items-center p-3 border rounded-lg bg-gray-50 dark:bg-gray-800"
                >
                  <div>
                    <span className="font-medium">{intervalOption?.label}</span>
                    <span className="text-sm text-gray-500 ml-2">
                      ({status.totalStrategies} strategies)
                    </span>
                  </div>
                  <Chip
                    size="sm"
                    color={status.isActive ? "success" : "default"}
                    variant="flat"
                  >
                    {status.isActive ? "Active" : "Disabled"}
                  </Chip>
                </div>
              );
            })}
          </div>
        </div>

        <Divider />

        {/* Token Allowances */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-semibold">Base Token Allowances</h4>
            <Button
              color="primary"
              variant="solid"
              size="sm"
              onPress={onTokenModalOpen}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium"
            >
              Manage Tokens
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {Object.entries(tokenAllowanceStatus).map(([ticker, isAllowed]) => (
              <div
                key={ticker}
                className="flex justify-between items-center p-3 border rounded-lg bg-gray-50 dark:bg-gray-800"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">{ticker}</span>
                  <span className="text-xs text-gray-500">
                    {tokenList[ticker as keyof typeof tokenList]?.name ||
                      "Unknown"}
                  </span>
                </div>
                <Chip
                  size="sm"
                  color={isAllowed ? "success" : "default"}
                  variant="flat"
                >
                  {isAllowed ? "Allowed" : "Not Allowed"}
                </Chip>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency Pause Confirmation Modal */}
        <Modal isOpen={isPauseModalOpen} onClose={onPauseModalClose}>
          <ModalContent>
            <ModalHeader className="text-red-600">
              <AlertTriangle className="mr-2" size={20} />
              Confirm System Pause
            </ModalHeader>
            <ModalBody>
              <p className="text-sm text-gray-600 mb-4">
                <strong>WARNING:</strong> This will pause the entire executor
                system, stopping all DCA strategy executions. Active strategies
                will not be executed until the system is reactivated.
              </p>
              <p className="text-sm text-gray-600">
                Are you sure you want to pause the executor system?
              </p>
            </ModalBody>
            <ModalFooter>
              <Button
                color="default"
                variant="light"
                onPress={onPauseModalClose}
              >
                Cancel
              </Button>
              <Button
                color="danger"
                onPress={handleEmergencyPause}
                isLoading={loading}
              >
                Pause Executor
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Interval Management Modal */}
        <Modal isOpen={isIntervalModalOpen} onClose={onIntervalModalClose}>
          <ModalContent>
            <ModalHeader>Manage Execution Intervals</ModalHeader>
            <ModalBody>
              <p className="text-sm text-gray-600 mb-4">
                Enable or disable specific execution intervals. Disabling an
                interval will prevent strategies with that interval from being
                executed.
              </p>
              <Select
                label="Select Interval"
                placeholder="Choose an interval to toggle"
                value={selectedInterval}
                onChange={(e) => setSelectedInterval(e.target.value)}
                classNames={{
                  trigger: "bg-default-100 dark:bg-default-50",
                }}
              >
                {intervalOptions.map((option) => {
                  const status = intervalStatuses.find(
                    (s) => s.interval === option.value
                  );
                  return (
                    <SelectItem
                      key={option.value.toString()}
                      value={option.value.toString()}
                    >
                      {option.label} -{" "}
                      {status?.isActive ? "Active" : "Disabled"}(
                      {status?.totalStrategies || 0} strategies)
                    </SelectItem>
                  );
                })}
              </Select>
            </ModalBody>
            <ModalFooter>
              <Button
                color="default"
                variant="light"
                onPress={onIntervalModalClose}
              >
                Cancel
              </Button>
              <Button
                color="primary"
                onPress={handleIntervalToggle}
                isLoading={loading}
                isDisabled={!selectedInterval}
              >
                Toggle Interval
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Token Management Modal */}
        <Modal isOpen={isTokenModalOpen} onClose={onTokenModalClose}>
          <ModalContent>
            <ModalHeader>Manage Base Token Allowances</ModalHeader>
            <ModalBody>
              <p className="text-sm text-gray-600 mb-4">
                Control which tokens can be used as base tokens for DCA
                strategies. Only allowed tokens will be available for users to
                select.
              </p>
              <Select
                label="Select Token"
                placeholder="Choose a token to toggle"
                value={selectedToken}
                onChange={(e) => setSelectedToken(e.target.value)}
                classNames={{
                  trigger: "bg-default-100 dark:bg-default-50",
                }}
              >
                {Object.entries(tokenList).map(([ticker, token]) => {
                  const isAllowed = tokenAllowanceStatus[ticker];
                  return (
                    <SelectItem key={ticker} value={ticker}>
                      {ticker} ({token.name}) -{" "}
                      {isAllowed ? "Allowed" : "Not Allowed"}
                    </SelectItem>
                  );
                })}
              </Select>
            </ModalBody>
            <ModalFooter>
              <Button
                color="default"
                variant="light"
                onPress={onTokenModalClose}
              >
                Cancel
              </Button>
              <Button
                color="primary"
                onPress={handleTokenAllowanceToggle}
                isLoading={loading}
                isDisabled={!selectedToken}
              >
                Toggle Allowance
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </CardBody>
    </Card>
  );
}
