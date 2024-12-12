/** @format */

"use client";

import { parseUnits } from "viem";
import { connectERC20 } from "./helpers/connectToContract";
import { useAppKitProvider } from "@reown/appkit/react";

import { toast } from "sonner";
import useSigner from "./useSigner";
import { ContractTransactionReport } from "@/types/contractReturns";
import { useEffect, useState } from "react";
import { erc20 } from "@/types/contracts/@openzeppelin/contracts/token";
import { EthereumAddress } from "@/types";
import { BigNumberish } from "ethers";

export function useToken(tokenAddress: EthereumAddress, decimals: number = 18) {
  const { Signer } = useSigner();
  const [ERC20Instance, setERC20Instance] = useState<erc20.IERC20 | null>(null);

  useEffect(() => {
    if (ERC20Instance?.target !== tokenAddress) {
      !ERC20Instance && connectToToken();
    }
  }, [Signer, ERC20Instance]);

  const connectToToken = async () => {
    if (Signer) {
      const tokenContract = await connectERC20(tokenAddress, Signer);
      setERC20Instance(tokenContract);
      return tokenContract;
    } else {
      throw new Error("[useToken] : No signer available");
    }
  };

  const getBalance = async (owner: string): Promise<bigint> => {
    let instance;
    if (!ERC20Instance) {
      instance = await connectToToken();
    } else instance = ERC20Instance;

    const balance = await instance?.balanceOf(owner);
    return balance;
  };

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
  ): Promise<boolean> => {
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
    toast.info("Please accept the transaction to approve the token");

    const tx = await tokenContract.approve(spender, spender);
    toast.loading("Transaction is confirming...");
    await tx.wait();
    toast.success("Transaction confirmed, the token has been approved");
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
    ERC20Instance,
    checkAllowance,
    approveToken,
    getAllowance,
    getBalance,
  };
}
