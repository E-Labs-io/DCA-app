import React, { useState } from "react";
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

interface FundUnfundAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokens: { address: string; label: string }[];
  actionType: "fund" | "unfund";
}

export function FundUnfundAccountModal({
  isOpen,
  onClose,
  tokens,
  actionType,
}: FundUnfundAccountModalProps) {
  const [selectedToken, setSelectedToken] = useState<string>("");
  const [amount, setAmount] = useState<string>("");

  const handleAction = () => {
    // Implement the fund or unfund logic here
    console.log(`${actionType}ing ${amount} of ${selectedToken}`);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>{actionType === "fund" ? "Fund Account" : "Unfund Account"}</ModalHeader>
        <ModalBody>
          <Select
            label="Select Token"
            placeholder="Choose a token"
            onChange={(e) => setSelectedToken(e.target.value)}
          >
            {tokens.map((token) => (
              <SelectItem key={token.address} value={token.address}>
                {token.label}
              </SelectItem>
            ))}
          </Select>
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
            {actionType === "fund" ? "Fund" : "Unfund"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
} 