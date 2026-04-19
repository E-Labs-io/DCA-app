/** @format */

"use client";

import React from 'react';
import { Button, Chip, Link } from '@nextui-org/react';
import { ExternalLink, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useTransactions } from '@/context/TransactionContext';

export function TransactionStatusIndicator() {
  const { transactions, getPendingCount } = useTransactions();
  const pendingCount = getPendingCount();

  const getNetworkExplorer = (network: string) => {
    const explorers: { [key: string]: string } = {
      'BASE_MAINNET': 'https://basescan.org',
      'ETH_SEPOLIA': 'https://sepolia.etherscan.io',
    };
    return explorers[network] || 'https://etherscan.io';
  };

  if (pendingCount === 0 && transactions.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {/* Pending transactions indicator */}
      {pendingCount > 0 && (
        <div className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-pulse">
          <Clock className="w-4 h-4" />
          <span className="text-sm font-medium">
            {pendingCount} transaction{pendingCount > 1 ? 's' : ''} pending...
          </span>
        </div>
      )}

      {/* Recent confirmed transactions */}
      {transactions.slice(0, 3).map((tx) => (
        tx.status === 'confirmed' && (
          <div
            key={tx.id}
            className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 max-w-xs"
          >
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">
                {tx.description}
              </div>
              <Link
                href={`${getNetworkExplorer(tx.network)}/tx/${tx.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-green-100 hover:text-white flex items-center gap-1"
              >
                View on explorer
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        )
      ))}

      {/* Failed transactions */}
      {transactions.slice(0, 2).map((tx) => (
        tx.status === 'failed' && (
          <div
            key={tx.id}
            className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 max-w-xs"
          >
            <XCircle className="w-4 h-4 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">
                {tx.description} failed
              </div>
              <div className="text-xs text-red-100">
                Click to retry
              </div>
            </div>
          </div>
        )
      ))}
    </div>
  );
}