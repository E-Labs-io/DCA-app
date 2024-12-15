/** @format */

import React from "react";
import { Card, CardBody } from "@nextui-org/react";
import { ExternalLink, ChevronUp, ChevronDown } from "lucide-react";
import { buildNetworkScanLink } from "@/lib/helpers/buildScanLink";
import { EthereumAddress } from "@/types/generic";
import { StrategyList } from "./StrategyList";
import { IDCADataStructures } from "@/types/contracts/contracts/base/DCAAccount";
import { NetworkKeys } from "@/types";
import { useAccountStore } from "@/lib/store/accountStore";
import { useAccountStats } from "@/hooks/useAccountStats";
import { formatDistanceToNow } from "date-fns";
import { AccountInfo } from "./AccountInfo";
import { AccountStrategyStats } from "./AccountStrategyStats";
import { AccountBalances } from "../../common/BalanceDisplay";
import { AccountStats } from "@/types/statsAndTracking";
import { Signer } from "ethers";

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
}) => {
  const { selectedAccount, accountStrategies } = useAccountStore();
  const {
    isLoading: isStatsLoading,
    totalExecutions,
    tokenBalances,
    executionTimings,
  } = useAccountStats();

  const getAccountStats = (): AccountStats => {
    const strategies = accountStrategies[accountAddress as string] || [];
    const accountBalances = tokenBalances[accountAddress as string] || {};

    return {
      totalStrategies: strategies.length,
      activeStrategies: strategies.filter((s) => s.active).length,
      totalExecutions: totalExecutions,
      baseTokenBalances: Object.entries(accountBalances).reduce(
        (acc, [token, data]) => {
          acc[token] = data.balance;
          return acc;
        },
        {} as { [key: string]: bigint }
      ),
      reinvestLibraryVersion: "v1.0",
    };
  };

  const stats = getAccountStats();
  const accountBalances = tokenBalances[selectedAccount as string] || {};

  const accountExecutionTimings =
    executionTimings[selectedAccount as string] ?? {};

  const lastExecutionTime: number = Object.values(
    accountExecutionTimings
  ).reduce((max, timing) => Math.max(max, timing.lastExecution), 0);

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
                {stats.activeStrategies} Active / {stats.totalStrategies} Total
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
                  selectedAccount={selectedAccount}
                  timeAgo={timeAgo}
                  stats={stats}
                  handleFundingModal={handleFundingModal}
                />
                <AccountStrategyStats stats={stats} />
                <AccountBalances
                  ACTIVE_NETWORK={ACTIVE_NETWORK}
                  Signer={Signer}
                  accountBalances={accountBalances}
                  accountStrategies={
                    accountStrategies[accountAddress as string]
                  }
                  selectedAccount={selectedAccount}
                />
              </div>

              <StrategyList
                accountAddress={accountAddress as string}
                strategies={accountStrategies[accountAddress as string] || []}
              />
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
};
