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
import { tokenList, type TokenTickers } from "@/constants/tokens";
import { useAppKitAccount } from "@reown/appkit/react";
import { parseUnits } from "viem";
import { toast } from "sonner";
import { IDCADataStructures } from "@/types/contracts/contracts/base/DCAAccount";
import { useTokenApproval } from "@/hooks/useTokenApproval";
import {
  Interval,
  IntervalOption,
  intervalOptions,
} from "@/constants/intervals";

interface FormData {
  baseToken: string;
  targetToken: string;
  amount: string;
  interval: Interval;
  fundAmount: string;
  subscribeToExecutor: boolean;
}
interface CreateStrategyModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountAddress: string;
}

export function CreateStrategyModal({
  isOpen,
  onClose,
  accountAddress,
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
  });

  const selectedTokenDecimals = formData.baseToken
    ? tokenList[formData.baseToken as TokenTickers]?.decimals
    : 18;

  const { address } = useAppKitAccount();
  const { createStrategy } = useDCAAccount(accountAddress);
  const { getAllowance, approveToken, checkAllowance } = useTokenApproval(
    formData.baseToken
      ? (tokenList[formData.baseToken as TokenTickers]?.contractAddress
          .ETH_SEPOLIA as string) || ""
      : "",
    selectedTokenDecimals
  );

  const createTokenData = (
    ticker: TokenTickers
  ): IDCADataStructures.TokenDataStruct => {
    const token = tokenList[ticker];
    return {
      tokenAddress: token.contractAddress.ETH_SEPOLIA as `0x${string}`,
      decimals: BigInt(token.decimals),
      ticker: token.ticker,
    };
  };

  const createReinvestData = (): IDCADataStructures.ReinvestStruct => ({
    reinvestData: "0x" as `0x${string}`,
    active: false,
    investCode: 0,
    dcaAccountAddress: accountAddress as `0x${string}`,
  });

  const resetForm = () => {
    setFormData({
      baseToken: "",
      targetToken: "",
      amount: "",
      interval: Interval.OneDay,
      fundAmount: "",
      subscribeToExecutor: true,
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
        !formData.interval ||
        !address
      ) {
        toast.error(
          "Please fill in all required fields and connect your wallet"
        );
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
            accountAddress,
            formData.fundAmount
          ).catch(() => false);
        } catch (error) {
          console.warn("Allowance check failed, proceeding anyway:", error);
        }

        if (!hasAllowance) {
          setStep(2);
          toast.dismiss(approvalToast);
          toast.loading("Please approve token spending...");

          try {
            const transaction = await approveToken(
              accountAddress,
              formData.fundAmount
            ).catch((error: any) => {
              console.warn("Approval warning:", error);
              return null;
            });

            if (typeof transaction !== "boolean") {
              toast.loading("Waiting for approval confirmation...");
              await transaction?.tx.wait();
              toast.success("Token approval confirmed");
            }
          } catch (error) {
            console.warn("Non-critical approval error:", error);
          }
        } else {
          toast.dismiss(approvalToast);
          toast.success("Token approval verified");
        }
      }

      setStep(3);
      toast.loading("Creating strategy...");

      const strategyData: IDCADataStructures.StrategyStruct = {
        accountAddress: accountAddress as `0x${string}`,
        baseToken: createTokenData(formData.baseToken as TokenTickers),
        targetToken: createTokenData(formData.targetToken as TokenTickers),
        interval: BigInt(formData.interval),
        amount: parseUnits(formData.amount, selectedTokenDecimals),
        strategyId: 0,
        active: true,
        reinvest: createReinvestData(),
      };

      const fundAmountBigInt = formData.fundAmount
        ? parseUnits(formData.fundAmount, selectedTokenDecimals)
        : 0;

      const transaction = await createStrategy({
        strategy: strategyData,
        fundAmount: BigInt(fundAmountBigInt),
        subscribe: formData.subscribeToExecutor,
      }).catch((error: any) => {
        console.warn("Strategy creation warning:", error);
        return null;
      });

      if (typeof transaction !== "boolean") {
        toast.loading("Waiting for transaction confirmation...");
        try {
          await transaction?.tx.wait();
          toast.success("Strategy creation completed");
        } catch (error) {
          console.warn("Transaction confirmation error:", error);
          toast.error("Failed to confirm transaction");
        }
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
            {Object.values(tokenList).map((token) => (
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
            {Object.values(tokenList).map((token) => (
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
