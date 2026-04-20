/** @format */

import { type DCAAccount } from "@/types/contracts";
import {
  type StrategyCreatedEvent,
  type StrategyExecutedEvent,
} from "@/types/contracts/contracts/base/DCAAccount";
import {
  type AccountStrategyExecutionEvent,
  type StrategyCreationEvent,
} from "@/types/eventTransactions";
import {
  buildAccountStrategyExecutionEvent,
  buildStrategyCreationEvent,
} from "@/hooks/helpers/buildDataTypes";
import { ethers } from "ethers";
import { DCAAccount__factory } from "@/types/contracts";
import { dbg, dbgWarn } from '@/helpers/debug';

// Cache for events
const eventCache = new Map<string, any>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Create a dedicated provider for log queries
const getLogProvider = () => {
  // Try both possible environment variable names
  const alchemyKey =
    process.env.NEXT_PUBLIC_ALCHEMY_KEY ||
    process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
  if (!alchemyKey) {
    dbgWarn("No Alchemy key found, falling back to public Base RPC");
    return new ethers.JsonRpcProvider("https://mainnet.base.org");
  }
  dbg("[getAccountEvents] Using Alchemy provider for Base Mainnet");
  return new ethers.JsonRpcProvider(
    `https://base-mainnet.g.alchemy.com/v2/${alchemyKey}`
  );
};

const getCacheKey = (
  accountAddress: string | { toString(): string },
  eventType: string,
  strategyId?: number
) =>
  `${accountAddress.toString()}-${eventType}${
    strategyId ? `-${strategyId}` : ""
  }`;

const getFromCache = (key: string) => {
  const cached = eventCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  eventCache.delete(key);
  return null;
};

const setInCache = (key: string, data: any) => {
  eventCache.set(key, { data, timestamp: Date.now() });
};

const clearAccountCache = (accountAddress: string) => {
  const creationKey = getCacheKey(accountAddress, "creation");
  const executionKey = getCacheKey(accountAddress, "execution");
  eventCache.delete(creationKey);
  // Clear all execution caches for this account
  for (const [key] of eventCache) {
    if (key.startsWith(`${accountAddress}_execution_`)) {
      eventCache.delete(key);
    }
  }
  dbg("[getAccountEvents] Cleared cache for account:", accountAddress);
};

const getAccountStrategyCreationEvents = async (
  accountProvider: DCAAccount,
  forceRefresh: boolean = false
): Promise<StrategyCreationEvent[]> => {
  const cacheKey = getCacheKey(accountProvider.target, "creation");

  dbg("[getAccountEvents] getAccountStrategyCreationEvents called:", {
    account: accountProvider.target,
    forceRefresh,
    hasCachedData: eventCache.has(cacheKey),
  });

  if (!forceRefresh) {
    const cached = getFromCache(cacheKey);
    if (cached) {
      dbg("[getAccountEvents] Returning cached data:", {
        eventCount: cached.length,
        events: cached.map((e: { id: string; blockNumber: number }) => ({
          id: e.id,
          blockNumber: e.blockNumber,
        })),
      });
      return cached;
    }
  } else {
    dbg("[getAccountEvents] Force refresh - skipping cache");
  }

  try {
    dbg(
      "[getAccountEvents] Fetching strategy creation events for:",
      accountProvider.target
    );

    // Use dedicated provider for log queries
    const logProvider = getLogProvider();
    const contractForLogs = DCAAccount__factory.connect(
      accountProvider.target.toString(),
      logProvider
    );

    const filter = contractForLogs.filters["StrategyCreated"];
    dbg("[getAccountEvents] Using filter:", filter);

    // Get latest block to ensure we're querying up to the most recent data
    const latestBlock = await logProvider.getBlockNumber();
    dbg("[getAccountEvents] Latest block number:", latestBlock);

    const events = await contractForLogs.queryFilter(filter, 0, latestBlock);
    dbg("[getAccountEvents] Found events:", {
      eventCount: events.length,
      latestBlock,
      events: events.map((e) => ({
        blockNumber: e.blockNumber,
        transactionHash: e.transactionHash,
        strategyId: e.args[0]?.toString(),
      })),
    });

    const results = await Promise.all(
      events.map((event: StrategyCreatedEvent.Log) =>
        buildStrategyCreationEvent(event, accountProvider)
      )
    );

    dbg("[getAccountEvents] Processed results:", {
      resultCount: results.length,
      results: results.map((r) => ({
        id: r.id,
        blockNumber: r.blockNumber,
        transactionHash: r.transactionHash,
      })),
    });

    setInCache(cacheKey, results);
    return results;
  } catch (error) {
    console.error("Error fetching strategy creation events:", error);

    // Fallback: try with the original provider if Alchemy fails
    dbg("[getAccountEvents] Trying fallback with original provider...");
    try {
      const filter = accountProvider.filters["StrategyCreated"];
      const events = await accountProvider.queryFilter(filter);

      dbg("[getAccountEvents] Fallback events found:", events.length);

      const results = await Promise.all(
        events.map((event: StrategyCreatedEvent.Log) =>
          buildStrategyCreationEvent(event, accountProvider)
        )
      );

      setInCache(cacheKey, results);
      return results;
    } catch (fallbackError) {
      console.error("Fallback also failed:", fallbackError);
      // Return empty array instead of throwing to prevent app crash
      return [];
    }
  }
};

const getStrategyExecutionEvents = async (
  accountProvider: DCAAccount,
  strategyId: number
): Promise<AccountStrategyExecutionEvent[]> => {
  const cacheKey = getCacheKey(accountProvider.target, "execution", strategyId);
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  try {
    dbg(
      "[getAccountEvents] Fetching execution events for strategy:",
      strategyId
    );

    // Use dedicated provider for log queries
    const logProvider = getLogProvider();
    const contractForLogs = DCAAccount__factory.connect(
      accountProvider.target.toString(),
      logProvider
    );

    const filter = contractForLogs.filters["StrategyExecuted"];
    const events = await contractForLogs.queryFilter(filter);

    const thisStrategyEvents = events.filter(
      (event: StrategyExecutedEvent.Log) =>
        event?.args.strategyId_ === BigInt(strategyId)
    );

    const results = await Promise.all(
      thisStrategyEvents.map((event) =>
        buildAccountStrategyExecutionEvent(event)
      )
    );

    setInCache(cacheKey, results);
    return results;
  } catch (error) {
    console.error("Error fetching strategy execution events:", error);

    // Fallback: try with the original provider if Alchemy fails
    try {
      const filter = accountProvider.filters["StrategyExecuted"];
      const events = await accountProvider.queryFilter(filter);

      const thisStrategyEvents = events.filter(
        (event: StrategyExecutedEvent.Log) =>
          event?.args.strategyId_ === BigInt(strategyId)
      );

      const results = await Promise.all(
        thisStrategyEvents.map((event) =>
          buildAccountStrategyExecutionEvent(event)
        )
      );

      setInCache(cacheKey, results);
      return results;
    } catch (fallbackError) {
      console.error("Fallback also failed:", fallbackError);
      // Return empty array instead of throwing to prevent app crash
      return [];
    }
  }
};

const getAccountStrategyExecutionEvents = async (
  accountProvider: DCAAccount
): Promise<AccountStrategyExecutionEvent[]> => {
  try {
    dbg(
      "[getAccountEvents] Fetching all execution events for account:",
      accountProvider.target
    );

    // Use dedicated provider for log queries
    const logProvider = getLogProvider();
    const contractForLogs = DCAAccount__factory.connect(
      accountProvider.target.toString(),
      logProvider
    );

    const events = await contractForLogs.queryFilter(
      contractForLogs.filters["StrategyExecuted"]
    );

    return events.map((event: StrategyExecutedEvent.Log) =>
      buildAccountStrategyExecutionEvent(event)
    );
  } catch (error) {
    console.error("Error fetching past events:", error);

    // Fallback: try with the original provider
    try {
      const events = await accountProvider.queryFilter(
        accountProvider.filters["StrategyExecuted"]
      );

      return events.map((event: StrategyExecutedEvent.Log) =>
        buildAccountStrategyExecutionEvent(event)
      );
    } catch (fallbackError) {
      console.error("Fallback also failed:", fallbackError);
      // Return empty array instead of throwing to prevent app crash
      return [];
    }
  }
};

// Single export statement
export {
  getAccountStrategyCreationEvents,
  getAccountStrategyExecutionEvents,
  getStrategyExecutionEvents,
  clearAccountCache,
};
