/** @format */

"use client";

import { parseUnits } from "viem";
import { connectERC20 } from "./helpers/connectToContract";
import { useAppKitProvider } from "@reown/appkit/react";

import { toast } from "sonner";
import useSigner from "./useSigner";
import { ContractTransactionReport } from "@/types/contractReturns";

export function useTokenApproval(tokenAddress: string, decimals: number = 18) {
  const { Signer } = useSigner();

  const getAllowance = async (owner: string, spender: string) => {
    if (!Signer) {
      toast.error("Please connect your wallet first");
      throw new Error("No signer available");
    }
    const tokenContract = await connectERC20(tokenAddress, Signer);
    const allowance = await tokenContract.allowance(owner, spender);
    return allowance;
  };

  const checkAllowance = async (
    owner: string,
    spender: string,
    amount: string
  ) => {
    if (!tokenAddress) {
      console.error("Token address is required for allowance check");
      return false;
    }
    if (!Signer) {
      toast.error("Please connect your wallet first");
      throw new Error("No signer available");
    }

    try {
      const allowance = await getAllowance(owner, spender);
      if (!allowance) {
        console.warn("No allowance data returned");
        return false;
      }

      const requiredAmount = parseUnits(amount, decimals);
      return BigInt(allowance) >= requiredAmount;
    } catch (error: any) {
      console.error("Error checking allowance:", {
        error,
        tokenAddress,
        owner,
        spender,
        amount,
        message: error?.message,
      });
      return false;
    }
  };

  const approveToken = async (
    spender: string,
    amount: string
  ): Promise<ContractTransactionReport | false> => {
    if (!tokenAddress) {
      throw new Error("Token address is required for approval");
    }

    if (!Signer) {
      toast.error("Please connect your wallet first");
      throw new Error("No signer available");
    }
    const tokenContract = await connectERC20(tokenAddress, Signer);
    const tx = await tokenContract.approve(spender, spender);
    await tx.wait();
    try {
      console.log("Approving token:", {
        tokenAddress,
        spender,
        amount,
        parsedAmount: parseUnits(amount, decimals).toString(),
      });

      if (!tx.hash)
        throw new Error("No transaction hash returned from approval");
      return { tx, hash: tx.hash };
    } catch (error: any) {
      console.error("Error approving token:", {
        error,
        tokenAddress,
        spender,
        amount,
        message: error?.message,
        code: error?.code,
      });
      throw error;
    }
  };

  return {
    checkAllowance,
    approveToken,
    getAllowance,
  };
}
