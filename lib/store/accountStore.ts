/** @format */

import { create } from "zustand";
import {
  DCAAccount,
  IDCADataStructures,
} from "@/types/contracts/contracts/base/DCAAccount";
import { EthereumAddress } from "@/types/generic";

interface AccountState {
  accounts: EthereumAddress[];
  setAccounts: (accounts: EthereumAddress[]) => void;
  selectedAccount: EthereumAddress;
  setSelectedAccount: (account: string) => void;
  accountStrategies: Record<string, IDCADataStructures.StrategyStruct[]>;
  setAccountStrategies: (
    account: string,
    strategies: IDCADataStructures.StrategyStruct[]
  ) => void;
  accountInstances: Record<string, DCAAccount>;
  setAccountInstance: (account: string, instance: DCAAccount) => void;
  clearAccountInstance: (account: string) => void;
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
  accountInstances: {},
  setAccountInstance: (account, instance) =>
    set((state) => ({
      accountInstances: { ...state.accountInstances, [account]: instance },
    })),
  clearAccountInstance: (account) =>
    set((state) => {
      const { [account]: _, ...rest } = state.accountInstances;
      return { accountInstances: rest };
    }),
}));
