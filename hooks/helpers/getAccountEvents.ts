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
import { dbg, dbgWarn } from "@/helpers/debug";

// Cache for events
const eventCache = new Map<string, any>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Historical log scans run on public RPCs, resolved from the chain the
// account contract actually lives on. The old getLogProvider was
// hardcoded to Base MAINNET, so on Base Sepolia every scan queried the
// wrong chain and returned zero events (no executions, epoch-1970
// "last execution" everywhere). Wallet RPCs can't serve these scans
// (most reject wide eth_getLogs), and the Alchemy free tier caps the
// range at 10 blocks — public endpoints allow 10,000.
const LOG_SCAN_CHAINS: Record<number, { rpc: string; fromBlock: number }> = {
  // fromBlock = DCAFactory deployment; account contracts can't pre-date it
  8453: { rpc: "https://mainnet.base.org", fromBlock: 31946776 },
  84532: { rpc: "https://sepolia.base.org", fromBlock: 45515200 }, // V0.9 #2
  11155111: {
    rpc: "https://ethereum-sepolia-rpc.publicnode.com",
    fromBlock: 7239389, // legacy
  },
};

const PUBLIC_RPC_RANGE_LIMIT = 10_000;

const getLogContract = async (accountProvider: DCAAccount) => {
  const network = await accountProvider.runner?.provider?.getNetwork();
  const config = network ? LOG_SCAN_CHAINS[Number(network.chainId)] : undefined;
  if (!config) {
    dbgWarn(
      "[getAccountEvents] No public log RPC for chain",
      network?.chainId?.toString(),
    );
    return null;
  }
  const logProvider = new ethers.JsonRpcProvider(config.rpc);
  return {
    contract: DCAAccount__factory.connect(
      accountProvider.target.toString(),
      logProvider,
    ),
    provider: logProvider,
    fromBlock: config.fromBlock,
  };
};

const queryFilterChunked = async <T>(
  query: (fromBlock: number, toBlock: number) => Promise<T[]>,
  fromBlock: number,
  toBlock: number,
): Promise<T[]> => {
  const events: T[] = [];
  for (
    let start = fromBlock;
    start <= toBlock;
    start += PUBLIC_RPC_RANGE_LIMIT
  ) {
    const end = Math.min(start + PUBLIC_RPC_RANGE_LIMIT - 1, toBlock);
    events.push(...(await query(start, end)));
  }
  return events;
};

const getCacheKey = (
  accountAddress: string | { toString(): string },
  eventType: string,
  strategyId?: number,
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
  eventCache.delete(creationKey);
  // Clear all execution caches for this account. Keys are built with
  // "-" separators (see getCacheKey) — the old check used "_" and never
  // matched, so stale execution data survived every refresh.
  for (const [key] of eventCache) {
    if (key.startsWith(`${accountAddress}-execution`)) {
      eventCache.delete(key);
    }
  }
  dbg("[getAccountEvents] Cleared cache for account:", accountAddress);
};

const getAccountStrategyCreationEvents = async (
  accountProvider: DCAAccount,
  forceRefresh: boolean = false,
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
      accountProvider.target,
    );

    // Use dedicated provider for log queries
    const logCtx = await getLogContract(accountProvider);
    if (!logCtx) throw new Error("No public log RPC for active chain");
    const { contract: contractForLogs, provider: logProvider } = logCtx;

    const filter = contractForLogs.filters["StrategyCreated"];
    dbg("[getAccountEvents] Using filter:", filter);

    // Get latest block to ensure we're querying up to the most recent data
    const latestBlock = await logProvider.getBlockNumber();
    dbg("[getAccountEvents] Latest block number:", latestBlock);

    const events = await queryFilterChunked(
      (from, to) => contractForLogs.queryFilter(filter, from, to),
      logCtx.fromBlock,
      latestBlock,
    );
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
        buildStrategyCreationEvent(event, accountProvider),
      ),
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
          buildStrategyCreationEvent(event, accountProvider),
        ),
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
  strategyId: number,
): Promise<AccountStrategyExecutionEvent[]> => {
  const cacheKey = getCacheKey(accountProvider.target, "execution", strategyId);
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  try {
    dbg(
      "[getAccountEvents] Fetching execution events for strategy:",
      strategyId,
    );

    // Use dedicated provider for log queries
    const logCtx = await getLogContract(accountProvider);
    if (!logCtx) throw new Error("No public log RPC for active chain");
    const { contract: contractForLogs, provider: logProvider } = logCtx;

    const filter = contractForLogs.filters["StrategyExecuted"];
    const latestBlock = await logProvider.getBlockNumber();
    const events = await queryFilterChunked(
      (from, to) => contractForLogs.queryFilter(filter, from, to),
      logCtx.fromBlock,
      latestBlock,
    );

    const thisStrategyEvents = events.filter(
      (event: StrategyExecutedEvent.Log) =>
        event?.args.strategyId_ === BigInt(strategyId),
    );

    const results = await Promise.all(
      thisStrategyEvents.map((event) =>
        buildAccountStrategyExecutionEvent(event),
      ),
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
          event?.args.strategyId_ === BigInt(strategyId),
      );

      const results = await Promise.all(
        thisStrategyEvents.map((event) =>
          buildAccountStrategyExecutionEvent(event),
        ),
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
  accountProvider: DCAAccount,
): Promise<AccountStrategyExecutionEvent[]> => {
  try {
    dbg(
      "[getAccountEvents] Fetching all execution events for account:",
      accountProvider.target,
    );

    // Use dedicated provider for log queries
    const logCtx = await getLogContract(accountProvider);
    if (!logCtx) throw new Error("No public log RPC for active chain");
    const { contract: contractForLogs, provider: logProvider } = logCtx;

    const filter = contractForLogs.filters["StrategyExecuted"];
    const latestBlock = await logProvider.getBlockNumber();
    const events = await queryFilterChunked(
      (from, to) => contractForLogs.queryFilter(filter, from, to),
      logCtx.fromBlock,
      latestBlock,
    );

    return events.map((event: StrategyExecutedEvent.Log) =>
      buildAccountStrategyExecutionEvent(event),
    );
  } catch (error) {
    console.error("Error fetching past events:", error);

    // Fallback: try with the original provider
    try {
      const events = await accountProvider.queryFilter(
        accountProvider.filters["StrategyExecuted"],
      );

      return events.map((event: StrategyExecutedEvent.Log) =>
        buildAccountStrategyExecutionEvent(event),
      );
    } catch (fallbackError) {
      console.error("Fallback also failed:", fallbackError);
      // Return empty array instead of throwing to prevent app crash
      return [];
    }
  }
};

// The StrategyExecuted event only carries amountIn — the target tokens
// actually received exist only as the ERC-20 Transfer log inside the
// execution transaction's receipt. Receipts are immutable, so results
// cache for the session.
const ERC20_TRANSFER_TOPIC = ethers.id("Transfer(address,address,uint256)");
const amountOutCache = new Map<string, bigint>();

const getExecutionAmountOut = async (
  accountProvider: DCAAccount,
  transactionHash: string,
  targetTokenAddress: string,
  accountAddress: string
): Promise<bigint | null> => {
  const cacheKey =
    `${transactionHash}-${targetTokenAddress}-${accountAddress}`.toLowerCase();
  const cached = amountOutCache.get(cacheKey);
  if (cached !== undefined) return cached;

  try {
    const logCtx = await getLogContract(accountProvider);
    const provider =
      logCtx?.provider ??
      (accountProvider.runner?.provider as ethers.Provider | undefined);
    if (!provider) return null;

    const receipt = await provider.getTransactionReceipt(transactionHash);
    if (!receipt) return null;

    let total = 0n;
    for (const log of receipt.logs) {
      if (log.address.toLowerCase() !== targetTokenAddress.toLowerCase())
        continue;
      if (log.topics[0] !== ERC20_TRANSFER_TOPIC) continue;
      const to = `0x${log.topics[2].slice(26)}`;
      if (to.toLowerCase() !== accountAddress.toString().toLowerCase())
        continue;
      total += BigInt(log.data);
    }

    amountOutCache.set(cacheKey, total);
    return total;
  } catch (error) {
    console.error("Error reading execution receipt:", error);
    return null;
  }
};

// Single export statement
export {
  getAccountStrategyCreationEvents,
  getAccountStrategyExecutionEvents,
  getStrategyExecutionEvents,
  getExecutionAmountOut,
  clearAccountCache,
};
