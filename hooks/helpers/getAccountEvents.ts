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

const getAccountStrategyCreationEvents = async (
  accountProvider: DCAAccount
): Promise<StrategyCreationEvent[]> => {
  try {
    // Fetch events from the contract. You can also specify a range of blocks here.

    const events = await accountProvider.queryFilter(
      accountProvider.filters["StrategyCreated"]
    );

    // Process the filtered events
    return events.map((event: StrategyCreatedEvent.Log) =>
      buildStrategyCreationEvent(event, accountProvider)
    );
  } catch (error) {
    console.error("Error fetching past events:", error);
    throw error;
  }
};

const getAccountStrategyExecutionEvents = async (
  accountProvider: DCAAccount
): Promise<AccountStrategyExecutionEvent[]> => {
  try {
    // Fetch events from the contract. You can also specify a range of blocks here.
    const events = await accountProvider.queryFilter(
      accountProvider.filters["StrategyExecuted"]
    );

    // Process the filtered events
    return events.map((event: StrategyExecutedEvent.Log) =>
      buildAccountStrategyExecutionEvent(event)
    );
  } catch (error) {
    console.error("Error fetching past events:", error);
    throw error;
  }
};

const getStrategyExecutionEvents = async (
  accountProvider: DCAAccount,
  strategyId: number
): Promise<AccountStrategyExecutionEvent[]> => {
  try {
    // Fetch events from the contract, filtering by strategy ID
    const events = await accountProvider.queryFilter(
      accountProvider.filters["StrategyExecuted"]
    );

    const thisStrategyEvents = events.filter(
      (event: StrategyExecutedEvent.Log) => {
        if (event?.args.strategyId_ === BigInt(strategyId)) return event;
      }
    );
    return thisStrategyEvents.map((event) =>
      buildAccountStrategyExecutionEvent(event)
    );
  } catch (error) {
    console.error("Error fetching past events:", error);
    throw error;
  }
};

export {
  getAccountStrategyCreationEvents,
  getAccountStrategyExecutionEvents,
  getStrategyExecutionEvents,
};
