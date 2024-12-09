/** @format */

"use client";

import { useCallback } from "react";
import { ethers } from "ethers";
import { useAccount, usePublicClient } from "wagmi";
import { DCAAccountABI } from "@/lib/contracts/abis/DCAAccount";
import { type StrategyStruct } from "@/lib/types/dca";

export function useDCAStrategy(accountAddress: string, strategyId: bigint) {
  const { connector } = useAccount();
  const publicClient = usePublicClient();

  const getContract = useCallback(async () => {
    if (!connector) throw new Error("Wallet not connected");
    const provider = await connector.getProvider();
    const ethersProvider = new ethers.BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();
    return new ethers.Contract(accountAddress, DCAAccountABI, signer);
  }, [connector, accountAddress]);

  const getTimeTillNextExecution = useCallback(async () => {
    try {
      const contract = await getContract();
      const [lastExecution, secondsLeft, isReady] = await contract.getTimeTillWindow(strategyId);
      return {
        lastExecution: Number(lastExecution),
        secondsLeft: Number(secondsLeft),
        isReady
      };
    } catch (error) {
      console.error("Error getting time till next execution:", error);
      return null;
    }
  }, [getContract, strategyId]);

  const pauseStrategy = useCallback(async () => {
    if (!accountAddress || !strategyId) {
      throw new Error("Missing required parameters");
    }

    try {
      const contract = await getContract();
      const tx = await contract.ExecutorDeactivateStrategy(strategyId);
      return tx.hash as `0x${string}`;
    } catch (error: any) {
      console.error("Error pausing strategy:", error);
      throw new Error(error?.message || "Failed to pause strategy");
    }
  }, [getContract, accountAddress, strategyId]);

  const resumeStrategy = useCallback(async () => {
    if (!accountAddress || !strategyId) {
      throw new Error("Missing required parameters");
    }

    try {
      const contract = await getContract();
      const tx = await contract.SubscribeStrategy(strategyId);
      return tx.hash as `0x${string}`;
    } catch (error: any) {
      console.error("Error resuming strategy:", error);
      throw new Error(error?.message || "Failed to resume strategy");
    }
  }, [getContract, accountAddress, strategyId]);

  const deleteStrategy = useCallback(async () => {
    if (!accountAddress || !strategyId) {
      throw new Error("Missing required parameters");
    }

    try {
      const contract = await getContract();
      const tx = await contract.UnsubscribeStrategy(strategyId);
      return tx.hash as `0x${string}`;
    } catch (error: any) {
      console.error("Error deleting strategy:", error);
      throw new Error(error?.message || "Failed to delete strategy");
    }
  }, [getContract, accountAddress, strategyId]);

  return {
    getTimeTillNextExecution,
    pauseStrategy,
    resumeStrategy,
    deleteStrategy,
  };
}
