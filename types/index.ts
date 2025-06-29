/** @format */

export * from "./Chains";
export * from "./generic";
export * from "./contracts";
export * from "./reinvest";
export * from "./eventTransactions";

// DCA Stats API Types
export interface APIResponse<T = any> {
  status: "success" | "error";
  data?: T;
  message?: string;
  timestamp: string;
}

export interface HealthCheckResponse {
  status: "ok";
  timestamp: string;
  message: "DCA API Server is running";
}

export interface AccountStatsResponse {
  total: number;
  chain?: string;
}

export interface ExecutionStatsResponse {
  total: number;
  chain?: string;
}

export interface SubscriberStatsResponse {
  total: number;
  chain?: string;
}

export interface DurationStatsResponse {
  averageDurationSeconds: number;
  averageDurationHours: number;
  averageDurationDays: number;
  chain?: string;
}

export interface StrategyStatsResponse {
  total: number;
  chain: string;
}

export interface VolumeStatsResponse {
  total: string;
  chain?: string;
}

export interface LockedStatsResponse {
  total: string;
  chain?: string;
}

export type SupportedChain =
  | "ETH_SEPOLIA"
  | "ARB_GOERLI"
  | "OPT_GOERLI"
  | "MATIC_MUMBAI"
  | "BASE_SEPOLIA"
  | "BASE_MAINNET";

export interface GlobalDCAStats {
  totalAccounts: number;
  totalExecutions: number;
  totalActiveSubscribers: number;
  totalLifetimeSubscribers: number;
  totalVolume: string;
  totalLockedAmount: string;
  averageSubscriptionDuration: DurationStatsResponse;
}

export interface ChainDCAStats {
  chain: SupportedChain;
  accounts: number;
  executions: number;
  activeSubscribers: number;
  lifetimeSubscribers: number;
  activeStrategies: number;
  volume: string;
  lockedAmount: string;
  averageSubscriptionDuration: DurationStatsResponse;
}
