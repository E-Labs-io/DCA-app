/** @format */

import {
  APIResponse,
  HealthCheckResponse,
  AccountStatsResponse,
  ExecutionStatsResponse,
  SubscriberStatsResponse,
  DurationStatsResponse,
  StrategyStatsResponse,
  VolumeStatsResponse,
  LockedStatsResponse,
  SupportedChain,
} from "@/types";

// API Configuration
const API_BASE_URL = "http://localhost:3010";

// Generic API client helper
async function apiCall<T>(endpoint: string): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: APIResponse<T> = await response.json();

    if (result.status === "error") {
      throw new Error(result.message || "API request failed");
    }

    return result.data!;
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw error;
  }
}

// DCA Stats API Client
export class DCAStatsAPIClient {
  // Health Check
  static async healthCheck(): Promise<HealthCheckResponse> {
    return await apiCall<HealthCheckResponse>("/");
  }

  // Account Statistics
  static async getTotalAccounts(): Promise<number> {
    const data = await apiCall<AccountStatsResponse>(
      "/v1/stats/accounts/total"
    );
    return data.total;
  }

  static async getAccountsByChain(
    chain: SupportedChain
  ): Promise<AccountStatsResponse> {
    return await apiCall<AccountStatsResponse>(`/v1/stats/accounts/${chain}`);
  }

  // Execution Statistics
  static async getTotalExecutions(): Promise<number> {
    const data = await apiCall<ExecutionStatsResponse>(
      "/v1/stats/executions/total"
    );
    return data.total;
  }

  static async getExecutionsByChain(
    chain: SupportedChain
  ): Promise<ExecutionStatsResponse> {
    return await apiCall<ExecutionStatsResponse>(
      `/v1/stats/executions/${chain}`
    );
  }

  // Subscription Statistics
  static async getTotalActiveSubscribers(): Promise<number> {
    const data = await apiCall<SubscriberStatsResponse>(
      "/v1/stats/subscribers/active/total"
    );
    return data.total;
  }

  static async getActiveSubscribersByChain(
    chain: SupportedChain
  ): Promise<SubscriberStatsResponse> {
    return await apiCall<SubscriberStatsResponse>(
      `/v1/stats/subscribers/active/${chain}`
    );
  }

  static async getTotalLifetimeSubscribers(): Promise<number> {
    const data = await apiCall<SubscriberStatsResponse>(
      "/v1/stats/subscribers/lifetime/total"
    );
    return data.total;
  }

  static async getLifetimeSubscribersByChain(
    chain: SupportedChain
  ): Promise<SubscriberStatsResponse> {
    return await apiCall<SubscriberStatsResponse>(
      `/v1/stats/subscribers/lifetime/${chain}`
    );
  }

  static async getAverageSubscriptionDuration(): Promise<DurationStatsResponse> {
    return await apiCall<DurationStatsResponse>(
      "/v1/stats/subscribers/duration/average"
    );
  }

  static async getAverageSubscriptionDurationByChain(
    chain: SupportedChain
  ): Promise<DurationStatsResponse> {
    return await apiCall<DurationStatsResponse>(
      `/v1/stats/subscribers/duration/average/${chain}`
    );
  }

  // Strategy Statistics
  static async getActiveStrategiesByChain(
    chain: SupportedChain
  ): Promise<StrategyStatsResponse> {
    return await apiCall<StrategyStatsResponse>(
      `/v1/stats/strategies/active/${chain}`
    );
  }

  // Volume Statistics
  static async getTotalVolume(): Promise<string> {
    const data = await apiCall<VolumeStatsResponse>("/v1/stats/volume/total");
    return data.total;
  }

  static async getVolumeByChain(
    chain: SupportedChain
  ): Promise<VolumeStatsResponse> {
    return await apiCall<VolumeStatsResponse>(`/v1/stats/volume/${chain}`);
  }

  // Locked Amount Statistics
  static async getTotalLockedAmount(): Promise<string> {
    const data = await apiCall<LockedStatsResponse>("/v1/stats/locked/total");
    return data.total;
  }

  static async getLockedAmountByChain(
    chain: SupportedChain
  ): Promise<LockedStatsResponse> {
    return await apiCall<LockedStatsResponse>(`/v1/stats/locked/${chain}`);
  }
}
