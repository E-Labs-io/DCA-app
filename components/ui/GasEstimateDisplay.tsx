/** @format */

"use client";

import React from 'react';
import { Card, CardBody, Chip, Spinner } from '@nextui-org/react';
import { Fuel, Zap, Clock, DollarSign } from 'lucide-react';
import { GasEstimate } from '@/hooks/useGasEstimation';

interface GasEstimateDisplayProps {
  gasEstimate: GasEstimate | null;
  isLoading?: boolean;
}

export function GasEstimateDisplay({ gasEstimate, isLoading }: GasEstimateDisplayProps) {
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardBody className="flex items-center justify-center py-4">
          <Spinner size="sm" />
          <span className="ml-2 text-sm">Estimating gas...</span>
        </CardBody>
      </Card>
    );
  }

  if (!gasEstimate) {
    return (
      <Card className="w-full">
        <CardBody className="flex items-center justify-center py-4">
          <Fuel className="w-4 h-4 text-gray-400 mr-2" />
          <span className="text-sm text-gray-400">Gas estimation unavailable</span>
        </CardBody>
      </Card>
    );
  }

  const formatGas = (gas: bigint) => {
    return (Number(gas) / 1e9).toFixed(2); // Convert to gwei
  };

  return (
    <Card className="w-full">
      <CardBody className="space-y-3">
        <div className="flex items-center gap-2">
          <Fuel className="w-4 h-4 text-blue-500" />
          <span className="font-medium text-sm">Gas Estimate</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Gas Limit</span>
              <span className="text-xs font-mono">{gasEstimate.gasLimit.toString()}</span>
            </div>

            {gasEstimate.maxFeePerGas && gasEstimate.maxPriorityFeePerGas ? (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Max Fee</span>
                  <span className="text-xs font-mono">{formatGas(gasEstimate.maxFeePerGas)} gwei</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Priority Fee</span>
                  <span className="text-xs font-mono">{formatGas(gasEstimate.maxPriorityFeePerGas)} gwei</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Gas Price</span>
                <span className="text-xs font-mono">{formatGas(gasEstimate.gasPrice)} gwei</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Cost (ETH)</span>
              <span className="text-xs font-mono">{gasEstimate.estimatedCostEth.toFixed(6)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Cost (USD)</span>
              <div className="flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-green-500" />
                <span className="text-xs font-mono text-green-600">{gasEstimate.estimatedCostUsd.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <Chip
            size="sm"
            variant="flat"
            color="success"
            startContent={<Zap className="w-3 h-3" />}
          >
            Fast
          </Chip>
          <Chip
            size="sm"
            variant="flat"
            color="warning"
            startContent={<Clock className="w-3 h-3" />}
          >
            Standard
          </Chip>
        </div>
      </CardBody>
    </Card>
  );
}