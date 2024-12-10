/** @format */

"use client";

import { useCallback } from "react";
import { useWriteContract, useReadContract, usePublicClient } from "wagmi";
import { IDCADataStructures } from "@/types/contracts/contracts/base/DCAAccount";
import { DCAAccount__factory } from "@/types/contracts";
export function useDCAAccount(accountAddress: string) {
  const { writeContract, isPending } = useWriteContract();
  const publicClient = usePublicClient();

  const { data: strategies = [] } = useReadContract({
    abi: DCAAccount__factory.abi,
    address: accountAddress as `0x${string}`,
    functionName: "getStrategies",
    enabled: !!accountAddress,
  });

  const createStrategy = useCallback(
    async ({
      strategy,
      fundAmount,
      subscribe,
    }: {
      strategy: IDCADataStructures.StrategyStruct;
      fundAmount: bigint;
      subscribe: boolean;
    }) => {
      if (!accountAddress) {
        throw new Error("Missing account address");
      }

      try {
        const { hash } = await writeContract({
          abi: DCAAccount__factory.abi,
          address: accountAddress as `0x${string}`,
          functionName: "SetupStrategy",
          args: [strategy, fundAmount, subscribe],
        });

        if (!hash) {
          throw new Error(
            "Failed to create strategy - no transaction hash returned"
          );
        }

        return hash;
      } catch (error: any) {
        console.error("Error in createStrategy:", error);
        throw new Error(error?.message || "Failed to create strategy");
      }
    },
    [writeContract, accountAddress]
  );

  return {
    createStrategy,
    strategies,
    isCreatingStrategy: isPending,
  };
}
