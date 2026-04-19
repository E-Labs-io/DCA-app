/** @format */

"use client";

import { formatUnits } from "viem";
import { IDCADataStructures } from "@/types/contracts/contracts/base/DCAAccount";

export function useTokenFormatter() {
  const formatTokenAmount = (
    amount: bigint,
    token: IDCADataStructures.TokenDataStruct
  ) => {
    return formatUnits(amount, Number(token?.decimals ?? 0));
  };

  return {
    formatTokenAmount,
  };
}
