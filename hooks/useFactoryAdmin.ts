/** @format */

import { useState, useCallback, useEffect } from "react";
import { useAppKitAccount } from "@reown/appkit/react";
import { connectToDCAFactory } from "@/hooks/helpers/connectToContract";
import { DCAFactoryAddress } from "@/constants/contracts";
import { DCAFactory } from "@/types/contracts";
import useSigner from "./useSigner";
import { ethers } from "ethers";

export function useFactoryAdmin() {
  const [loading, setLoading] = useState(false);
  const { Signer, ACTIVE_NETWORK, isInitializing } = useSigner();
  const { address } = useAppKitAccount();
  const [DCAFactoryContract, setDCAFactoryContract] =
    useState<DCAFactory | null>(null);
  const [DCA_FACTORY_ADDRESS, setDCA_FACTORY_ADDRESS] = useState<string>();

  useEffect(() => {
    if (Signer && ACTIVE_NETWORK && address) {
      const factoryAddress = DCAFactoryAddress[ACTIVE_NETWORK];
      if (factoryAddress) {
        console.log("Connecting to factory contract:", factoryAddress);
        connectToDCAFactory(factoryAddress, Signer)
          .then((factory) => {
            setDCAFactoryContract(factory);
            setDCA_FACTORY_ADDRESS(factoryAddress);
            console.log("Factory contract connected successfully");
          })
          .catch((error) => {
            console.error("Failed to connect to factory contract:", error);
          });
      } else {
        console.warn("No factory address found for network:", ACTIVE_NETWORK);
      }
    }
  }, [Signer, ACTIVE_NETWORK, address]);

  // Get factory contract instance (read-only)
  const getFactoryContractReadOnly = useCallback(async () => {
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

    if (!DCA_FACTORY_ADDRESS) {
      console.error("No DCA_FACTORY_ADDRESS for network:", ACTIVE_NETWORK);
      throw new Error(`Factory contract not deployed on ${ACTIVE_NETWORK}`);
    }

    console.log(
      "Connecting to factory at:",
      DCA_FACTORY_ADDRESS,
      "on network:",
      ACTIVE_NETWORK
    );
    return await connectToDCAFactory(DCA_FACTORY_ADDRESS, Signer);
  }, [Signer, DCA_FACTORY_ADDRESS, ACTIVE_NETWORK, isInitializing]);

  // Pause factory
  const pauseFactory = useCallback(async () => {
    if (!DCAFactoryContract) {
      throw new Error("Factory contract not available");
    }

    setLoading(true);
    try {
      const tx = await DCAFactoryContract.pauseFactory();
      await tx.wait();
      return { success: true, hash: tx.hash };
    } catch (error) {
      console.error("Error pausing factory:", error);
      return { success: false, error: error as Error };
    } finally {
      setLoading(false);
    }
  }, [DCAFactoryContract]);

  // Unpause factory
  const unpauseFactory = useCallback(async () => {
    if (!DCAFactoryContract) {
      throw new Error("Factory contract not available");
    }

    setLoading(true);
    try {
      const tx = await DCAFactoryContract.unpauseFactory();
      await tx.wait();
      return { success: true, hash: tx.hash };
    } catch (error) {
      console.error("Error unpausing factory:", error);
      return { success: false, error: error as Error };
    } finally {
      setLoading(false);
    }
  }, [DCAFactoryContract]);

  // Update executor address
  const updateExecutorAddress = useCallback(
    async (newExecutorAddress: string) => {
      if (!DCAFactoryContract) {
        throw new Error("Factory contract not available");
      }

      setLoading(true);
      try {
        const tx = await DCAFactoryContract.updateExecutorAddress(
          newExecutorAddress
        );
        await tx.wait();
        return { success: true, hash: tx.hash };
      } catch (error) {
        console.error("Error updating executor address:", error);
        return { success: false, error: error as Error };
      } finally {
        setLoading(false);
      }
    },
    [DCAFactoryContract]
  );

  // Update reinvest library address
  const updateReinvestLibraryAddress = useCallback(
    async (newLibraryAddress: string) => {
      if (!DCAFactoryContract) {
        throw new Error("Factory contract not available");
      }

      setLoading(true);
      try {
        const tx = await DCAFactoryContract.updateReinvestLibraryAddress(
          newLibraryAddress
        );
        await tx.wait();
        return { success: true, hash: tx.hash };
      } catch (error) {
        console.error("Error updating reinvest library address:", error);
        return { success: false, error: error as Error };
      } finally {
        setLoading(false);
      }
    },
    [DCAFactoryContract]
  );

  // Get factory state including reinvest version
  const getFactoryState = useCallback(async () => {
    try {
      const contract = await getFactoryContractReadOnly();
      const [
        isActive,
        totalAccounts,
        executorAddress,
        reinvestLibraryAddress,
        swapRouter,
      ] = await Promise.all([
        contract.getFactoryActiveState(),
        contract.getTotalDeployedAccounts(),
        contract.getActiveExecutorAddress(),
        contract.reInvestLogicContract(),
        contract.SWAP_ROUTER(),
      ]);

      // Try to get reinvest version from the reinvest library
      let reinvestVersion = "Unknown";
      try {
        if (reinvestLibraryAddress && Signer) {
          const reinvestContract = new ethers.Contract(
            reinvestLibraryAddress,
            ["function REINVEST_VERSION() view returns (string)"],
            Signer
          );
          reinvestVersion = await reinvestContract.REINVEST_VERSION();
        }
      } catch (error) {
        console.warn("Could not fetch reinvest version:", error);
      }

      return {
        isActive,
        totalAccounts: Number(totalAccounts),
        executorAddress,
        reinvestLibraryAddress,
        swapRouter,
        reinvestVersion,
      };
    } catch (error) {
      console.error("Error getting factory state:", error);
      throw error;
    }
  }, [getFactoryContractReadOnly, Signer]);

  // Get user accounts count
  const getUserAccountsCount = useCallback(
    async (userAddress: string) => {
      try {
        const contract = await getFactoryContractReadOnly();
        const accounts = await contract.getAccountsOfUser(userAddress);
        return accounts.length;
      } catch (error) {
        console.error("Error getting user accounts count:", error);
        return 0;
      }
    },
    [getFactoryContractReadOnly]
  );

  return {
    loading,
    pauseFactory,
    unpauseFactory,
    updateExecutorAddress,
    updateReinvestLibraryAddress,
    getFactoryState,
    getUserAccountsCount,
  };
}
