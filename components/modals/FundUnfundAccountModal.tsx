/** @format */

import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Select,
  SelectItem,
  Input,
} from "@nextui-org/react";
import { IDCADataStructures } from "@/types/contracts/contracts/base/DCAAccount";
import { getTokenIcon, getTokenTicker } from "@/lib/helpers/tokenData";
import { formatUnits } from "viem"; // Assuming viem is used for formatting
import { useToken } from "@/hooks/useToken";
import { useAppKitAccount } from "@reown/appkit/react";
import { useDCAAccount } from "@/hooks/useDCAAccount";
import { EthereumAddress } from "@/types/generic";
import { parseUnits } from "viem";
import { toast } from "sonner";

interface FundUnfundAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokens: IDCADataStructures.TokenDataStruct[];
  actionType: "fund" | "unfund" | "withdraw";
  accountAddress: EthereumAddress;
}

export function FundUnfundAccountModal({
  isOpen,
  onClose,
  tokens,
  actionType,
  accountAddress,
}: FundUnfundAccountModalProps) {
  const [selectedToken, setSelectedToken] =
    useState<IDCADataStructures.TokenDataStruct | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [balance, setBalance] = useState<number>(0.0);

  const { address } = useAppKitAccount();
  const { fundAccount, defundAccount, WithdrawSavings } =
    useDCAAccount(accountAddress);
  const { getBalance } = useToken(
    (selectedToken?.tokenAddress as string) || ""
  );

  useEffect(() => {
    if (selectedToken) {
      // Fetch the contract's balance for the selected token
      const fetchBalance = async () => {
        // Replace with actual logic to fetch balance
        if (actionType === "fund") {
          const balance = await getBalance(address as string);
          console.log(
            "Balacne of wallet for token",
            selectedToken?.ticker,
            balance
          );
          setBalance(
            Number(formatUnits(balance, Number(selectedToken.decimals)))
          );
        } else {
          const balance = await getBalance(accountAddress as string);
          console.log(
            "Balacne of Account for token",
            selectedToken?.ticker,
            balance
          );
          setBalance(
            Number(formatUnits(balance, Number(selectedToken.decimals)))
          );
        }
      };

      fetchBalance();
    }
  }, [selectedToken]);

  const handleAction = async () => {
    if (!selectedToken || !amount) return;

    try {
      const amountBigInt = parseUnits(amount, Number(selectedToken.decimals));
      let result;

      switch (actionType) {
        case "fund":
          result = await fundAccount(selectedToken, amountBigInt);
          break;
        case "unfund":
          result = await defundAccount(selectedToken, amountBigInt);
          break;
        case "withdraw":
          result = await WithdrawSavings(selectedToken, amountBigInt);
          break;
      }

      if (result) {
        toast.success(`Successfully ${actionType}ed account`);
        onClose();
      }
    } catch (error) {
      console.error(`Error ${actionType}ing account:`, error);
      toast.error(`Failed to ${actionType} account`);
    }
  };

  const renderTokenOption = (token: IDCADataStructures.TokenDataStruct) => (
    <div style={{ display: "flex", alignItems: "center" }}>
      <img
        src={getTokenIcon(token)}
        alt={getTokenTicker(token)}
        style={{ width: 20, height: 20, marginRight: 8 }}
      />
      {getTokenTicker(token)}
    </div>
  );

  const getModalTitle = () => {
    switch (actionType) {
      case "fund":
        return "Fund Account";
      case "unfund":
        return "Unfund Base Token";
      case "withdraw":
        return "Withdraw Target Token";
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>{getModalTitle()}</ModalHeader>
        <ModalBody>
          <Select
            label="Select Token"
            placeholder="Choose a token"
            selectedKeys={selectedToken ? [selectedToken.ticker] : []}
            onChange={(e) => {
              const token = tokens.find((t) => t.ticker === e.target.value);
              setSelectedToken(token || null);
            }}
            renderValue={() => {
              if (selectedToken) {
                return renderTokenOption(selectedToken);
              }
              return null;
            }}
          >
            {tokens.map((token) => (
              <SelectItem
                key={token.ticker}
                value={token.ticker}
                textValue={getTokenTicker(token)}
              >
                {renderTokenOption(token)}
              </SelectItem>
            ))}
          </Select>
          {selectedToken && (
            <div style={{ marginTop: 10 }}>
              <strong>Balance:</strong> {balance} {selectedToken.ticker}
            </div>
          )}
          <Input
            type="number"
            label="Amount"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </ModalBody>
        <ModalFooter>
          <Button onPress={onClose} variant="light">
            Cancel
          </Button>
          <Button onPress={handleAction} color="primary">
            {actionType === "fund"
              ? "Fund"
              : actionType === "unfund"
              ? "Unfund"
              : "Withdraw"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
