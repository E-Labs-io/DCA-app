/** @format */

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { DCAAccount } from "@/types/contracts";
import { ReinvestModule, ReinvestStrategy } from "@/types/reinvest";
import { IDCADataStructures } from "@/types/contracts/contracts/base/DCAAccount";
import { Signer } from "ethers";

export function useReinvest(dcaAccount: DCAAccount, Signer: Signer) {
  const [availableModules, setAvailableModules] = useState<ReinvestModule[]>(
    []
  );
  const [loading, setLoading] = useState(false);

  // Fetch available reinvestment modules
  const fetchAvailableModules = useCallback(async () => {
    setLoading(true);
    try {
      const reinvestLib = await dcaAccount.getAttachedReinvestLibraryAddress();
      const activeModules = await reinvestLib.getActiveModuals();

      const modules = await Promise.all(
        activeModules.map(async (moduleId) => {
          const name = await reinvestLib.getModuleName(moduleId);
          // Build module info based on ID
          return {
            id: moduleId,
            name,
            description: getModuleDescription(moduleId),
            protocolLogo: getModuleLogo(moduleId),
            supportedTokens: getModuleSupportedTokens(moduleId),
          };
        })
      );

      setAvailableModules(modules);
    } catch (error) {
      console.error("Error fetching reinvest modules:", error);
      toast.error("Failed to load reinvestment options");
    } finally {
      setLoading(false);
    }
  }, [dcaAccount]);

  // Enable reinvestment for a strategy
  const enableReinvest = useCallback(
    async (strategyId: number, moduleId: number, moduleData: any) => {
      if (!Signer) {
        toast.error("Please connect your wallet first");
        return false;
      }

      try {
        setLoading(true);
        toast.info("Setting up reinvestment strategy...");

        // Encode the module data based on the module type
        const encodedData = encodeModuleData(moduleId, moduleData);

        // Create reinvest structure
        const reinvestData: IDCADataStructures.ReinvestStruct = {
          moduleId,
          active: true,
          data: encodedData,
        };

        // Set up the reinvestment
        const tx = await dcaAccount.SetupReinvest(strategyId, reinvestData);

        toast.loading("Confirming transaction...");
        await tx.wait();

        toast.success("Reinvestment strategy activated!");
        return true;
      } catch (error) {
        console.error("Error enabling reinvest:", error);
        toast.error("Failed to enable reinvestment");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [Signer, dcaAccount]
  );

  // Disable reinvestment for a strategy
  const disableReinvest = useCallback(
    async (strategyId: number) => {
      if (!Signer) {
        toast.error("Please connect your wallet first");
        return false;
      }

      try {
        setLoading(true);
        toast.info("Disabling reinvestment strategy...");

        // Create empty reinvest structure with active = false
        const reinvestData: IDCADataStructures.ReinvestStruct = {
          moduleId: 0,
          active: false,
          data: "0x",
        };

        const tx = await dcaAccount.SetupReinvest(strategyId, reinvestData);

        toast.loading("Confirming transaction...");
        await tx.wait();

        toast.success("Reinvestment strategy disabled!");
        return true;
      } catch (error) {
        console.error("Error disabling reinvest:", error);
        toast.error("Failed to disable reinvestment");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [Signer, dcaAccount]
  );

  // Helper functions for module data
  const encodeModuleData = (moduleId: number, data: any): string => {
    // Implementation depends on the specific module
    switch (moduleId) {
      case 0x01: // Forward
        return encodeForwardData(data);
      case 0x12: // Aave
        return encodeAaveData(data);
      case 0x11: // Compound
        return encodeCompoundData(data);
      default:
        return "0x";
    }
  };

  // Encode specific module data
  const encodeForwardData = (data: { receiver: string; token: string }) => {
    return ethers.utils.defaultAbiCoder.encode(
      ["uint8", "address", "address"],
      [0x01, data.receiver, data.token]
    );
  };

  const encodeAaveData = (data: { token: string; aToken: string }) => {
    return ethers.utils.defaultAbiCoder.encode(
      ["uint8", "address", "address"],
      [0x00, data.token, data.aToken]
    );
  };

  const encodeCompoundData = (data: {
    moduleCode: number;
    receiver: string;
    token: string;
  }) => {
    return ethers.utils.defaultAbiCoder.encode(
      ["uint8", "address", "address"],
      [data.moduleCode, data.receiver, data.token]
    );
  };

  return {
    availableModules,
    loading,
    fetchAvailableModules,
    enableReinvest,
    disableReinvest,
  };
}
