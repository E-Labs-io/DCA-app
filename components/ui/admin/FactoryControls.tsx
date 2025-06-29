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
} from "@nextui-org/react";
import { useAppKitAccount } from "@reown/appkit/react";
import { useFactoryAdmin } from "@/hooks/useFactoryAdmin";
import { toast } from "sonner";
import useSigner from "@/hooks/useSigner";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface FactoryState {
  isActive: boolean;
  totalAccounts: number;
  executorAddress: string;
  reinvestLibraryAddress: string;
  swapRouter: string;
  reinvestVersion: string;
}

export function FactoryControls() {
  const { address } = useAppKitAccount();
  const { Signer, isInitializing, ACTIVE_NETWORK } = useSigner();
  const {
    loading,
    pauseFactory,
    unpauseFactory,
    updateExecutorAddress,
    updateReinvestLibraryAddress,
    getFactoryState,
  } = useFactoryAdmin();

  const [factoryState, setFactoryState] = useState<FactoryState | null>(null);
  const [newExecutorAddress, setNewExecutorAddress] = useState("");
  const [newLibraryAddress, setNewLibraryAddress] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const {
    isOpen: isExecutorModalOpen,
    onOpen: onExecutorModalOpen,
    onClose: onExecutorModalClose,
  } = useDisclosure();
  const {
    isOpen: isLibraryModalOpen,
    onOpen: onLibraryModalOpen,
    onClose: onLibraryModalClose,
  } = useDisclosure();
  const {
    isOpen: isEmergencyModalOpen,
    onOpen: onEmergencyModalOpen,
    onClose: onEmergencyModalClose,
  } = useDisclosure();

  // Load factory state
  useEffect(() => {
    if (address && Signer && !isInitializing) {
      loadFactoryData();
    }
  }, [address, Signer, isInitializing]);

  const loadFactoryData = async () => {
    if (!address || !Signer || isInitializing) {
      console.log("Signer not ready, skipping factory data load");
      return;
    }

    try {
      const state = await getFactoryState();
      setFactoryState(state);
      setLastUpdated(new Date());
      console.log("Factory state loaded:", state);
    } catch (error) {
      console.error("Error loading factory state:", error);
      toast.error(
        "Failed to load factory state. Please check your connection."
      );
      // Set a minimal state to prevent infinite loading
      setFactoryState({
        isActive: false,
        totalAccounts: 0,
        executorAddress: "Error loading",
        reinvestLibraryAddress: "Error loading",
        swapRouter: "Error loading",
        reinvestVersion: "Unknown",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadFactoryData();
  };

  const handleFactoryToggle = async (pause: boolean) => {
    try {
      const result = pause ? await pauseFactory() : await unpauseFactory();
      if (result.success) {
        toast.success(`Factory ${pause ? "paused" : "unpaused"} successfully`);
        await loadFactoryData();
      } else {
        toast.error(`Failed to ${pause ? "pause" : "unpause"} factory`);
      }
    } catch (error) {
      console.error("Error updating factory state:", error);
      toast.error("Error updating factory state");
    }
  };

  const handleEmergencyPause = async () => {
    try {
      const result = await pauseFactory();
      if (result.success) {
        toast.success("Emergency pause activated successfully");
        await loadFactoryData();
        onEmergencyModalClose();
      } else {
        toast.error("Failed to activate emergency pause");
      }
    } catch (error) {
      console.error("Error activating emergency pause:", error);
      toast.error("Error activating emergency pause");
    }
  };

  const handleExecutorUpdate = async () => {
    if (!newExecutorAddress) {
      toast.error("Please enter an executor address");
      return;
    }

    // Basic validation
    if (
      !newExecutorAddress.startsWith("0x") ||
      newExecutorAddress.length !== 42
    ) {
      toast.error("Invalid Ethereum address format");
      return;
    }

    try {
      const result = await updateExecutorAddress(newExecutorAddress);
      if (result.success) {
        toast.success("Executor address updated successfully");
        setNewExecutorAddress("");
        onExecutorModalClose();
        await loadFactoryData();
      } else {
        toast.error("Failed to update executor address");
      }
    } catch (error) {
      console.error("Error updating executor address:", error);
      toast.error("Error updating executor address");
    }
  };

  const handleLibraryUpdate = async () => {
    if (!newLibraryAddress) {
      toast.error("Please enter a library address");
      return;
    }

    // Basic validation
    if (
      !newLibraryAddress.startsWith("0x") ||
      newLibraryAddress.length !== 42
    ) {
      toast.error("Invalid Ethereum address format");
      return;
    }

    try {
      const result = await updateReinvestLibraryAddress(newLibraryAddress);
      if (result.success) {
        toast.success("Reinvest library updated successfully");
        setNewLibraryAddress("");
        onLibraryModalClose();
        await loadFactoryData();
      } else {
        toast.error("Failed to update reinvest library");
      }
    } catch (error) {
      console.error("Error updating reinvest library:", error);
      toast.error("Error updating reinvest library");
    }
  };

  if (!address) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold">DCA Factory Controls</h3>
        </CardHeader>
        <CardBody>
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">
              Please connect your wallet to access factory controls
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
          <h3 className="text-xl font-semibold">DCA Factory Controls</h3>
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

  if (!factoryState) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold">DCA Factory Controls</h3>
        </CardHeader>
        <CardBody>
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">Loading factory state...</p>
            <Button
              color="primary"
              variant="light"
              onPress={handleRefresh}
              isLoading={refreshing}
            >
              Retry Loading
            </Button>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold">DCA Factory Controls</h3>
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

        {/* Factory Status */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span>Factory Status</span>
            <div className="flex items-center gap-2">
              <Chip color={factoryState.isActive ? "success" : "danger"}>
                {factoryState.isActive ? "Active" : "Paused"}
              </Chip>
              <Switch
                isSelected={factoryState.isActive}
                onValueChange={(active) => handleFactoryToggle(!active)}
                isDisabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Total Accounts</p>
              <p className="font-semibold text-lg">
                {factoryState.totalAccounts}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Reinvest Version</p>
              <p className="font-semibold">{factoryState.reinvestVersion}</p>
            </div>
          </div>
        </div>

        <Divider />

        {/* Contract Addresses */}
        <div className="space-y-4">
          <h4 className="font-semibold">Contract Configuration</h4>

          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  Executor Address
                </p>
                <p className="font-mono text-sm text-gray-700 dark:text-gray-300 break-all">
                  {factoryState.executorAddress}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  Reinvest Library
                </p>
                <p className="font-mono text-sm text-gray-700 dark:text-gray-300 break-all">
                  {factoryState.reinvestLibraryAddress}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  Swap Router
                </p>
                <p className="font-mono text-sm text-gray-700 dark:text-gray-300 break-all">
                  {factoryState.swapRouter}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              color="primary"
              variant="solid"
              size="sm"
              onPress={onExecutorModalOpen}
              isDisabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium"
            >
              Update Executor
            </Button>
            <Button
              color="secondary"
              variant="solid"
              size="sm"
              onPress={onLibraryModalOpen}
              isDisabled={loading}
              className="bg-purple-500 hover:bg-purple-600 text-white font-medium"
            >
              Update Reinvest Library
            </Button>
          </div>
        </div>

        <Divider />

        {/* Emergency Controls */}
        <div>
          <h4 className="font-medium mb-4">Emergency Controls</h4>
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-red-500 mt-0.5" size={20} />
              <div className="flex-1">
                <p className="text-sm text-red-600 dark:text-red-400 mb-3">
                  Emergency pause will immediately stop all new account
                  creation. Use this only in case of security issues or critical
                  bugs.
                </p>
                <Button
                  color="danger"
                  variant="solid"
                  onPress={onEmergencyModalOpen}
                  isDisabled={loading || !factoryState.isActive}
                  className="bg-red-500 hover:bg-red-600 text-white font-medium"
                >
                  Emergency Pause Factory
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Confirmation Modal */}
        <Modal isOpen={isEmergencyModalOpen} onClose={onEmergencyModalClose}>
          <ModalContent>
            <ModalHeader className="text-red-600">
              <AlertTriangle className="mr-2" size={20} />
              Confirm Emergency Pause
            </ModalHeader>
            <ModalBody>
              <p className="text-sm text-gray-600 mb-4">
                <strong>WARNING:</strong> This will immediately pause the
                factory, preventing all new DCA account creation. This action
                should only be used in emergency situations.
              </p>
              <p className="text-sm text-gray-600">
                Are you sure you want to proceed with the emergency pause?
              </p>
            </ModalBody>
            <ModalFooter>
              <Button
                color="default"
                variant="light"
                onPress={onEmergencyModalClose}
              >
                Cancel
              </Button>
              <Button
                color="danger"
                onPress={handleEmergencyPause}
                isLoading={loading}
              >
                Emergency Pause
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Update Executor Modal */}
        <Modal isOpen={isExecutorModalOpen} onClose={onExecutorModalClose}>
          <ModalContent>
            <ModalHeader>Update Executor Address</ModalHeader>
            <ModalBody>
              <p className="text-sm text-gray-600 mb-4">
                This will update the executor address that the factory uses for
                new DCA accounts. Make sure the new address is correct and
                properly deployed.
              </p>
              <Input
                label="New Executor Address"
                placeholder="0x..."
                value={newExecutorAddress}
                onValueChange={setNewExecutorAddress}
                variant="flat"
                color="default"
                classNames={{
                  input: "bg-transparent",
                  innerWrapper: "bg-transparent",
                  inputWrapper:
                    "bg-default-100 dark:bg-default-50 hover:bg-default-200 dark:hover:bg-default-100",
                }}
              />
              <p className="text-xs text-gray-500 mt-2">
                Current: {factoryState.executorAddress}
              </p>
            </ModalBody>
            <ModalFooter>
              <Button
                color="default"
                variant="light"
                onPress={onExecutorModalClose}
              >
                Cancel
              </Button>
              <Button
                color="primary"
                onPress={handleExecutorUpdate}
                isLoading={loading}
              >
                Update Executor
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Update Library Modal */}
        <Modal isOpen={isLibraryModalOpen} onClose={onLibraryModalClose}>
          <ModalContent>
            <ModalHeader>Update Reinvest Library</ModalHeader>
            <ModalBody>
              <p className="text-sm text-gray-600 mb-4">
                This will update the reinvest library address used by the
                factory. Ensure the new library is compatible and properly
                tested.
              </p>
              <Input
                label="New Library Address"
                placeholder="0x..."
                value={newLibraryAddress}
                onValueChange={setNewLibraryAddress}
                variant="flat"
                color="default"
                classNames={{
                  input: "bg-transparent",
                  innerWrapper: "bg-transparent",
                  inputWrapper:
                    "bg-default-100 dark:bg-default-50 hover:bg-default-200 dark:hover:bg-default-100",
                }}
              />
              <p className="text-xs text-gray-500 mt-2">
                Current: {factoryState.reinvestLibraryAddress}
              </p>
            </ModalBody>
            <ModalFooter>
              <Button
                color="default"
                variant="light"
                onPress={onLibraryModalClose}
              >
                Cancel
              </Button>
              <Button
                color="primary"
                onPress={handleLibraryUpdate}
                isLoading={loading}
              >
                Update Library
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </CardBody>
    </Card>
  );
}
