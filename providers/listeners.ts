/** @format */

import { DCAAccount, DCAFactory } from "@/types/contracts";
import { EthereumAddress } from "@/types/generic";
import { AccountCreatedEvent } from "@/types/contracts/contracts/base/DCAFactory";

const listenForNewAccount = (
  factoryContract: DCAFactory,
  userAddress: string,
  callBack: (account: string) => Promise<void>
) => {
  // Create filter for AccountCreated events where owner is the userAddress
  const filter = factoryContract.filters.AccountCreated(userAddress);
  console.log("[listeners] listenForNewAccount");

  // Listen for the filtered events - this will persist and listen for ALL matching events
  factoryContract.on(
    filter,
    (owner: string, dcaAccount: string, event: AccountCreatedEvent.Log) => {
      console.log(
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

  // Return cleanup function - only used when we need to stop listening
  return () => {
    factoryContract.off(filter, () => {});
  };
};

const listenForNewStrategy = (
  accountContract: DCAAccount,
  callBack: (strategyId: number, account: string) => void
) => {
  console.log(
    "[listeners] listenForNewStrategy on account",
    accountContract.target
  );
  // Create filter for AccountCreated events where owner is the userAddress
  const filter = accountContract.filters.StrategyCreated();
  // Listen for the filtered events - this will persist and listen for ALL matching events
  accountContract.on(filter, (strategyId_: bigint, event: any) => {
    // Double check the owner matches our user (redundant but safe)
    console.log(
      "[listeners] listenForNewStrategy Triggered",
      strategyId_,
      accountContract.target
    );
    callBack(Number(strategyId_), accountContract.target as string);
  });

  // Return cleanup function - only used when we need to stop listening
  return () => {
    accountContract.off(filter, () => {});
  };
};

const listenForStrategyExecution = (
  accountContract: DCAAccount,
  callBack: (strategyId: number, amountIn: number) => void
) => {
  console.log(
    "[listeners] listenForStrategyExecution on account",
    accountContract.target
  );
  const filter = accountContract.filters.StrategyExecuted();
  accountContract.on(
    filter,
    (strategyId_: bigint, amountIn_: bigint, reInvested_: boolean) => {
      console.log(
        "[listeners] listenForStrategyExecution Triggered",
        strategyId_,
        amountIn_,
        reInvested_
      );
      callBack(Number(strategyId_), Number(amountIn_));
    }
  );

  return () => {
    accountContract.off(filter, () => {});
  };
};

const listenForSubscription = (
  accountContract: DCAAccount,
  callBack: (strategyId: number, active: boolean, dcaAccount: string) => void
) => {
  console.log(
    "[listeners] listenForSubscription on account",
    accountContract.target
  );
  const filterA = accountContract.filters.StrategySubscription();
  accountContract.on(filterA, (event: any) => {
    const [strategyId_, executor_] = event.args;
    console.log("[listeners] listenForSubscription Triggered", strategyId_);
    callBack(Number(strategyId_), true, accountContract.target as string);
  });

  const filterB = accountContract.filters.StrategySubscription();
  accountContract.on(filterB, (event: any) => {
    const [strategyId_] = event.args;
    console.log("[listeners] listenForSubscription UnSubscribed", strategyId_);
    callBack(Number(strategyId_), false, accountContract.target as string);
  });

  // Add a cleanup function
  return () => {
    accountContract.off(filterA, () => {});
    accountContract.off(filterB, () => {});
  };
};

export {
  listenForNewAccount,
  listenForNewStrategy,
  listenForStrategyExecution,
  listenForSubscription,
};
