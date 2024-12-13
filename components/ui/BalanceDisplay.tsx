/** @format */

import React from "react";
import { ethers } from "ethers";
import Image from "next/image";
import {
  getTokenDecimals,
  getTokenIcon,
  getTokenTicker,
} from "@/lib/helpers/tokenData";
import { IDCADataStructures } from "@/types/contracts/contracts/base/DCAAccount";
import { EthereumAddress } from "@/types";
import { Card, CardBody } from "@nextui-org/react";
import { TokenBalances } from "@/hooks/useAccountStats";
import { formatUnits } from "ethers";
import { buildNetworkScanLink } from "@/lib/helpers/buildScanLink";
import { ACTIVE_CHAIN } from "@/constants/contracts";
import useSigner from "@/hooks/useSigner";

interface AccountBalancesProps {
  accountBalances: TokenBalances;
  selectedAccount: EthereumAddress;
  accountStrategies: IDCADataStructures.StrategyStruct[];
}

export const AccountBalances: React.FC<AccountBalancesProps> = ({
  accountBalances,
  selectedAccount,
  accountStrategies,
}) => {
  const { ACTIVE_NETWORK } = useSigner();
  return (
    <Card>
      <CardBody>
        <div className="flex justify-between">
          <h4 className="text-sm font-semibold mb-2">Funds</h4>
          <span className="text-sm font-semibold mb-2 text-right">Savings</span>
        </div>
        <div className="space-y-2">
          {Object.entries(accountBalances).map(([tokenAddress, data]) => {
            const baseTokenData = accountStrategies.find(
              (strategy: IDCADataStructures.StrategyStruct) =>
                strategy.baseToken.tokenAddress === tokenAddress
            )?.baseToken;
            const targetTokenData = accountStrategies.find(
              (strategy: IDCADataStructures.StrategyStruct) =>
                strategy.targetToken.tokenAddress === tokenAddress &&
                strategy.accountAddress === selectedAccount
            )?.targetToken;

            if (!baseTokenData && !targetTokenData) return null;

            const tokenData = baseTokenData || targetTokenData;

            return (
              <div
                key={tokenAddress}
                className="flex justify-between items-center"
              >
                <div className="flex-1 text-left">
                  <span>
                    {baseTokenData && data.balance != null
                      ? parseFloat(
                          formatUnits(
                            data.balance,
                            getTokenDecimals(baseTokenData)
                          )
                        ).toFixed(3)
                      : "0.00"}
                  </span>
                </div>
                <div className="flex-1 text-center">
                  {tokenData && (
                    <a
                      href={buildNetworkScanLink({
                        address: tokenAddress,
                        network: ACTIVE_NETWORK!,
                      })}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Image
                        src={getTokenIcon(tokenData)}
                        alt={getTokenTicker(tokenData)}
                        width={16}
                        height={16}
                        className="inline-block mr-1"
                      />
                      {getTokenTicker(tokenData)}
                    </a>
                  )}
                </div>
                <div className="flex-1 text-right">
                  <span>
                    {targetTokenData && data.targetBalance != null
                      ? parseFloat(
                          formatUnits(
                            data.targetBalance,
                            getTokenDecimals(targetTokenData)
                          )
                        ).toFixed(3)
                      : "0.00"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
};
