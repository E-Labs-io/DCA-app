/** @format */

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { DCAAccount } from "@/types/contracts/contracts/base/DCAAccount";
import { ReinvestModule } from "@/types/reinvest";
import { IDCADataStructures } from "@/types/contracts/contracts/base/DCAAccount";
import { Signer } from "ethers";
import { connectToDCAAccount } from "./helpers/connectToContract";
import { DCAReinvestAddress } from "@/constants/contracts";
import useSigner from "./useSigner";

export function useReinvest(dcaAccount?: DCAAccount, userSigner?: Signer) {
  const [loading, setLoading] = useState(false);
  const { Signer: hookSigner, ACTIVE_NETWORK } = useSigner();

  // Use provided signer or fallback to hook signer
  const signer = userSigner || hookSigner;

  // Get reinvest contract information
  const getReinvestContractInfo = useCallback(async () => {
    try {
      if (!ACTIVE_NETWORK) {
        throw new Error("No active network");
      }

      const reinvestAddress = DCAReinvestAddress[ACTIVE_NETWORK];
      if (!reinvestAddress) {
        throw new Error("Reinvest contract not deployed on this network");
      }

      return {
        address: reinvestAddress,
        network: ACTIVE_NETWORK,
        isDeployed: true,
        version: "1.0.0", // This could be fetched from the contract if available
      };
    } catch (error) {
      console.error("Error getting reinvest contract info:", error);
      return {
        address: null,
        network: ACTIVE_NETWORK || null,
        isDeployed: false,
        version: "Unknown",
      };
    }
  }, [ACTIVE_NETWORK]);

  // Get available reinvest modules
  const getAvailableModules = useCallback(() => {
    // Based on the module IDs from StrategyReinvestCard
    return [
      {
        id: 0x01,
        name: "Forward",
        description: "Forward tokens without yield generation",
        icon: "/icons/forward.svg",
      },
      {
        id: 0x12,
        name: "Aave V3",
        description: "Lend tokens on Aave V3 for yield",
        icon: "/icons/platforms/aave-purple.svg",
      },
      {
        id: 0x11,
        name: "Compound V3",
        description: "Lend tokens on Compound V3 for yield",
        icon: "/icons/platforms/compound.png",
      },
    ];
  }, []);

  // Setup reinvestment for a strategy
  const setupReinvest = useCallback(
    async (
      strategyId: number,
      investCode: number,
      reinvestData: string = "0x"
    ) => {
      if (!dcaAccount) {
        throw new Error("DCA account not available");
      }

      setLoading(true);
      try {
        // Create reinvest structure
        const reinvestStruct: IDCADataStructures.ReinvestStruct = {
          reinvestData: reinvestData,
          active: true,
          investCode,
          dcaAccountAddress: await dcaAccount.getAddress(),
        };

        const tx = await dcaAccount.setStrategyReinvest(
          strategyId,
          reinvestStruct
        );
        await tx.wait();
        return { success: true, hash: tx.hash };
      } catch (error) {
        console.error("Error setting up reinvest:", error);
        return { success: false, error: error as Error };
      } finally {
        setLoading(false);
      }
    },
    [dcaAccount]
  );

  // Disable reinvestment for a strategy
  const disableReinvest = useCallback(
    async (strategyId: number) => {
      if (!dcaAccount) {
        throw new Error("DCA account not available");
      }

      setLoading(true);
      try {
        // Create disabled reinvest structure
        const reinvestStruct: IDCADataStructures.ReinvestStruct = {
          reinvestData: "0x",
          active: false,
          investCode: 0,
          dcaAccountAddress: await dcaAccount.getAddress(),
        };

        const tx = await dcaAccount.setStrategyReinvest(
          strategyId,
          reinvestStruct
        );
        await tx.wait();
        return { success: true, hash: tx.hash };
      } catch (error) {
        console.error("Error disabling reinvest:", error);
        return { success: false, error: error as Error };
      } finally {
        setLoading(false);
      }
    },
    [dcaAccount]
  );

  // Get reinvest data for a strategy
  const getReinvestData = useCallback(
    async (strategyId: number) => {
      if (!dcaAccount) {
        throw new Error("DCA account not available");
      }

      try {
        const strategyData = await dcaAccount.getStrategyData(strategyId);
        return strategyData.reinvest;
      } catch (error) {
        console.error("Error getting reinvest data:", error);
        throw error;
      }
    },
    [dcaAccount]
  );

  // Check if reinvest is active for a strategy
  const isReinvestActive = useCallback(
    async (strategyId: number) => {
      try {
        const reinvestData = await getReinvestData(strategyId);
        return reinvestData.active;
      } catch (error) {
        console.error("Error checking reinvest status:", error);
        return false;
      }
    },
    [getReinvestData]
  );

  // Get total value locked in reinvest
  const getTotalValueLocked = useCallback(async () => {
    if (!dcaAccount) {
      return 0;
    }

    try {
      // This would need to be implemented based on the contract's functionality
      // For now, return a placeholder
      return 0;
    } catch (error) {
      console.error("Error getting TVL:", error);
      return 0;
    }
  }, [dcaAccount]);

  return {
    loading,
    setupReinvest,
    disableReinvest,
    getReinvestData,
    isReinvestActive,
    getReinvestContractInfo,
    getAvailableModules,
    getTotalValueLocked,
  };
}
