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
import { getTokenIcon, getTokenTicker } from "@/helpers/tokenData";
import { formatUnits, parseUnits } from "viem"; // Assuming viem is used for formatting
import { useToken } from "@/hooks/useToken";
import { useAppKitAccount } from "@reown/appkit/react";
import { useDCAAccount } from "@/hooks/useDCAAccount";
import { EthereumAddress } from "@/types/generic";
import { toast } from "sonner";
import Image from "next/image";
import { useDCAProvider } from "@/providers/DCAStatsProvider";
import { dbg } from '@/helpers/debug';

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
  // Raw bigint alongside the display value so percent quick-fills and
  // "Max" are exact rather than float-rounded.
  const [rawBalance, setRawBalance] = useState<bigint>(0n);
  const [isWorking, setIsWorking] = useState<boolean>(false);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  // Bumped after a confirmed tx so the modal's own balance line refetches.
  const [refreshKey, setRefreshKey] = useState(0);

  const { address } = useAppKitAccount();
  const { getAccountInstance, Signer } = useDCAProvider();
  const { fundAccount, defundAccount, withdrawSavings } = useDCAAccount(
    getAccountInstance(accountAddress)!,
    Signer!
  );
  const { getBalance } = useToken(
    (selectedToken?.tokenAddress as string) || ""
  );

  useEffect(() => {
    if (selectedToken) {
      // Fetch the contract's balance for the selected token
      const fetchBalance = async () => {
        // Replace with actual logic to fetch balance
        dbg("Selceted Token Check : ", selectedToken);
        // The relevant balance differs per action: funding spends the
        // WALLET's tokens, but defund/withdraw are limited by the
        // account contract's internal ledgers (_baseBalances /
        // _targetBalances), NOT its raw ERC20 balance — when a token is
        // base in one strategy and target in another, balanceOf is the
        // sum of both and Max would overfill and revert.
        let balance: bigint;
        if (actionType === "fund") {
          balance = BigInt(await getBalance(address as string));
        } else {
          const account = getAccountInstance(accountAddress)!;
          balance =
            actionType === "unfund"
              ? BigInt(
                  await account.getBaseBalance(String(selectedToken.tokenAddress))
                )
              : BigInt(
                  await account.getTargetBalance(String(selectedToken.tokenAddress))
                );
        }
        dbg("Balance for token", selectedToken?.ticker, balance);
        setRawBalance(balance);
        setBalance(
          Number(formatUnits(balance, Number(selectedToken.decimals)))
        );
      };

      fetchBalance();
    }
  }, [accountAddress, actionType, address, getBalance, selectedToken, tokens, refreshKey]);

  const handleClose = () => {
    onClose();
    setIsComplete(false);
    setIsWorking(false);
    setBalance(0.0);
    setRawBalance(0n);
    setAmount("");
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
        setRefreshKey((k) => k + 1);
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
                  // Kill stale values until the new token's balance
                  // resolves — chips formatting the OLD raw balance with
                  // the NEW token's decimals were off by 10^12 on
                  // mixed-decimal pairs.
                  setRawBalance(0n);
                  setBalance(0);
                  setAmount("");
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
                <button
                  type="button"
                  className="mt-2 text-left text-sm hover:text-primary transition-colors"
                  onClick={() =>
                    setAmount(
                      formatUnits(rawBalance, Number(selectedToken.decimals))
                    )
                  }
                  disabled={isWorking}
                  title="Click to use full balance"
                >
                  <strong>Balance:</strong> {balance} {selectedToken.ticker}
                </button>
              )}
              <Input
                type="number"
                label="Amount"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                isDisabled={isWorking}
              />
              {selectedToken && rawBalance > 0n && (
                <div className="flex gap-2">
                  {[25, 50, 75, 100].map((pct) => (
                    <Button
                      key={pct}
                      size="sm"
                      variant="flat"
                      isDisabled={isWorking}
                      onPress={() =>
                        setAmount(
                          formatUnits(
                            (rawBalance * BigInt(pct)) / 100n,
                            Number(selectedToken.decimals)
                          )
                        )
                      }
                    >
                      {pct === 100 ? "Max" : `${pct}%`}
                    </Button>
                  ))}
                </div>
              )}
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
