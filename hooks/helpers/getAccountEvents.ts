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

// Cache for events
const eventCache = new Map<string, any>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

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

const getAccountStrategyCreationEvents = async (
  accountProvider: DCAAccount
): Promise<StrategyCreationEvent[]> => {
  const cacheKey = getCacheKey(accountProvider.target, "creation");
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  try {
    const filter = accountProvider.filters["StrategyCreated"];
    const events = await accountProvider.queryFilter(filter);

    const results = await Promise.all(
      events.map((event: StrategyCreatedEvent.Log) =>
        buildStrategyCreationEvent(event, accountProvider)
      )
    );

    setInCache(cacheKey, results);
    return results;
  } catch (error) {
    console.error("Error fetching strategy creation events:", error);
    throw error;
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
  } catch (error) {
    console.error("Error fetching strategy execution events:", error);
    throw error;
  }
};

const getAccountStrategyExecutionEvents = async (
  accountProvider: DCAAccount
): Promise<AccountStrategyExecutionEvent[]> => {
  try {
    const events = await accountProvider.queryFilter(
      accountProvider.filters["StrategyExecuted"]
    );

    return events.map((event: StrategyExecutedEvent.Log) =>
      buildAccountStrategyExecutionEvent(event)
    );
  } catch (error) {
    console.error("Error fetching past events:", error);
    throw error;
  }
};

// Single export statement
export {
  getAccountStrategyCreationEvents,
  getAccountStrategyExecutionEvents,
  getStrategyExecutionEvents,
};
