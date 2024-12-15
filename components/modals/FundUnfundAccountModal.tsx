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
  Spinner,
} from "@nextui-org/react";
import { IDCADataStructures } from "@/types/contracts/contracts/base/DCAAccount";
import { getTokenIcon, getTokenTicker } from "@/lib/helpers/tokenData";
import { formatUnits, parseUnits } from "viem"; // Assuming viem is used for formatting
import { useToken } from "@/hooks/useToken";
import { useAppKitAccount } from "@reown/appkit/react";
import { useDCAAccount } from "@/hooks/useDCAAccount";
import { EthereumAddress } from "@/types/generic";
import { toast } from "sonner";
import Image from "next/image";

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
  const [isWorking, setIsWorking] = useState<boolean>(false);
  const [isComplete, setIsComplete] = useState<boolean>(false);

  const { address } = useAppKitAccount();
  const { fundAccount, defundAccount, withdrawSavings } =
    useDCAAccount(accountAddress);
  const { getBalance } = useToken(
    (selectedToken?.tokenAddress as string) || ""
  );

  useEffect(() => {
    if (selectedToken) {
      // Fetch the contract's balance for the selected token
      const fetchBalance = async () => {
        // Replace with actual logic to fetch balance
        console.log("Selceted Token Check : ", selectedToken);
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
  }, [accountAddress, actionType, address, getBalance, selectedToken, tokens]);

  const handleClose = () => {
    onClose();
    setIsComplete(false);
    setIsWorking(false);
    setBalance(0.0);
  };

  const handleAction = async () => {
    if (!selectedToken || !amount) return;

    setIsWorking(true);
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
          result = await withdrawSavings(selectedToken, amountBigInt);
          break;
      }

      if (result) {
        toast.success(`Successfully ${actionType}ed account`);
        setIsComplete(true);
      }
    } catch (error) {
      console.error(`Error ${actionType}ing account:`, error);
      toast.error(`Failed to ${actionType} account`);
    } finally {
      setIsWorking(false);
    }
  };

  const renderTokenOption = (token: IDCADataStructures.TokenDataStruct) => (
    <div style={{ display: "flex", alignItems: "center" }}>
      <Image
        src={getTokenIcon(token)}
        alt={getTokenTicker(token)}
        width={20}
        height={20}
        style={{ marginRight: 8 }}
      />
      {getTokenTicker(token)}
    </div>
  );

  const getModalTitle = () => {
    switch (actionType) {
      case "fund":
        return "Fund Account";
      case "unfund":
        return "Defund Token";
      case "withdraw":
        return "Withdraw Savings";
    }
  };

  const getSubmitLabel = () => {
    switch (actionType) {
      case "fund":
        return isWorking ? "Funding" : "Fund";
      case "unfund":
        return isWorking ? "Defunding" : "Defund";
      case "withdraw":
        return isWorking ? "Withdrawing" : "Withdraw";
    }
  };

  const getCompletionMessage = () => {
    switch (actionType) {
      case "fund":
        return `Account funded with ${amount} ${selectedToken?.ticker}`;
      case "unfund":
        return `Account was defunded of ${amount} ${selectedToken?.ticker}`;
      case "withdraw":
        return `${amount} ${selectedToken?.ticker} Savings where withdrawn`;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalContent>
        <ModalHeader>{getModalTitle()}</ModalHeader>
        <ModalBody>
          {isComplete ? (
            <div className="flex flex-col items-center justify-center">
              <div className="text-green-500 text-2xl mb-4">✓</div>
              <p>{getCompletionMessage()}</p>
            </div>
          ) : (
            <>
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
                isDisabled={isWorking}
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
                isDisabled={isWorking}
              />
            </>
          )}
        </ModalBody>
        <ModalFooter>
          {isComplete ? (
            <Button onPress={handleClose} color="success">
              Close
            </Button>
          ) : (
            <>
              <Button
                onPress={handleClose}
                variant="light"
                isDisabled={isWorking}
              >
                Cancel
              </Button>
              <Button
                onPress={handleAction}
                color="primary"
                disabled={isWorking}
                isLoading={isWorking}
              >
                {getSubmitLabel()}
              </Button>
            </>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
