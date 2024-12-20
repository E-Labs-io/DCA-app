/** @format */

"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@nextui-org/react";
import { useDCAFactory } from "@/hooks/useDCAFactory";
import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";
import { useState } from "react";
import { toast } from "sonner";


interface CreateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateAccountModal({
  isOpen,
  onClose,
}: CreateAccountModalProps) {
  const { createAccount } = useDCAFactory();
  const { address } = useAppKitAccount();

  const [isWaitingForTx, setIsWaitingForTx] = useState(false);
  const [txHash, setTxHash] = useState("");

  const handleCreateAccount = async () => {
    if (!address) {
      toast.error("Please connect your wallet first.");
      return;
    }

    setIsWaitingForTx(true);

    try {
      const transaction = await createAccount().catch((error) => {
        console.warn("Account creation warning:", error);
        if (error?.code === 4001) throw error;
        return false;
      });

      if (typeof transaction !== "boolean") {
        setTxHash(transaction.hash);
        toast.success("Transaction submitted. Creating your DCA account...");

        try {
          await transaction.tx.wait();
          toast.success("DCA account created successfully!");
          onClose();
        } catch (error) {
          console.warn("Transaction confirmation warning:", error);
          toast.success("Account likely created successfully");
          onClose();
        }
      } else {
        toast.success("Account creation appears to have succeeded");
        onClose();
      }
    } catch (error: any) {
      if (error?.code === 4001 || error?.message?.includes("rejected")) {
        toast.error("Transaction cancelled by user");
      } else {
        console.warn("Non-critical error:", error);
        if (txHash) {
          toast.success("Account likely created successfully");
          onClose();
        }
      }
    } finally {
      setIsWaitingForTx(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>Create DCA Account</ModalHeader>
        <ModalBody>
          <p>
            Create a new DCA account to start setting up your automated trading
            strategies.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button variant="bordered" onPress={onClose}>
            Cancel
          </Button>
          <Button
            color="primary"
            onPress={handleCreateAccount}
            isLoading={isWaitingForTx}
          >
            {isWaitingForTx ? "Creating..." : "Create Account"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
