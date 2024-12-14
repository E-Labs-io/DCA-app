"use client";

import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@nextui-org/react";
import { formatDistanceToNow } from "date-fns";
import { useTokenFormatter } from "@/hooks/useTokenFormatter";
import { IDCADataStructures } from "@/types/contracts/contracts/base/DCAAccount";

interface ExecutionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  strategy: IDCADataStructures.StrategyStruct;
  executions: {
    timestamp: number;
    amount: bigint;
    success: boolean;
  }[];
}

export function ExecutionHistoryModal({
  isOpen,
  onClose,
  strategy,
  executions,
}: ExecutionHistoryModalProps) {
  const { formatTokenAmount } = useTokenFormatter();

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalContent>
        <ModalHeader>Execution History</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            {executions.map((execution, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-4 bg-gray-800 rounded-lg"
              >
                <div>
                  <p className="text-sm text-gray-400">
                    {formatDistanceToNow(execution.timestamp * 1000, { addSuffix: true })}
                  </p>
                  <p className="font-medium">
                    Amount: {formatTokenAmount(execution.amount, strategy.baseToken)}
                  </p>
                </div>
                <div>
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      execution.success ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
                    }`}
                  >
                    {execution.success ? "Success" : "Failed"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" variant="light" onPress={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}