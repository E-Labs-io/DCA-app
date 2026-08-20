/** @format */

import { ethers } from "ethers";
import { IDCADataStructures } from "@/types/contracts/contracts/base/DCAAccount";

/**
 * Reinvest module codes — must match contracts/library/Codes.sol.
 * Only NOT_ACTIVE and FORWARD are offered in the UI for now: Aave /
 * Compound modules need live protocol deployments per chain and are a
 * post-MVP surface.
 */
export const REINVEST_NONE = 0x00;
export const REINVEST_FORWARD = 0x01;

export const reinvestOptions = [
  {
    code: REINVEST_NONE,
    key: "none",
    label: "None",
    description: "Bought tokens accrue in the account as savings",
  },
  {
    code: REINVEST_FORWARD,
    key: "forward",
    label: "Forward to wallet",
    description: "Each buy is sent straight to an address you choose",
  },
] as const;

/**
 * Build the on-chain Reinvest struct. Forward's reinvestData is
 * abi.encode(uint8 moduleCode, address receiver, address token) — see
 * contracts/modules/ForwardReinvest.sol ReinvestDataStruct.
 */
export function buildReinvest(
  dcaAccountAddress: string,
  code: number,
  opts?: { receiver?: string; targetTokenAddress?: string }
): IDCADataStructures.ReinvestStruct {
  if (code === REINVEST_FORWARD) {
    if (!opts?.receiver || !ethers.isAddress(opts.receiver)) {
      throw new Error("A valid receiver address is required for Forward reinvest");
    }
    return {
      reinvestData: ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint8", "address", "address"],
        [REINVEST_FORWARD, opts.receiver, opts.targetTokenAddress ?? ethers.ZeroAddress]
      ) as `0x${string}`,
      active: true,
      investCode: REINVEST_FORWARD,
      dcaAccountAddress: dcaAccountAddress as `0x${string}`,
    };
  }
  return {
    reinvestData: "0x" as `0x${string}`,
    active: false,
    investCode: REINVEST_NONE,
    dcaAccountAddress: dcaAccountAddress as `0x${string}`,
  };
}

/** Human label for a strategy's current reinvest state. */
export function describeReinvest(
  reinvest: IDCADataStructures.ReinvestStruct | undefined
): string {
  if (!reinvest || !reinvest.active || Number(reinvest.investCode) === REINVEST_NONE) {
    return "None — buys accrue in the account";
  }
  if (Number(reinvest.investCode) === REINVEST_FORWARD) {
    try {
      const [, receiver] = ethers.AbiCoder.defaultAbiCoder().decode(
        ["uint8", "address", "address"],
        reinvest.reinvestData as string
      );
      return `Forwarding buys to ${String(receiver).slice(0, 6)}…${String(receiver).slice(-4)}`;
    } catch {
      return "Forwarding buys (unreadable data)";
    }
  }
  return `Module 0x${Number(reinvest.investCode).toString(16)}`;
}
