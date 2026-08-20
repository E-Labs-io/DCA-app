/** @format */

"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { useState } from "react";
import { useDCAAccount } from "@/hooks/useDCAAccount";
import { stableCoins, tokenList, type TokenTickers } from "@/constants/tokens";
import { useAppKitAccount } from "@reown/appkit/react";
import { parseUnits } from "viem";
import { toast } from "sonner";
import {
  DCAAccount,
  IDCADataStructures,
} from "@/types/contracts/contracts/base/DCAAccount";
import { useToken } from "@/hooks/useToken";
import {
  Interval,
  IntervalOption,
  intervalOptions,
} from "@/constants/intervals";
import { NetworkKeys } from "@/types";
import { Signer } from "ethers";
import { dbg, dbgWarn } from '@/helpers/debug';
import { ethers } from "ethers";
import {
  reinvestOptions,
  buildReinvest,
  REINVEST_NONE,
  REINVEST_FORWARD,
} from "@/helpers/reinvest";

interface FormData {
  baseToken: string;
  targetToken: string;
  amount: string;
  interval: Interval;
  fundAmount: string;
  subscribeToExecutor: boolean;
  reinvestCode: number;
  reinvestReceiver: string;
}
interface CreateStrategyModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountAddress: DCAAccount;
  ACTIVE_NETWORK: NetworkKeys;
  Signer: Signer | null;
}

export function CreateStrategyModal({
  isOpen,
  onClose,
  accountAddress,
  ACTIVE_NETWORK,
  Signer,
}: CreateStrategyModalProps) {
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    baseToken: "",
    targetToken: "",
    amount: "",
    interval: Interval.OneDay,
    fundAmount: "",
    subscribeToExecutor: true,
    reinvestCode: REINVEST_NONE,
    reinvestReceiver: "",
  });

  const selectedTokenDecimals = formData.baseToken
    ? tokenList[formData.baseToken as TokenTickers]?.decimals
    : 18;

  const { address } = useAppKitAccount();
  const { createStrategy } = useDCAAccount(
    accountAddress as DCAAccount,
    Signer!
  );
  const { getAllowance, approveToken, checkAllowance } = useToken(
    formData.baseToken
      ? ((
          tokenList[formData.baseToken as TokenTickers]?.contractAddress as any
        )?.[ACTIVE_NETWORK] as string) || ""
      : "",
    selectedTokenDecimals
  );

  const createTokenData = (
    ticker: TokenTickers
  ): IDCADataStructures.TokenDataStruct => {
    const token = tokenList[ticker];
    return {
      tokenAddress:
        ((token?.contractAddress as any)?.[ACTIVE_NETWORK] as `0x${string}`) ||
        "0x",
      decimals: BigInt(token?.decimals ?? 18),
      ticker: token?.ticker ?? "",
    };
  };

  const createReinvestData = (
    targetTokenAddress: string
  ): IDCADataStructures.ReinvestStruct =>
    buildReinvest(String(accountAddress.target), formData.reinvestCode, {
      receiver: formData.reinvestReceiver || address,
      targetTokenAddress,
    });

  const resetForm = () => {
    setFormData({
      baseToken: "",
      targetToken: "",
      amount: "",
      interval: Interval.OneDay,
      fundAmount: "",
      subscribeToExecutor: true,
      reinvestCode: REINVEST_NONE,
      reinvestReceiver: "",
    });
    setStep(1);
    setIsProcessing(false);
  };

  const handleCreateStrategy = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      if (
        !formData.baseToken ||
        !formData.targetToken ||
        !formData.amount ||
        // == null, not falsy: TestIntervalOneMin is enum value 0, so
        // !interval rejected "[DEV] Every Minute" as a missing field
        formData.interval == null ||
        !address
      ) {
        toast.error(
          "Please fill in all required fields and connect your wallet"
        );
        setIsProcessing(false);
        return;
      }

      // A token without an address on the active network would fall back
      // to "0x" in the strategy struct and revert on-chain — refuse early
      // with a message that says what's actually wrong.
      const baseTokenData = createTokenData(formData.baseToken as TokenTickers);
      const targetTokenData = createTokenData(
        formData.targetToken as TokenTickers
      );
      if (
        formData.reinvestCode === REINVEST_FORWARD &&
        formData.reinvestReceiver &&
        !ethers.isAddress(formData.reinvestReceiver)
      ) {
        toast.error("Reinvest receiver is not a valid address");
        setIsProcessing(false);
        return;
      }

      if (
        baseTokenData.tokenAddress === "0x" ||
        targetTokenData.tokenAddress === "0x"
      ) {
        const missing =
          baseTokenData.tokenAddress === "0x"
            ? formData.baseToken
            : formData.targetToken;
        toast.error(`${missing} is not available on ${ACTIVE_NETWORK}`);
        setIsProcessing(false);
        return;
      }

      if (formData.fundAmount && parseFloat(formData.fundAmount) > 0) {
        setStep(1);
        const approvalToast = toast.loading("Checking token approval...");

        let hasAllowance = false;
        try {
          hasAllowance = await checkAllowance(
            address,
            (accountAddress as DCAAccount).target as string,
            formData.fundAmount
          ).catch(() => false);
        } catch (error) {
          dbgWarn("Allowance check failed, proceeding anyway:", error);
        }

        if (!hasAllowance) {
          setStep(2);
          toast.dismiss(approvalToast);
          toast.loading("Please approve token spending...");

          // A failed approval must abort: funding without allowance makes
          // SetupStrategy revert on transferFrom, and the old flow's
          // swallow-and-continue reported "approval confirmed" for
          // approvals that never happened.
          const transaction = await approveToken(
            (accountAddress as DCAAccount).target as string,
            formData.fundAmount
          ).catch((error: any) => {
            dbgWarn("Approval failed:", error);
            return null;
          });

          if (!transaction || typeof transaction === "boolean") {
            toast.error("Token approval failed — strategy not created");
            setIsProcessing(false);
            return;
          }

          toast.loading("Waiting for approval confirmation...");
          await transaction.tx.wait();
          toast.success("Token approval confirmed");
        } else {
          toast.dismiss(approvalToast);
          toast.success("Token approval verified");
        }
      }

      setStep(3);
      toast.loading("Creating strategy...");

      const strategyData: IDCADataStructures.StrategyStruct = {
        accountAddress: (accountAddress as DCAAccount).target as `0x${string}`,
        baseToken: baseTokenData,
        targetToken: targetTokenData,
        interval: BigInt(formData.interval),
        amount: parseUnits(formData.amount, selectedTokenDecimals!),
        strategyId: 0,
        active: true,
        reinvest: createReinvestData(String(targetTokenData.tokenAddress)),
      };

      const fundAmountBigInt = formData.fundAmount
        ? parseUnits(formData.fundAmount, selectedTokenDecimals!)
        : 0;

      dbg("[CreateStrategyModal] About to create strategy with:", {
        strategyData: {
          baseToken: strategyData.baseToken.ticker,
          targetToken: strategyData.targetToken.ticker,
          amount: strategyData.amount.toString(),
          interval: strategyData.interval.toString(),
          accountAddress: strategyData.accountAddress,
        },
        fundAmount: fundAmountBigInt.toString(),
        subscribe: formData.subscribeToExecutor,
      });

      const transaction = await createStrategy({
        strategy: strategyData,
        fundAmount: BigInt(fundAmountBigInt),
        subscribe: formData.subscribeToExecutor,
      }).catch((error: any) => {
        console.error("Strategy creation error:", error);

        // If we get an "already subscribed" error, try without subscription
        if (
          error.message?.toLowerCase().includes("already") ||
          error.message?.toLowerCase().includes("subscribed")
        ) {
          dbg(
            "[CreateStrategyModal] Retrying without subscription due to 'already subscribed' error"
          );
          toast.loading("Retrying strategy creation without subscription...");

          return createStrategy({
            strategy: strategyData,
            fundAmount: BigInt(fundAmountBigInt),
            subscribe: false, // Force to false to avoid subscription errors
          }).catch((retryError: any) => {
            console.error("Strategy creation retry failed:", retryError);
            return null;
          });
        }

        return null;
      });

      // executeTransaction inside createStrategy already awaits the
      // receipt and shows confirmation toasts, so no second wait here.
      // We only need to surface the final outcome.
      if (transaction && transaction !== null && (transaction as any).success) {
        // Success toast already fired by executeTransaction; nothing more.
      } else if (transaction === false || transaction === null) {
        // Failure already toasted by createStrategy/executeTransaction.
      }

      resetForm();
      onClose();
    } catch (error) {
      console.error("Strategy creation process error:", error);
      toast.error("Failed to create strategy");
      resetForm();
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  const getButtonText = () => {
    if (!isProcessing) return "Create Strategy";
    switch (step) {
      case 1:
        return "Checking Approval...";
      case 2:
        return "Approving Tokens...";
      case 3:
        return "Creating Strategy...";
      default:
        return "Processing...";
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!isProcessing) {
          resetForm();
          onClose();
        }
      }}
      size="2xl"
      isDismissable={!isProcessing}
    >
      <ModalContent>
        <ModalHeader>Create New Strategy</ModalHeader>
        <ModalBody className="gap-4">
          <Select
            label="Base Token"
            placeholder="Select base token"
            selectedKeys={formData.baseToken ? [formData.baseToken] : []}
            onChange={(e) =>
              setFormData({ ...formData, baseToken: e.target.value })
            }
            isDisabled={isProcessing}
          >
            {Object.values(stableCoins)
              .filter((token) => (token.contractAddress as any)?.[ACTIVE_NETWORK])
              .map((token) => (
                <SelectItem key={token.ticker} value={token.ticker}>
                  {token.label}
                </SelectItem>
              ))}
          </Select>

          <Select
            label="Target Token"
            placeholder="Select target token"
            selectedKeys={formData.targetToken ? [formData.targetToken] : []}
            onChange={(e) =>
              setFormData({ ...formData, targetToken: e.target.value })
            }
            isDisabled={isProcessing}
          >
            {Object.values(tokenList)
              .filter((token) => (token.contractAddress as any)?.[ACTIVE_NETWORK])
              .map((token) => (
                <SelectItem key={token.ticker} value={token.ticker}>
                  {token.label}
                </SelectItem>
              ))}
          </Select>

          <Input
            label="Amount"
            placeholder="Enter amount"
            value={formData.amount}
            onChange={(e) =>
              setFormData({ ...formData, amount: e.target.value })
            }
            isDisabled={isProcessing}
          />

          <Select
            label="Execution Interval"
            placeholder="Select execution interval"
            selectedKeys={[formData.interval.toString()]}
            onChange={(e) =>
              setFormData({
                ...formData,
                interval: parseInt(e.target.value) as Interval,
              })
            }
            isDisabled={isProcessing}
          >
            {intervalOptions.map((option: IntervalOption) => (
              <SelectItem
                key={option.value}
                value={option.value}
                description={option.description}
              >
                {option.label}
              </SelectItem>
            ))}
          </Select>

          <Input
            label="Fund Amount"
            placeholder="Enter fund amount"
            value={formData.fundAmount}
            onChange={(e) =>
              setFormData({ ...formData, fundAmount: e.target.value })
            }
            isDisabled={isProcessing}
          />

          <Select
            label="Reinvest bought tokens"
            disallowEmptySelection
            selectedKeys={[String(formData.reinvestCode)]}
            onChange={(e) =>
              setFormData({ ...formData, reinvestCode: Number(e.target.value) })
            }
            isDisabled={isProcessing}
          >
            {reinvestOptions.map((o) => (
              <SelectItem
                key={String(o.code)}
                value={String(o.code)}
                description={o.description}
              >
                {o.label}
              </SelectItem>
            ))}
          </Select>

          {formData.reinvestCode === REINVEST_FORWARD && (
            <Input
              label="Reinvest receiver"
              placeholder={address ?? "0x…"}
              description="Each buy is sent here straight after the swap (defaults to your wallet)"
              value={formData.reinvestReceiver}
              onChange={(e) =>
                setFormData({ ...formData, reinvestReceiver: e.target.value })
              }
              isInvalid={
                formData.reinvestReceiver.length > 0 &&
                !ethers.isAddress(formData.reinvestReceiver)
              }
              errorMessage="Not a valid address"
              isDisabled={isProcessing}
            />
          )}

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.subscribeToExecutor}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  subscribeToExecutor: e.target.checked,
                })
              }
              disabled={isProcessing}
            />
            <label>Subscribe to Executor</label>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="bordered"
            onPress={() => {
              if (!isProcessing) {
                resetForm();
                onClose();
              }
            }}
            isDisabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            color="primary"
            onPress={handleCreateStrategy}
            isLoading={isProcessing}
          >
            {getButtonText()}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
