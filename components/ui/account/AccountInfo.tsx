/** @format */

import React from "react";
import { Button, Card, CardBody, Chip } from "@nextui-org/react";
import {
  DCAAccount,
  IDCADataStructures,
} from "@/types/contracts/contracts/base/DCAAccount";
import { useDCAAccount } from "@/hooks/useDCAAccount";
import { AccountStats, useDCAProvider } from "@/providers/DCAStatsProvider";
import { Signer } from "ethers";

interface AccountInfoProps {
  account: DCAAccount;
  timeAgo: string;
  stats: AccountStats;
  handleFundingModal: (
    type: "fund" | "unfund" | "withdraw",
    tokens: IDCADataStructures.TokenDataStruct[]
  ) => void;
  Signer: Signer;
}

export const AccountInfo: React.FC<AccountInfoProps> = ({
  stats,
  account,
  timeAgo,
  handleFundingModal,
  Signer,
}) => {
  const { getAccountStrategies } = useDCAProvider();
  const { getAccountBaseTokens, getAccountTargetTokens } = useDCAAccount(
    account,
    Signer
  );

  const reinvestCheck = (
    reinvestLibraryVersion: string | false
  ): {
    message: string;
    color: "primary" | "secondary" | "warning" | "danger" | "default";
  } => {
    if (
      reinvestLibraryVersion !== "false" &&
      reinvestLibraryVersion !== false
    ) {
      return { message: reinvestLibraryVersion, color: "primary" };
    }
    return { message: "Not Active", color: "default" };
  };

  return (
    <Card>
      <CardBody>
        <h4 className="text-sm font-semibold mb-2">Account Info</h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-400">Reinvest Library:</span>
            <Chip
              size="sm"
              color={reinvestCheck(stats.reinvestLibraryVersion).color}
            >
              {reinvestCheck(stats.reinvestLibraryVersion).message}
            </Chip>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-400">Last Execution:</span>
            <span className="text-sm">{timeAgo}</span>
          </div>
          <div className="flex gap-2 mt-2">
            <Button
              size="sm"
              color="primary"
              onPress={() => {
                handleFundingModal(
                  "fund",
                  getAccountBaseTokens(getAccountStrategies(account.target)!)
                );
              }}
            >
              Fund
            </Button>
            <Button
              size="sm"
              color="secondary"
              onPress={() => {
                handleFundingModal(
                  "unfund",
                  getAccountBaseTokens(getAccountStrategies(account.target)!)
                );
              }}
            >
              Defund
            </Button>
            <Button
              size="sm"
              color="warning"
              onPress={() => {
                handleFundingModal(
                  "withdraw",
                  getAccountTargetTokens(getAccountStrategies(account.target)!)
                );
              }}
            >
              Withdraw
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};
