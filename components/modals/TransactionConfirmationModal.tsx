/** @format */

"use client";

import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Chip,
  RadioGroup,
  Radio,
} from '@nextui-org/react';
import { AlertTriangle, Zap, Clock, Turtle } from 'lucide-react';
import { GasEstimateDisplay } from '../ui/GasEstimateDisplay';
import { useGasEstimation } from '@/hooks/useGasEstimation';

interface TransactionConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (gasSpeed?: 'slow' | 'standard' | 'fast') => void;
  title: string;
  description: string;
  txFunction: () => Promise<any>;
  confirmButtonText?: string;
  danger?: boolean;
}

export function TransactionConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  txFunction,
  confirmButtonText = "Confirm Transaction",
  danger = false,
}: TransactionConfirmationModalProps) {
  const { estimateGas, getGasPriceOptions, isEstimating } = useGasEstimation();
  const [gasEstimate, setGasEstimate] = useState<any>(null);
  const [selectedSpeed, setSelectedSpeed] = useState<'slow' | 'standard' | 'fast'>('standard');
  const [gasOptions, setGasOptions] = useState<any>(null);

  useEffect(() => {
    if (isOpen && txFunction) {
      estimateGas(txFunction).then(setGasEstimate);
      getGasPriceOptions().then(setGasOptions);
    }
  }, [isOpen, txFunction, estimateGas, getGasPriceOptions]);

  const handleConfirm = () => {
    onConfirm(selectedSpeed);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <AlertTriangle className={`w-5 h-5 ${danger ? 'text-red-500' : 'text-blue-500'}`} />
          {title}
        </ModalHeader>

        <ModalBody className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            {description}
          </p>

          <GasEstimateDisplay gasEstimate={gasEstimate} isLoading={isEstimating} />

          {gasOptions && (
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Transaction Speed</h4>
              <RadioGroup
                value={selectedSpeed}
                onValueChange={(value) => setSelectedSpeed(value as 'slow' | 'standard' | 'fast')}
                orientation="horizontal"
                className="gap-4"
              >
                <Radio value="slow" className="flex-1">
                  <div className="flex items-center gap-2">
                    <Turtle className="w-4 h-4 text-gray-500" />
                    <div>
                      <div className="text-sm font-medium">Slow</div>
                      <div className="text-xs text-gray-500">Save on fees</div>
                    </div>
                  </div>
                </Radio>

                <Radio value="standard" className="flex-1">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <div>
                      <div className="text-sm font-medium">Standard</div>
                      <div className="text-xs text-gray-500">Balanced</div>
                    </div>
                  </div>
                </Radio>

                <Radio value="fast" className="flex-1">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-green-500" />
                    <div>
                      <div className="text-sm font-medium">Fast</div>
                      <div className="text-xs text-gray-500">Priority</div>
                    </div>
                  </div>
                </Radio>
              </RadioGroup>
            </div>
          )}

          {danger && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-sm font-medium text-red-800 dark:text-red-300">
                  This action cannot be undone
                </span>
              </div>
              <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                Please review the details carefully before proceeding.
              </p>
            </div>
          )}
        </ModalBody>

        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            Cancel
          </Button>
          <Button
            color={danger ? "danger" : "primary"}
            onPress={handleConfirm}
            isLoading={isEstimating}
          >
            {confirmButtonText}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}