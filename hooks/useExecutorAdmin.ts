/** @format */

import { useState, useCallback, useEffect } from "react";
import { useAppKitAccount } from "@reown/appkit/react";
import { connectToDCAExecutor } from "@/hooks/helpers/connectToContract";
import { DCAExecutorAddress } from "@/constants/contracts";
import { IDCADataStructures } from "@/types/contracts/contracts/base/DCAExecutor";
import { DCAExecutor } from "@/types/contracts";
import useSigner from "./useSigner";

export function useExecutorAdmin() {
  const [loading, setLoading] = useState(false);
  const { Signer, ACTIVE_NETWORK, isInitializing } = useSigner();
  const { address } = useAppKitAccount();
  const [DCAExecutorContract, setDCAExecutorContract] =
    useState<DCAExecutor | null>(null);
  const [DCA_EXECUTOR_ADDRESS, setDCA_EXECUTOR_ADDRESS] = useState<string>();

  useEffect(() => {
    if (Signer && ACTIVE_NETWORK && address) {
      const executorAddress = DCAExecutorAddress[ACTIVE_NETWORK];
      if (executorAddress) {
        console.log("Connecting to executor contract:", executorAddress);
        connectToDCAExecutor(executorAddress, Signer)
          .then((executor) => {
            setDCAExecutorContract(executor);
            setDCA_EXECUTOR_ADDRESS(executorAddress);
            console.log("Executor contract connected successfully");
          })
          .catch((error) => {
            console.error("Failed to connect to executor contract:", error);
          });
      } else {
        console.warn("No executor address found for network:", ACTIVE_NETWORK);
      }
    }
  }, [Signer, ACTIVE_NETWORK, address]);

  // Get executor contract instance (read-only)
  const getExecutorContractReadOnly = useCallback(async () => {
    // Wait for signer initialization if it's in progress
    if (isInitializing) {
      console.log("Waiting for signer initialization...");
      throw new Error("Signer is initializing - please wait");
    }

    if (!Signer) {
      console.error("No Signer available");
      throw new Error("Signer not available - please connect your wallet");
    }

    if (!ACTIVE_NETWORK) {
      console.error("No ACTIVE_NETWORK available");
      throw new Error("Network not detected - please switch to Base network");
    }

    if (!DCA_EXECUTOR_ADDRESS) {
      console.error("No DCA_EXECUTOR_ADDRESS for network:", ACTIVE_NETWORK);
      throw new Error(`Executor contract not deployed on ${ACTIVE_NETWORK}`);
    }

    console.log(
      "Connecting to executor at:",
      DCA_EXECUTOR_ADDRESS,
      "on network:",
      ACTIVE_NETWORK
    );
    return await connectToDCAExecutor(DCA_EXECUTOR_ADDRESS, Signer);
  }, [Signer, DCA_EXECUTOR_ADDRESS, ACTIVE_NETWORK, isInitializing]);

  // Check if address is the contract owner
  const checkIfOwner = useCallback(
    async (addressToCheck: string): Promise<boolean> => {
      try {
        const contract = await getExecutorContractReadOnly();
        const owner = await contract.owner();
        return owner.toLowerCase() === addressToCheck.toLowerCase();
      } catch (error) {
        console.error("Error checking owner status:", error);
        return false;
      }
    },
    [getExecutorContractReadOnly]
  );

  // Check if address is admin
  const checkIfAdmin = useCallback(
    async (addressToCheck: string): Promise<boolean> => {
      try {
        const contract = await getExecutorContractReadOnly();
        return await contract.checkIfAdmin(addressToCheck);
      } catch (error) {
        console.error("Error checking admin status:", error);
        return false;
      }
    },
    [getExecutorContractReadOnly]
  );

  // Check if address has admin access (either admin or owner)
  const checkIfAdminOrOwner = useCallback(
    async (
      addressToCheck: string
    ): Promise<{
      isOwner: boolean;
      isAdmin: boolean;
      hasAccess: boolean;
    }> => {
      try {
        const [isOwner, isAdmin] = await Promise.all([
          checkIfOwner(addressToCheck),
          checkIfAdmin(addressToCheck),
        ]);

        return {
          isOwner,
          isAdmin,
          hasAccess: isOwner || isAdmin,
        };
      } catch (error) {
        console.error("Error checking admin/owner status:", error);
        return {
          isOwner: false,
          isAdmin: false,
          hasAccess: false,
        };
      }
    },
    [checkIfOwner, checkIfAdmin]
  );

  // Get contract owner address
  const getOwner = useCallback(async (): Promise<string> => {
    try {
      const contract = await getExecutorContractReadOnly();
      return await contract.owner();
    } catch (error) {
      console.error("Error getting owner:", error);
      throw error;
    }
  }, [getExecutorContractReadOnly]);

  // Set active state (pause/unpause)
  const setActiveState = useCallback(
    async (active: boolean) => {
      if (!DCAExecutorContract) {
        throw new Error("Executor contract not available");
      }

      setLoading(true);
      try {
        const tx = await DCAExecutorContract.setActiveState(active);
        await tx.wait();
        return { success: true, hash: tx.hash };
      } catch (error) {
        console.error("Error setting active state:", error);
        return { success: false, error: error as Error };
      } finally {
        setLoading(false);
      }
    },
    [DCAExecutorContract]
  );

  // Set interval active status
  const setIntervalActive = useCallback(
    async (interval: number, status: boolean) => {
      if (!DCAExecutorContract) {
        throw new Error("Executor contract not available");
      }

      setLoading(true);
      try {
        const tx = await DCAExecutorContract.setIntervalActive(
          interval,
          status
        );
        await tx.wait();
        return { success: true, hash: tx.hash };
      } catch (error) {
        console.error("Error setting interval active:", error);
        return { success: false, error: error as Error };
      } finally {
        setLoading(false);
      }
    },
    [DCAExecutorContract]
  );

  // Set base token allowance
  const setBaseTokenAllowance = useCallback(
    async (tokenAddress: string, allowed: boolean) => {
      if (!DCAExecutorContract) {
        throw new Error("Executor contract not available");
      }

      setLoading(true);
      try {
        const tx = await DCAExecutorContract.setBaseTokenAllowance(
          tokenAddress,
          allowed
        );
        await tx.wait();
        return { success: true, hash: tx.hash };
      } catch (error) {
        console.error("Error setting base token allowance:", error);
        return { success: false, error: error as Error };
      } finally {
        setLoading(false);
      }
    },
    [DCAExecutorContract]
  );

  // Add admin
  const addAdmin = useCallback(
    async (adminAddress: string) => {
      if (!DCAExecutorContract) {
        throw new Error("Executor contract not available");
      }

      setLoading(true);
      try {
        const tx = await DCAExecutorContract.addAdmin(adminAddress);
        await tx.wait();
        return { success: true, hash: tx.hash };
      } catch (error) {
        console.error("Error adding admin:", error);
        return { success: false, error: error as Error };
      } finally {
        setLoading(false);
      }
    },
    [DCAExecutorContract]
  );

  // Remove admin
  const removeAdmin = useCallback(
    async (adminAddress: string) => {
      if (!DCAExecutorContract) {
        throw new Error("Executor contract not available");
      }

      setLoading(true);
      try {
        const tx = await DCAExecutorContract.removeAdmin(adminAddress);
        await tx.wait();
        return { success: true, hash: tx.hash };
      } catch (error) {
        console.error("Error removing admin:", error);
        return { success: false, error: error as Error };
      } finally {
        setLoading(false);
      }
    },
    [DCAExecutorContract]
  );

  // Change executor address
  const changeExecutor = useCallback(
    async (executorAddress: string) => {
      if (!DCAExecutorContract) {
        throw new Error("Executor contract not available");
      }

      setLoading(true);
      try {
        const tx = await DCAExecutorContract.changeExecutor(executorAddress);
        await tx.wait();
        return { success: true, hash: tx.hash };
      } catch (error) {
        console.error("Error changing executor:", error);
        return { success: false, error: error as Error };
      } finally {
        setLoading(false);
      }
    },
    [DCAExecutorContract]
  );

  // Set fee data
  const setFeeData = useCallback(
    async (feeData: IDCADataStructures.FeeDistributionStruct) => {
      if (!DCAExecutorContract) {
        throw new Error("Executor contract not available");
      }

      setLoading(true);
      try {
        const tx = await DCAExecutorContract.setFeeData(feeData);
        await tx.wait();
        return { success: true, hash: tx.hash };
      } catch (error) {
        console.error("Error setting fee data:", error);
        return { success: false, error: error as Error };
      } finally {
        setLoading(false);
      }
    },
    [DCAExecutorContract]
  );

  // Get current system state
  const getSystemState = useCallback(async () => {
    try {
      const contract = await getExecutorContractReadOnly();
      const [
        isActive,
        totalActiveStrategies,
        totalExecutions,
        feeData,
        executorAddress,
      ] = await Promise.all([
        contract.isActive(),
        contract.getTotalActiveStrategys(),
        contract.getTotalExecutions(),
        contract.getFeeData(),
        contract.getExecutorAddress(),
      ]);

      return {
        isActive,
        totalActiveStrategies: Number(totalActiveStrategies),
        totalExecutions: Number(totalExecutions),
        feeData,
        executorAddress,
      };
    } catch (error) {
      console.error("Error getting system state:", error);
      throw error;
    }
  }, [getExecutorContractReadOnly]);

  // Get interval status
  const getIntervalStatus = useCallback(
    async (interval: number) => {
      try {
        const contract = await getExecutorContractReadOnly();
        const [isActive, totalStrategies] = await Promise.all([
          contract.isIntervalActive(interval),
          contract.getIntervalTotalActiveStrategies(interval),
        ]);

        return {
          isActive,
          totalStrategies: Number(totalStrategies),
        };
      } catch (error) {
        console.error("Error getting interval status:", error);
        throw error;
      }
    },
    [getExecutorContractReadOnly]
  );

  // Check if token is allowed as base
  const isTokenAllowedAsBase = useCallback(
    async (tokenAddress: string) => {
      try {
        const contract = await getExecutorContractReadOnly();
        return await contract.isTokenAllowedAsBase(tokenAddress);
      } catch (error) {
        console.error("Error checking token allowance:", error);
        return false;
      }
    },
    [getExecutorContractReadOnly]
  );

  return {
    loading,
    checkIfAdmin,
    checkIfOwner,
    checkIfAdminOrOwner,
    getOwner,
    setActiveState,
    setIntervalActive,
    setBaseTokenAllowance,
    addAdmin,
    removeAdmin,
    changeExecutor,
    setFeeData,
    getSystemState,
    getIntervalStatus,
    isTokenAllowedAsBase,
  };
}
