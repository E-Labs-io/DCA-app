/** @format */

"use client";

import { useTokenFormatter } from "@/hooks/useTokenFormatter";
import { IDCADataStructures } from "@/types/contracts/contracts/base/DCAAccount";
import { Chip } from "@nextui-org/react";
import { AddressDisplay } from "../../common/AddressDisplay";
import { getTokenIcon } from "@/lib/helpers/tokenData";
import Image from "next/image";
import { intervalOptions } from "@/constants/intervals";
import { formatDistanceToNow } from "date-fns";
import { ChevronDown, ChevronUp } from "lucide-react";
import { NetworkKeys } from "@/types/Chains";
import {
  ExecutionTimings,
  StrategyStats,
} from "@/lib/providers/DCAStatsProvider";

interface StrategyHeaderProps {
  strategy: IDCADataStructures.StrategyStruct;
  ACTIVE_NETWORK: NetworkKeys;
  stats: StrategyStats;
  isExpanded: boolean;
  onToggle: () => void;
}

export function StrategyHeader({
  strategy,
  ACTIVE_NETWORK,
  stats,
  isExpanded,
  onToggle,
}: StrategyHeaderProps) {
  const intervalOption = intervalOptions.find(
    (option) => option.value === Number(strategy.interval)
  );

  const intervalLabel = intervalOption ? intervalOption.label : "Unknown";

  const lastExecution = stats.lastExecution!;
  const nextExecutionTime = lastExecution + Number(strategy.interval);
  const currentTime = Math.floor(Date.now() / 1000);
  const secondsUntilNextExecution = nextExecutionTime - currentTime;

  return (
    <div
      className="flex items-center justify-between cursor-pointer"
      onClick={onToggle}
    >
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          <Image
            src={getTokenIcon(strategy.baseToken)}
            alt={strategy.baseToken.ticker}
            width={24}
            height={24}
          />
          <span className="font-semibold">{strategy.baseToken.ticker}</span>
        </div>
        <span>→</span>
        <div className="flex items-center gap-2">
          <Image
            src={getTokenIcon(strategy.targetToken)}
            alt={strategy.targetToken.ticker}
            width={24}
            height={24}
          />
          <span className="font-semibold">{strategy.targetToken.ticker}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Chip size="sm" color={strategy.active ? "success" : "danger"}>
          {strategy.active ? "Active" : "Inactive"}
        </Chip>
        <Chip size="sm" color="default">
          {`Every ${intervalLabel}`}
        </Chip>
        {nextExecutionTime && strategy.active && (
          <Chip size="sm" color="default">
            {`Next Execution: ${formatDistanceToNow(nextExecutionTime * 1000, {
              addSuffix: true,
            })}`}
          </Chip>
        )}
        {strategy.reinvest.active && (
          <Chip size="sm" color="success">
            Reinvest Active
          </Chip>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="text-sm text-gray-400">
          <AddressDisplay
            link
            network={ACTIVE_NETWORK}
            address={strategy.accountAddress as string}
          />
        </div>
        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </div>
    </div>
  );
}
