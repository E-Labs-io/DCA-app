/** @format */

import { create } from "zustand";
import { IDCADataStructures } from "@/types/contracts/contracts/base/DCAAccount";

interface AccountState {
  accounts: `0x${string}`[];
  setAccounts: (accounts: `0x${string}`[]) => void;
  selectedAccount: string;
  setSelectedAccount: (account: string) => void;
  accountStrategies: Record<string, IDCADataStructures.StrategyStruct[]>;
  setAccountStrategies: (
    account: string,
    strategies: IDCADataStructures.StrategyStruct[]
  ) => void;
}

export const useAccountStore = create<AccountState>((set) => ({
  accounts: [],
  setAccounts: (accounts) => set({ accounts }),
  selectedAccount: "",
  setSelectedAccount: (account) => set({ selectedAccount: account }),
  accountStrategies: {},
  setAccountStrategies: (account, strategies) =>
    set((state) => ({
      accountStrategies: { ...state.accountStrategies, [account]: strategies },
    })),
}));
