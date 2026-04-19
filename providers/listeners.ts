/** @format */

import { DCAAccount, DCAFactory } from "@/types/contracts";
import { EthereumAddress } from "@/types/generic";
import { AccountCreatedEvent } from "@/types/contracts/contracts/base/DCAFactory";
import { dbg, dbgWarn } from '@/helpers/debug';

const listenForNewAccount = (
  factoryContract: DCAFactory,
  userAddress: string,
  callBack: (account: string) => Promise<void>
) => {
  try {
    // Create filter for AccountCreated events where owner is the userAddress
    const filter = factoryContract.filters.AccountCreated(userAddress);
    dbg("[listeners] listenForNewAccount - Setting up event filter");

    // Listen for the filtered events - this will persist and listen for ALL matching events
    factoryContract.on(
      filter,
      (owner: string, dcaAccount: string, event: AccountCreatedEvent.Log) => {
        dbg(
          "[listeners] listenForNewAccount Triggered",
          owner,
          dcaAccount
        );
        // Double check the owner matches our user (redundant but safe)
        if (owner.toLowerCase() === userAddress.toLowerCase()) {
          callBack(dcaAccount);
        }
      }
    );

    dbg(
      "[listeners] listenForNewAccount - Event listener setup successful"
    );

    // Return cleanup function - only used when we need to stop listening
    return () => {
      try {
        factoryContract.off(filter, () => {});
      } catch (error) {
        dbgWarn(
          "[listeners] Error cleaning up new account listener:",
          error
        );
      }
    };
  } catch (error) {
    dbgWarn(
      "[listeners] listenForNewAccount - Event filters not supported by this provider:",
      error
    );
    dbgWarn(
      "[listeners] Real-time account creation notifications will be disabled. You may need to refresh to see new accounts."
    );

    // Return a no-op cleanup function
    return () => {};
  }
};

const checkEthNewFilterSupport = async (provider: any): Promise<boolean> => {
  try {
    // Try to call eth_newFilter with a simple filter to test support
    const testFilter = {
      fromBlock: "latest",
      toBlock: "latest",
      topics: [],
    };
    await provider.send("eth_newFilter", [testFilter]);
    return true;
  } catch (error: any) {
    if (error.code === -32601 || error.message?.includes("not supported")) {
      return false;
    }
    // Other errors might be temporary, assume support exists
    return true;
  }
};

const listenForNewStrategy = async (
  accountContract: DCAAccount,
  callBack: (strategyId: number, account: string) => void
) => {
  dbg(
    "[listeners] listenForNewStrategy on account",
    accountContract.target
  );

  // Check if eth_newFilter is supported
  const supportsEthNewFilter = await checkEthNewFilterSupport(
    accountContract.provider
  );

  if (supportsEthNewFilter) {
    try {
      // Create filter for StrategyCreated events
      const filter = accountContract.filters.StrategyCreated();

      // Listen for the filtered events - this will persist and listen for ALL matching events
      accountContract.on(filter, (strategyId_: bigint, event: any) => {
        dbg(
          "[listeners] listenForNewStrategy Triggered",
          strategyId_,
          accountContract.target
        );
        callBack(Number(strategyId_), accountContract.target as string);
      });

      dbg(
        "[listeners] listenForNewStrategy - Event listener setup successful"
      );

      // Return cleanup function - only used when we need to stop listening
      return () => {
        try {
          accountContract.off(filter, () => {});
        } catch (error) {
          dbgWarn(
            "[listeners] Error cleaning up new strategy listener:",
            error
          );
        }
      };
    } catch (error) {
      dbgWarn(
        "[listeners] listenForNewStrategy - Unexpected error setting up events:",
        error
      );
      // Fall through to polling
    }
  }

  // Use polling fallback for providers that don't support eth_newFilter
  dbgWarn(
    "[listeners] eth_newFilter not supported, using polling fallback for account:",
    accountContract.target
  );

  const pollInterval = 10000; // Poll every 10 seconds for better responsiveness
  let lastBlockNumber = 0;

  // Get current block to start from
  try {
    lastBlockNumber = await accountContract.provider.getBlockNumber();
  } catch (error) {
    dbgWarn("[listeners] Error getting initial block number:", error);
  }

  const filter = accountContract.filters.StrategyCreated();

  const pollForEvents = async () => {
    try {
      const currentBlock = await accountContract.provider.getBlockNumber();
      if (currentBlock > lastBlockNumber) {
        const events = await accountContract.queryFilter(
          filter,
          lastBlockNumber + 1,
          currentBlock
        );

        events.forEach((event: any) => {
          if (event.args && event.args.length > 0) {
            const strategyId = event.args[0];
            dbg(
              "[listeners] Polling detected new strategy:",
              Number(strategyId),
              accountContract.target
            );
            callBack(Number(strategyId), accountContract.target as string);
          }
        });

        lastBlockNumber = currentBlock;
      }
    } catch (pollError) {
      dbgWarn("[listeners] Polling error:", pollError);
    }
  };

  // Start polling
  const intervalId = setInterval(pollForEvents, pollInterval);

  dbg(
    "[listeners] Polling fallback activated for new strategies (10s interval)"
  );

  // Return cleanup function
  return () => {
    clearInterval(intervalId);
    dbg("[listeners] Polling cleanup completed");
  };
};

const listenForStrategyExecution = (
  accountContract: DCAAccount,
  callBack: (strategyId: number, amountIn: number) => void
) => {
  try {
    dbg(
      "[listeners] listenForStrategyExecution on account",
      accountContract.target
    );
    const filter = accountContract.filters.StrategyExecuted();

    accountContract.on(
      filter,
      (strategyId_: bigint, amountIn_: bigint, reInvested_: boolean) => {
        dbg(
          "[listeners] listenForStrategyExecution Triggered",
          strategyId_,
          amountIn_,
          reInvested_
        );
        callBack(Number(strategyId_), Number(amountIn_));
      }
    );

    dbg(
      "[listeners] listenForStrategyExecution - Event listener setup successful"
    );

    return () => {
      try {
        accountContract.off(filter, () => {});
      } catch (error) {
        dbgWarn(
          "[listeners] Error cleaning up strategy execution listener:",
          error
        );
      }
    };
  } catch (error) {
    dbgWarn(
      "[listeners] listenForStrategyExecution - Event filters not supported:",
      error
    );
    dbgWarn(
      "[listeners] Real-time execution notifications will be disabled for account:",
      accountContract.target
    );

    return () => {};
  }
};

const listenForSubscription = async (
  accountContract: DCAAccount,
  callBack: (strategyId: number, active: boolean, dcaAccount: string) => void
) => {
  dbg(
    "[listeners] listenForSubscription on account",
    accountContract.target
  );

  // Check if eth_newFilter is supported
  const supportsEthNewFilter = await checkEthNewFilterSupport(
    accountContract.provider
  );

  if (supportsEthNewFilter) {
    try {
      const filterA = accountContract.filters.StrategySubscription();
      accountContract.on(filterA, (event: any) => {
        const [strategyId_, executor_] = event.args;
        dbg("[listeners] listenForSubscription Triggered", strategyId_);
        callBack(Number(strategyId_), true, accountContract.target as string);
      });

      const filterB = accountContract.filters.StrategyUnsubscription();
      accountContract.on(filterB, (event: any) => {
        const [strategyId_] = event.args;
        dbg(
          "[listeners] listenForSubscription UnSubscribed",
          strategyId_
        );
        callBack(Number(strategyId_), false, accountContract.target as string);
      });

      dbg(
        "[listeners] listenForSubscription - Event listeners setup successful"
      );

      // Add a cleanup function
      return () => {
        try {
          accountContract.off(filterA, () => {});
          accountContract.off(filterB, () => {});
        } catch (error) {
          dbgWarn(
            "[listeners] Error cleaning up subscription listeners:",
            error
          );
        }
      };
    } catch (error) {
      dbgWarn(
        "[listeners] listenForSubscription - Unexpected error setting up events:",
        error
      );
      // Fall through to polling
    }
  }

  // Use polling fallback
  dbgWarn(
    "[listeners] eth_newFilter not supported, using polling fallback for subscriptions on account:",
    accountContract.target
  );

  const pollInterval = 10000; // Poll every 10 seconds
  let lastBlockNumber = 0;

  // Get current block to start from
  try {
    lastBlockNumber = await accountContract.provider.getBlockNumber();
  } catch (error) {
    dbgWarn("[listeners] Error getting initial block number:", error);
  }

  const pollForEvents = async () => {
    try {
      const currentBlock = await accountContract.provider.getBlockNumber();
      if (currentBlock > lastBlockNumber) {
        const [subscriptionEvents, unsubscriptionEvents] = await Promise.all([
          accountContract.queryFilter(
            accountContract.filters.StrategySubscription(),
            lastBlockNumber + 1,
            currentBlock
          ),
          accountContract.queryFilter(
            accountContract.filters.StrategyUnsubscription(),
            lastBlockNumber + 1,
            currentBlock
          ),
        ]);

        subscriptionEvents.forEach((event: any) => {
          if (event.args && event.args.length > 0) {
            const strategyId = event.args[0];
            dbg(
              "[listeners] Polling detected subscription:",
              Number(strategyId)
            );
            callBack(
              Number(strategyId),
              true,
              accountContract.target as string
            );
          }
        });

        unsubscriptionEvents.forEach((event: any) => {
          if (event.args && event.args.length > 0) {
            const strategyId = event.args[0];
            dbg(
              "[listeners] Polling detected unsubscription:",
              Number(strategyId)
            );
            callBack(
              Number(strategyId),
              false,
              accountContract.target as string
            );
          }
        });

        lastBlockNumber = currentBlock;
      }
    } catch (pollError) {
      dbgWarn("[listeners] Subscription polling error:", pollError);
    }
  };

  // Start polling
  const intervalId = setInterval(pollForEvents, pollInterval);

  dbg(
    "[listeners] Polling fallback activated for subscriptions (10s interval)"
  );

  return () => {
    clearInterval(intervalId);
    dbg("[listeners] Subscription polling cleanup completed");
  };
};

export {
  listenForNewAccount,
  listenForNewStrategy,
  listenForStrategyExecution,
  listenForSubscription,
};
