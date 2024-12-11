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
  Spinner,
} from "@nextui-org/react";
import { IDCADataStructures } from "@/types/contracts/contracts/base/DCAAccount";
import { useDCAAccount } from "@/hooks/useDCAAccount";
import { useState } from "react";
import { parseUnits } from "viem";
import { toast } from "sonner";
import { useTokenApproval } from "@/hooks/useTokenApproval";
import { useAppKitAccount } from "@reown/appkit/react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FundStrategyModalProps {
  isOpen: boolean;
  onClose: () => void;
  strategy: IDCADataStructures.StrategyStruct;
}

type FundingState = "idle" | "checking" | "approving" | "funding" | "success";

export function FundStrategyModal({
  isOpen,
  onClose,
  strategy,
}: FundStrategyModalProps) {
  const [amount, setAmount] = useState("");
  const [fundingState, setFundingState] = useState<FundingState>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const { address } = useAppKitAccount();
  const { fundAccount } = useDCAAccount(strategy?.accountAddress);
  const { checkAllowance, approveToken } = useTokenApproval(
    strategy?.baseToken?.tokenAddress as string,
    Number(strategy?.baseToken?.decimals)
  );

  const handleClose = () => {
    if (
      fundingState !== "checking" &&
      fundingState !== "approving" &&
      fundingState !== "funding"
    ) {
      setFundingState("idle");
      setAmount("");
      setErrorMessage("");
      onClose();
    }
  };

  const isUserRejectionError = (error: any) => {
    return (
      error.code === 4001 ||
      error.message?.includes("user rejected") ||
      error.message?.includes("User denied") ||
      error.message?.includes("rejected") ||
      error.message?.includes("denied")
    );
  };

  const handleError = (error: any) => {
    if (isUserRejectionError(error)) {
      setErrorMessage("User Cancelled");
      setFundingState("idle");
    } else {
      console.error("Error during transaction:", error);
      setErrorMessage(error.message || "Transaction failed");
      setFundingState("idle");
    }
  };

  const handleFund = async () => {
    try {
      setErrorMessage("");
      const parsedAmount = parseUnits(
        amount,
        Number(strategy.baseToken.decimals)
      );

      setFundingState("checking");
      try {
        const allowance = await checkAllowance(
          address as string,
          strategy.accountAddress as string,
          Number(parsedAmount).toString()
        );

        if (!allowance) {
          setFundingState("approving");
          try {
            await approveToken(
              strategy.accountAddress as string,
              Number(parsedAmount).toString()
            );
          } catch (error: any) {
            handleError(error);
            return;
          }
        }

        setFundingState("funding");
        await fundAccount(strategy.baseToken, Number(parsedAmount));
        setFundingState("success");
      } catch (error: any) {
        handleError(error);
      }
    } catch (error: any) {
      handleError(error);
    }
  };

  const getButtonContent = () => {
    switch (fundingState) {
      case "checking":
        return (
          <div className="flex items-center gap-2">
            <Spinner size="sm" color="white" />
            <span>Checking Allowance...</span>
          </div>
        );
      case "approving":
        return (
          <div className="flex items-center gap-2">
            <Spinner size="sm" color="white" />
            <span>Approving Token...</span>
          </div>
        );
      case "funding":
        return (
          <div className="flex items-center gap-2">
            <Spinner size="sm" color="white" />
            <span>Funding Strategy...</span>
          </div>
        );
      default:
        return "Fund Strategy";
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalContent>
        {() => (
          <>
            <ModalHeader>Fund Strategy</ModalHeader>
            <ModalBody>
              <AnimatePresence mode="wait">
                {fundingState === "success" ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="flex flex-col items-center justify-center py-8 space-y-4"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 20,
                      }}
                    >
                      <CheckCircle2 className="w-16 h-16 text-success" />
                    </motion.div>
                    <p className="text-success text-lg font-semibold">
                      Strategy Successfully Funded!
                    </p>
                    <p className="text-sm text-gray-400 text-center">
                      {amount} {strategy?.baseToken?.ticker} has been added to
                      your strategy
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <p className="text-sm text-gray-400">
                      Add funds to your strategy using{" "}
                      {strategy?.baseToken?.ticker}
                    </p>
                    <Input
                      type="number"
                      label="Amount"
                      placeholder={`Enter amount in ${strategy?.baseToken?.ticker}`}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      isDisabled={fundingState !== "idle"}
                      endContent={
                        <div className="pointer-events-none flex items-center">
                          <span className="text-default-400 text-small">
                            {strategy?.baseToken?.ticker}
                          </span>
                        </div>
                      }
                    />
                    {errorMessage && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-2 text-danger"
                      >
                        <AlertCircle size={16} />
                        <span className="text-sm">{errorMessage}</span>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </ModalBody>
            <ModalFooter>
              {fundingState === "success" ? (
                <Button
                  color="primary"
                  onPress={handleClose}
                  className="w-full"
                >
                  Close
                </Button>
              ) : (
                <>
                  <Button
                    color="danger"
                    variant="light"
                    onPress={handleClose}
                    isDisabled={fundingState !== "idle"}
                  >
                    Cancel
                  </Button>
                  <Button
                    color="primary"
                    onPress={handleFund}
                    isDisabled={!amount || fundingState !== "idle"}
                  >
                    {getButtonContent()}
                  </Button>
                </>
              )}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
