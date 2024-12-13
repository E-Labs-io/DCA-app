/** @format */

import React from "react";
import { Button, Card, CardBody, Chip } from "@nextui-org/react";
import { EthereumAddress } from "@/types/generic";
import { IDCADataStructures } from "@/types/contracts/contracts/base/DCAAccount";
import { useDCAAccount } from "@/hooks/useDCAAccount";
import { AccountStats } from "./AccountCard";

interface AccountInfoProps {
  selectedAccount: EthereumAddress;
  timeAgo: string;
  stats: AccountStats;
  handleFundingModal: (
    type: "fund" | "unfund" | "withdraw",
    tokens: IDCADataStructures.TokenDataStruct[]
  ) => void;
}

export const AccountInfo: React.FC<AccountInfoProps> = ({
  selectedAccount,
  stats,
  timeAgo,
  handleFundingModal,
}) => {
  const { getAccountBaseTokens, getAccountTargetTokens } =
    useDCAAccount(selectedAccount);
  return (
    <Card>
      <CardBody>
        <h4 className="text-sm font-semibold mb-2">Account Info</h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-400">Reinvest Library:</span>
            <Chip size="sm" color="primary">
              {stats.reinvestLibraryVersion}
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
                handleFundingModal("fund", getAccountBaseTokens());
              }}
            >
              Fund
            </Button>
            <Button
              size="sm"
              color="secondary"
              onPress={() => {
                handleFundingModal("unfund", getAccountBaseTokens());
              }}
            >
              Defund
            </Button>
            <Button
              size="sm"
              color="warning"
              onPress={() => {
                handleFundingModal("withdraw", getAccountTargetTokens());
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
