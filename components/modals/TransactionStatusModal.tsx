/** @format */

"use client";

import React from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Progress,
  Chip,
  Link,
} from '@nextui-org/react';
import { ExternalLink, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { useTransactions } from '@/context/TransactionContext';
import { formatDistanceToNow } from 'date-fns';

interface TransactionStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TransactionStatusModal({ isOpen, onClose }: TransactionStatusModalProps) {
  const { transactions, clearTransactions } = useTransactions();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'failed':
        return 'danger';
      case 'pending':
        return 'primary';
      default:
        return 'default';
    }
  };

  const getExplorerUrl = (hash: string, network: string) => {
    const baseUrls: { [key: string]: string } = {
      'BASE_MAINNET': 'https://basescan.org',
      'ETH_SEPOLIA': 'https://sepolia.etherscan.io',
    };

    const baseUrl = baseUrls[network] || 'https://etherscan.io';
    return `${baseUrl}/tx/${hash}`;
  };

  const formatGasCost = (gasUsed?: bigint, gasPrice?: bigint) => {
    if (!gasUsed || !gasPrice) return null;

    const costWei = gasUsed * gasPrice;
    const costEth = Number(costWei) / 1e18;

    // Rough USD conversion (this should be fetched from an API in production)
    const ethPrice = 2500; // Mock price
    const costUsd = costEth * ethPrice;

    return {
      eth: costEth.toFixed(6),
      usd: costUsd.toFixed(2),
    };
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Transaction History
        </ModalHeader>

        <ModalBody>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No transactions yet
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {transactions.map((tx) => {
                const gasCost = formatGasCost(tx.gasUsed, tx.gasPrice);

                return (
                  <div
                    key={tx.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(tx.status)}
                        <span className="font-medium">{tx.description}</span>
                      </div>
                      <Chip
                        color={getStatusColor(tx.status)}
                        variant="flat"
                        size="sm"
                      >
                        {tx.status}
                      </Chip>
                    </div>

                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <div className="flex justify-between">
                        <span>Time:</span>
                        <span>{formatDistanceToNow(tx.timestamp, { addSuffix: true })}</span>
                      </div>

                      {tx.value && tx.value > 0n && (
                        <div className="flex justify-between">
                          <span>Value:</span>
                          <span>{Number(tx.value) / 1e18} ETH</span>
                        </div>
                      )}

                      {gasCost && (
                        <div className="flex justify-between">
                          <span>Cost:</span>
                          <span>{gasCost.eth} ETH (~${gasCost.usd})</span>
                        </div>
                      )}

                      {tx.blockNumber && (
                        <div className="flex justify-between">
                          <span>Block:</span>
                          <span>{tx.blockNumber}</span>
                        </div>
                      )}
                    </div>

                    {tx.hash && (
                      <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                        <Link
                          href={getExplorerUrl(tx.hash, tx.network)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-600 text-sm flex items-center gap-1"
                        >
                          View on Explorer
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ModalBody>

        <ModalFooter>
          <Button
            variant="light"
            onPress={clearTransactions}
            disabled={transactions.length === 0}
          >
            Clear History
          </Button>
          <Button onPress={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}