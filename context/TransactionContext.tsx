/** @format */

"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { toast } from 'sonner';

export interface Transaction {
  id: string;
  hash: string;
  description: string;
  status: 'pending' | 'confirmed' | 'failed';
  blockNumber?: number;
  gasUsed?: bigint;
  gasPrice?: bigint;
  value?: bigint;
  timestamp: number;
  network: string;
  explorerUrl?: string;
}

interface TransactionContextType {
  transactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, 'id' | 'timestamp'>) => string;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  getTransaction: (id: string) => Transaction | undefined;
  clearTransactions: () => void;
  getPendingCount: () => number;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export function TransactionProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const addTransaction = useCallback((tx: Omit<Transaction, 'id' | 'timestamp'>): string => {
    const id = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newTx: Transaction = {
      ...tx,
      id,
      timestamp: Date.now(),
    };

    setTransactions(prev => [newTx, ...prev]);
    return id;
  }, []);

  const updateTransaction = useCallback((id: string, updates: Partial<Transaction>) => {
    setTransactions(prev =>
      prev.map(tx =>
        tx.id === id ? { ...tx, ...updates } : tx
      )
    );
  }, []);

  const getTransaction = useCallback((id: string) => {
    return transactions.find(tx => tx.id === id);
  }, [transactions]);

  const clearTransactions = useCallback(() => {
    setTransactions([]);
  }, []);

  const getPendingCount = useCallback(() => {
    return transactions.filter(tx => tx.status === 'pending').length;
  }, [transactions]);

  const value: TransactionContextType = {
    transactions,
    addTransaction,
    updateTransaction,
    getTransaction,
    clearTransactions,
    getPendingCount,
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions() {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
}