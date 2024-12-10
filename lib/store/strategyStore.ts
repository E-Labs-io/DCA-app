/** @format */

import create from "zustand";
import { IDCADataStructures } from "@/types/contracts/contracts/base/DCAAccount";

export interface StrategyState {
  strategies: IDCADataStructures.StrategyStruct[];
  setStrategies: (strategies: IDCADataStructures.StrategyStruct[]) => void;
  addStrategy: (strategy: IDCADataStructures.StrategyStruct) => void;
  updateStrategy: (strategyId: string, updatedData: Partial<IDCADataStructures.StrategyStruct>) => void;
  clearStrategies: () => void;
  searchStrategies: (criteria: { id?: string; isActive?: boolean }) => IDCADataStructures.StrategyStruct[];
}

export const useStrategyStore = create<StrategyState>((set, get) => ({
  strategies: [],
  setStrategies: (strategies) => set({ strategies }),
  addStrategy: (strategy) =>
    set((state) => ({ strategies: [...state.strategies, strategy] })),
  updateStrategy: (strategyId, updatedData) =>
    set((state) => ({
      strategies: state.strategies.map((strategy) =>
        strategy.strategyId === strategyId ? { ...strategy, ...updatedData } : strategy
      ),
    })),
  clearStrategies: () => set({ strategies: [] }),
  searchStrategies: ({ id, isActive }) =>
    get().strategies.filter((strategy) => {
      const matchesId = id ? strategy.strategyId === id : true;
      const matchesActive = isActive !== undefined ? strategy.active === isActive : true;
      return matchesId && matchesActive;
    }),
}));
