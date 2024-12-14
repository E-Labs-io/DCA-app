/** @format */

import React, { useState } from "react";
import { Button, Card, CardBody, Chip } from "@nextui-org/react";
import { ExternalLink, ChevronUp, ChevronDown } from "lucide-react";
import { buildNetworkScanLink } from "@/lib/helpers/buildScanLink";
import { EthereumAddress } from "@/types/generic";
import { StrategyList } from "../strategy/StrategyList";
import { IDCADataStructures } from "@/types/contracts/contracts/base/DCAAccount";
import { NetworkKeys } from "@/types";
import { useAccountStore } from "@/lib/store/accountStore";
import { useAccountStats } from "@/hooks/useAccountStats";
import { formatDistanceToNow } from "date-fns";
import { AccountInfo } from "./AccountInfo";
import { AccountStrategyStats } from "./AccountStrategyStats";
import { AccountBalances } from "../../common/BalanceDisplay";
import { AccountStats } from "@/types/statsAndTracking";

export interface AccountCardProps {
  accountAddress: EthereumAddress;
  handleAccountClick: (address: EthereumAddress) => void;
  selectedAccount: EthereumAddress;
  ACTIVE_NETWORK: NetworkKeys;
  handleFundingModal: (
    type: "fund" | "unfund" | "withdraw",
    tokens: IDCADataStructures.TokenDataStruct[]
  ) => void;
}

export const AccountCard: React.FC<AccountCardProps> = ({
  accountAddress,
  handleAccountClick,
  ACTIVE_NETWORK,
  handleFundingModal,
}) => {
  const { selectedAccount, accountStrategies } = useAccountStore();
  const {
    isLoading: isStatsLoading,
    totalExecutions,
    tokenBalances,
    executionTimings,
  } = useAccountStats();
  const [expandedAccount, setExpandedAccount] = useState<string | null>(null);

  let account = accountAddress as string;

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

  const handleExpandClick = (account: string) => {
    if (expandedAccount === account) {
      handleAccountClick(account);
      setExpandedAccount(null);
    } else {
      handleAccountClick(account);
      setExpandedAccount(account);
    }
  };

  return (
    <Card className="w-full transition-all duration-200">
      <CardBody>
        <div className="flex flex-col gap-4">
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={() => handleExpandClick(account)}
          >
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">
                {`${account.slice(0, 6)}...${account.slice(-4)}`}
              </h3>
              <a
                href={getEtherscanUrl(account)}
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
              {expandedAccount === account ? (
                <ChevronUp size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
            </div>
          </div>

          {expandedAccount === account && (
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
                  accountBalances={accountBalances}
                  accountStrategies={accountStrategies[account]}
                  selectedAccount={selectedAccount}
                />
              </div>

              <StrategyList
                accountAddress={account}
                strategies={accountStrategies[account] || []}
              />
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
};
