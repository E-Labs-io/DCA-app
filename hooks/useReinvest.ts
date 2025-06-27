/** @format */

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { DCAAccount } from "@/types/contracts";
import { ReinvestModule } from "@/types/reinvest";
import { IDCADataStructures } from "@/types/contracts/contracts/base/DCAAccount";
import { Signer, ethers } from "ethers";

export function useReinvest(dcaAccount: DCAAccount, Signer: Signer) {
  const [availableModules, setAvailableModules] = useState<ReinvestModule[]>(
    []
  );
  const [loading, setLoading] = useState(false);

  // Fetch available reinvestment modules (simplified for now)
  const fetchAvailableModules = useCallback(async () => {
    setLoading(true);
    try {
      // For now, return hardcoded modules until reinvest library is properly implemented
      const modules: ReinvestModule[] = [
        {
          id: 0x01,
          name: "Forward",
          description: "Forward tokens to specified address",
          protocolLogo: "/icons/forward.svg",
          supportedTokens: ["ETH", "USDC", "DAI"],
        },
        {
          id: 0x12,
          name: "Aave V3",
          description: "Deposit tokens to Aave V3 for yield",
          protocolLogo: "/icons/platforms/aave-purple.svg",
          supportedTokens: ["ETH", "USDC", "DAI"],
        },
        {
          id: 0x11,
          name: "Compound V3",
          description: "Supply tokens to Compound V3",
          protocolLogo: "/icons/platforms/compound.png",
          supportedTokens: ["ETH", "USDC"],
        },
      ];

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
    async (
      strategyId: number,
      investCode: number,
      moduleData: string = "0x"
    ) => {
      if (!Signer) {
        toast.error("Please connect your wallet first");
        return false;
      }

      try {
        setLoading(true);
        toast.info("Setting up reinvestment strategy...");

        // Create reinvest structure with correct properties
        const reinvestData: IDCADataStructures.ReinvestStruct = {
          reinvestData: moduleData,
          active: true,
          investCode,
          dcaAccountAddress: dcaAccount.target,
        };

        // Use the correct method name
        const tx = await dcaAccount.setStrategyReinvest(
          strategyId,
          reinvestData
        );

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

        // Create disabled reinvest structure
        const reinvestData: IDCADataStructures.ReinvestStruct = {
          reinvestData: "0x",
          active: false,
          investCode: 0,
          dcaAccountAddress: dcaAccount.target,
        };

        const tx = await dcaAccount.setStrategyReinvest(
          strategyId,
          reinvestData
        );

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

  // Helper function to encode module data (simplified)
  const encodeModuleData = useCallback(
    (moduleId: number, data: any): string => {
      try {
        switch (moduleId) {
          case 0x01: // Forward
            return ethers.AbiCoder.defaultAbiCoder().encode(
              ["address"],
              [data.receiver || ethers.ZeroAddress]
            );
          case 0x12: // Aave
            return ethers.AbiCoder.defaultAbiCoder().encode(
              ["address"],
              [data.aToken || ethers.ZeroAddress]
            );
          case 0x11: // Compound
            return ethers.AbiCoder.defaultAbiCoder().encode(
              ["address"],
              [data.cToken || ethers.ZeroAddress]
            );
          default:
            return "0x";
        }
      } catch (error) {
        console.error("Error encoding module data:", error);
        return "0x";
      }
    },
    []
  );

  return {
    availableModules,
    loading,
    fetchAvailableModules,
    enableReinvest,
    disableReinvest,
    encodeModuleData,
  };
}
