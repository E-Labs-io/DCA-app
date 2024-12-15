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

interface StrategyHeaderProps {
  strategy: IDCADataStructures.StrategyStruct;
  executionCount: number;
  totalSpent: bigint;
  averageExecution: bigint;
  nextExecution?: number;
}

export function StrategyHeader({
  strategy,
  executionCount,
  totalSpent,
  averageExecution,
  nextExecution,
}: StrategyHeaderProps) {
  const { formatTokenAmount } = useTokenFormatter();

  const intervalOption = intervalOptions.find(
    (option) => option.value === Number(strategy.interval)
  );

  return (
    <div className="flex flex-col gap-2">
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

      <div className="flex flex-wrap gap-2 mt-2">
        <Chip size="sm" variant="flat">
          Amount:{" "}
          {formatTokenAmount(BigInt(strategy.amount), strategy.baseToken)}{" "}
          {strategy.baseToken.ticker}
        </Chip>
        <Chip size="sm" variant="flat">
          Interval: {intervalOption?.label || "Unknown"}
        </Chip>
        {strategy.active && nextExecution && (
          <Chip size="sm" color="success">
            Next Execution:{" "}
            {formatDistanceToNow(nextExecution * 1000, { addSuffix: true })}
          </Chip>
        )}
        <Chip size="sm" color={strategy.active ? "success" : "danger"}>
          {strategy.active ? "Active" : "Inactive"}
        </Chip>
      </div>

      <div className="text-sm text-gray-400 mt-1">
        <AddressDisplay address={strategy.accountAddress as string} />
      </div>
    </div>
  );
}
