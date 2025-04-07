/** @format */

import React from "react";
import { Card, CardBody } from "@nextui-org/react";
import Image from "next/image";
import { getTokenIcon, getTokenTicker } from "@/helpers/tokenData";
import { IDCADataStructures } from "@/types/contracts/contracts/base/DCAAccount";
import { EthereumAddress } from "@/types";
import { formatUnits, Signer, BigNumberish } from "ethers";
import { buildNetworkScanLink } from "@/helpers/buildScanLink";
import { NetworkKeys } from "@/types";
import { TokenBalances } from "@/providers/DCAStatsProvider";

interface AccountBalancesProps {
  accountBalances: TokenBalances;
  selectedAccount: EthereumAddress;
  accountStrategies: IDCADataStructures.StrategyStruct[];
  ACTIVE_NETWORK: NetworkKeys;
  Signer: Signer;
}

const safeFormatUnits = (
  value: BigNumberish,
  decimals: number | string
): string => {
  try {
    // Ensure decimals is a valid number
    const parsedDecimals = Number(decimals);
    if (isNaN(parsedDecimals) || parsedDecimals < 0 || parsedDecimals > 18) {
      return formatUnits(value.toString(), 18); // Convert to string first
    }
    return formatUnits(value.toString(), parsedDecimals); // Convert to string first
  } catch (error) {
    console.error("Error formatting units:", error);
    return "0.0";
  }
};

export const AccountBalances: React.FC<AccountBalancesProps> = ({
  accountBalances,
  selectedAccount,
  accountStrategies,
  ACTIVE_NETWORK,
  Signer,
}) => {
  // Get unique tokens from strategies
  const uniqueTokens = new Set<string>();
  accountStrategies.forEach((strategy) => {
    uniqueTokens.add(strategy.baseToken.tokenAddress.toString());
    uniqueTokens.add(strategy.targetToken.tokenAddress.toString());
  });

  return (
    <Card>
      <CardBody>
        <div className="flex justify-between">
          <h4 className="text-sm font-semibold mb-2">Funds</h4>
          <span className="text-sm font-semibold mb-2 text-right">Savings</span>
        </div>
        <div className="space-y-2">
          {Array.from(uniqueTokens).map((tokenAddress) => {
            const strategy = accountStrategies.find(
              (s) =>
                s.baseToken.tokenAddress.toString() === tokenAddress ||
                s.targetToken.tokenAddress.toString() === tokenAddress
            );

            if (!strategy) return null;

            const tokenData =
              strategy.baseToken.tokenAddress.toString() === tokenAddress
                ? strategy.baseToken
                : strategy.targetToken;

            const isBaseToken =
              strategy.baseToken.tokenAddress.toString() === tokenAddress;

            const balanceData = accountBalances[tokenAddress] || {
              balance: BigInt(0),
              targetBalance: BigInt(0),
              remainingExecutions: 0,
              needsTopUp: false,
            };

            const formattedBalance = balanceData.balance
              ? parseFloat(
                  safeFormatUnits(
                    balanceData.balance,
                    Number(tokenData.decimals)
                  )
                ).toFixed(6)
              : "0.000000";

            const formattedTargetBalance = balanceData.targetBalance
              ? parseFloat(
                  safeFormatUnits(
                    balanceData.targetBalance,
                    Number(tokenData.decimals)
                  )
                ).toFixed(6)
              : "0.000000";

            return (
              <div
                key={tokenAddress}
                className="flex justify-between items-center"
              >
                <div className="flex-1 text-left">
                  <span
                    className={balanceData.needsTopUp ? "text-warning" : ""}
                  >
                    {formattedBalance}
                  </span>
                  {balanceData.needsTopUp && isBaseToken && (
                    <span className="text-xs text-warning ml-1">
                      (Low Balance)
                    </span>
                  )}
                </div>
                <div className="flex-1 text-center">
                  <a
                    href={buildNetworkScanLink({
                      address: tokenAddress,
                      network: ACTIVE_NETWORK!,
                    })}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1 hover:text-primary transition-colors"
                  >
                    <Image
                      src={getTokenIcon(tokenData)}
                      alt={getTokenTicker(tokenData)}
                      width={16}
                      height={16}
                      className="inline-block"
                    />
                    <span>{getTokenTicker(tokenData)}</span>
                  </a>
                </div>
                <div className="flex-1 text-right">
                  <span>{formattedTargetBalance}</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
};
