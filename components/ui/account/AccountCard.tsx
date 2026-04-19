/** @format */

import React, { useEffect } from "react";
import { Card, CardBody } from "@nextui-org/react";
import { ExternalLink, ChevronUp, ChevronDown } from "lucide-react";
import { buildNetworkScanLink } from "@/helpers/buildScanLink";
import { EthereumAddress } from "@/types/generic";
import { StrategyList } from "./StrategyList";
import { IDCADataStructures } from "@/types/contracts/contracts/base/DCAAccount";
import { NetworkKeys } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { AccountInfo } from "./AccountInfo";
import { AccountStrategyStats } from "./AccountStrategyStats";
import { AccountBalances } from "../../common/BalanceDisplay";
import { Signer } from "ethers";
import { useDCAProvider } from "@/providers/DCAStatsProvider";

export interface AccountCardProps {
  accountAddress: EthereumAddress;
  handleAccountClick: (address: EthereumAddress) => void;
  selectedAccount: EthereumAddress;
  ACTIVE_NETWORK: NetworkKeys;
  Signer: Signer;
  handleFundingModal: (
    type: "fund" | "unfund" | "withdraw",
    tokens: IDCADataStructures.TokenDataStruct[]
  ) => void;
  isExpanded: boolean;
}

export const AccountCard: React.FC<AccountCardProps> = ({
  accountAddress,
  handleAccountClick,
  ACTIVE_NETWORK,
  Signer,
  handleFundingModal,
  isExpanded,
  selectedAccount,
}) => {
  const {
    getAccountStrategies,
    getAccountBalances,
    getAccountStats,
    getAccountInstance,
  } = useDCAProvider();

  const lastExecutionTime: number =
    getAccountStats(accountAddress as string)?.lastExecution ?? 0;

  const timeAgo = formatDistanceToNow(new Date(lastExecutionTime * 1000), {
    addSuffix: true,
  });

  const getEtherscanUrl = (address: string) =>
    buildNetworkScanLink({ network: ACTIVE_NETWORK!, address });

  const addressString = accountAddress as string;

  return (
    <Card
      className={`w-full transition-all duration-200 ${
        selectedAccount === accountAddress
          ? "border-2 border-primary"
          : "border-0"
      }`}
    >
      <CardBody>
        <div className="flex flex-col gap-4">
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={() => handleAccountClick(addressString)}
          >
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">
                {`${addressString.slice(0, 6)}...${addressString.slice(-4)}`}
              </h3>
              <a
                href={getEtherscanUrl(accountAddress as string)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary-400"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink size={16} />
              </a>
              <p className="text-sm text-gray-400">
                {getAccountStats(accountAddress)?.totalActiveStrategies} Active
                / {getAccountStats(accountAddress)?.totalStrategies} Total
                Strategies
              </p>
            </div>

            <div className="flex items-center gap-4">
              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
          </div>

          {isExpanded && (
            <div
              className="mt-4 space-y-6 border-t pt-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <AccountInfo
                  timeAgo={timeAgo}
                  stats={getAccountStats(accountAddress as string)!}
                  handleFundingModal={handleFundingModal}
                  Signer={Signer}
                  account={getAccountInstance(accountAddress as string)!}
                />
                <AccountStrategyStats
                  stats={getAccountStats(accountAddress as string)!}
                />
                <AccountBalances
                  ACTIVE_NETWORK={ACTIVE_NETWORK}
                  Signer={Signer}
                  accountBalances={
                    getAccountBalances(accountAddress as string)!
                  }
                  accountStrategies={
                    getAccountStrategies(accountAddress as string) || []
                  }
                  selectedAccount={accountAddress}
                />
              </div>

              <StrategyList
                accountAddress={accountAddress as string}
                strategies={
                  getAccountStrategies(accountAddress as string) || []
                }
              />
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
};
