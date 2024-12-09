import { create } from 'zustand';

interface AccountState {
  accounts: `0x${string}`[];
  setAccounts: (accounts: `0x${string}`[]) => void;
  selectedAccount: string;
  setSelectedAccount: (account: string) => void;
}

export const useAccountStore = create<AccountState>((set) => ({
  accounts: [],
  setAccounts: (accounts) => set({ accounts }),
  selectedAccount: '',
  setSelectedAccount: (account) => set({ selectedAccount: account }),
}));