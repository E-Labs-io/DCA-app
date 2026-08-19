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
import { useDCAProvider } from "@/providers/DCAStatsProvider";
import { useAppKitAccount } from "@reown/appkit/react";
import { useState } from "react";
import { toast } from "sonner";
import { isUserRejection } from "@/helpers/walletErrors";

interface CreateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateAccountModal({
  isOpen,
  onClose,
}: CreateAccountModalProps) {
  const { createAccount } = useDCAFactory();
  const { refreshUserAccounts } = useDCAProvider();
  const { address } = useAppKitAccount();

  const [isWaitingForTx, setIsWaitingForTx] = useState(false);

  const handleCreateAccount = async () => {
    if (!address) {
      toast.error("Please connect your wallet first.");
      return;
    }

    setIsWaitingForTx(true);

    try {
      await createAccount();
      toast.success("DCA account created");

      // The factory event subscription runs over the wallet's RPC and
      // fails silently on most wallets, so pull the fresh account list
      // explicitly instead of waiting for a listener that may never fire.
      await refreshUserAccounts();
      onClose();
    } catch (error: any) {
      if (isUserRejection(error)) {
        toast.error("Transaction cancelled");
      } else {
        console.error("Account creation failed:", error);
        toast.error("Account creation failed");
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
