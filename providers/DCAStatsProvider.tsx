/** @format */

import useSigner from "@/hooks/useSigner";
import { createContext, useContext, useState, type ReactNode } from "react";
import { useDCAFactory } from "@/hooks/useDCAFactory";
import { EthereumAddress } from "@/types/generic";
import { DCAAccount } from "@/types/contracts";
import { IDCADataStructures } from "@/types/contracts/contracts/base/DCAAccount";
import { Signer } from "ethers";
import { NetworkKeys } from "@/types";
import { connectToDCAAccount } from "@/hooks/helpers/connectToContract";
import { buildStrategyStruct } from "@/hooks/helpers/buildDataTypes";
import {
  getAccountStrategyCreationEvents,
  getStrategyExecutionEvents,
} from "@/hooks/helpers/getAccountEvents";
import {
  listenForNewAccount,
  listenForNewStrategy,
  listenForStrategyExecution,
  listenForSubscription,
} from "./listeners";

export interface AccountStorage {
  account: EthereumAddress;
  instance: DCAAccount;
  strategies: IDCADataStructures.StrategyStruct[];
  balances: TokenBalances;
  statistics?: AccountStats;
}

export interface AccountStats {
  totalExecutions: number;
  totalActiveStrategies: number;
  totalStrategies: number;
  reinvestLibraryVersion: string | false;
  lastExecution?: number;
  strategy: {
    [strategyId: number]: StrategyStats;
  };
}

export interface StrategyStats {
  totalExecutions: number;
  totalCumulated: number;
  lastExecution?: number;
  executions: ExecutionStats[];
}

export interface ExecutionStats {
  amount: number;
  executionId: number;
  blockNumber: number;
  timestamp: number;
}

export interface WalletStats {
  totalExecutions: number;
  totalActiveStrategies: number;
  totalStrategies: number;
  totalAccounts: number;
}

export interface DCAProviderContextInterface {
  Signer: Signer | null;
  ACTIVE_NETWORK: NetworkKeys | undefined;
  accounts: AccountStorage[];
  selectedAccount: EthereumAddress;
  isLoading: boolean;
  firstLoad: boolean;
  walletStats: WalletStats | undefined;
  loadingMessage: string | null;
  initiateUserAccounts: () => void;
  setSelectedAccount: (account: EthereumAddress) => void;
  addAccount: (account: AccountStorage) => void;
  addStrategy: (
    account: EthereumAddress,
    strategy: IDCADataStructures.StrategyStruct
  ) => void;
  updateAccount: (
    account: EthereumAddress,
    key: keyof AccountStorage,
    value: any
  ) => void;
  getAccount: (account: EthereumAddress) => AccountStorage | undefined;
  getAccountInstance: (account: EthereumAddress) => DCAAccount | undefined;
  getAccountStrategies: (
    account: EthereumAddress
  ) => IDCADataStructures.StrategyStruct[] | undefined;
  getStrategy: (
    account: EthereumAddress,
    strategyId: number
  ) => IDCADataStructures.StrategyStruct;
  getAccountBalances: (account: EthereumAddress) => TokenBalances | undefined;
  getAccountStats: (account: EthereumAddress) => AccountStats | null;
  getStrategyStats: (
    account: EthereumAddress,
    strategyId: number
  ) => StrategyStats | null;
}

export const DCAProviderContext = createContext(
  {} as DCAProviderContextInterface
);

export interface DCAProviderProps {
  children?: ReactNode;
}

export function DCAStatsProvider({ children }: DCAProviderProps) {
  const { ACTIVE_NETWORK, Signer, getBlock, address } = useSigner();
  const { getUsersAccountAddresses, DCAFactory } = useDCAFactory();

  /** STATE */

  const [isLoading, setIsLoading] = useState(false);
  const [firstLoad, setFirstLoad] = useState(false);
  const [accounts, setAccounts] = useState<AccountStorage[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<EthereumAddress>("");
  const [walletStats, setWalletStats] = useState<WalletStats>();

  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);

  /** EFFECTS */

  /** LOGIC */

  const initiateUserAccounts = async () => {
    if (!Signer || firstLoad || isLoading || !DCAFactory) return;
    console.log("[DCAStatsProvider] initiateUserAccounts Mounted");
    setIsLoading(true);
    setLoadingMessage("Loading Accounts...");
    const accountStates: AccountStorage[] = [];

    try {
      await getUsersAccountAddresses().then(async (accounts) => {
        try {
          for (let i = 0; i < accounts.length; i++) {
            const account: string = accounts[i];
            setLoadingMessage(`Loading Account ${i + 1} of ${accounts.length}`);
            const instance = await createAccountInstance(account);
            setLoadingMessage(
              `Loading Strategies for Account ${i + 1} of ${accounts.length}`
            );
            const strategies = await fetchAccountStrategies(account, instance!);

            if (strategies.length > 0) {
              setLoadingMessage(
                `Loading Balances for Account ${i + 1} of ${accounts.length}`
              );
              const balances = await fetchTokenBalances(
                account,
                strategies,
                instance!
              );
              setLoadingMessage(
                `Loading Statistics for Account ${i + 1} of ${accounts.length}`
              );
              const statistics = await buildAccountStats(instance!, strategies);
              setLoadingMessage(
                `Got Account Data for Account ${i + 1} of ${accounts.length}`
              );
              const accountData: AccountStorage = {
                account,
                instance: instance!,
                strategies,
                balances,
                statistics,
              };

              accountStates.push(accountData);
            } else {
              setLoadingMessage(
                `Loading Balances for Account ${i + 1} of ${accounts.length}`
              );

              const balances = {};
              setLoadingMessage(
                `Loading Statistics for Account ${i + 1} of ${accounts.length}`
              );

              const statistics = {
                totalExecutions: 0,
                totalActiveStrategies: 0,
                totalStrategies: 0,
                reinvestLibraryVersion: "false",
                strategy: {},
                lastExecution: 0,
              };

              const accountData: AccountStorage = {
                account,
                instance: instance!,
                strategies,
                balances,
                statistics,
              };
              setLoadingMessage(
                `Got Account Data for Account ${i + 1} of ${accounts.length}`
              );
              accountStates.push(accountData);
            }
          }
        } catch (error) {
          console.error("Error in initiateUserAccounts level 1:", error);
        }
      });

      setLoadingMessage(null);

      setAccounts(accountStates);
      buildWalletStats(accountStates);
      startListeners(accountStates);
      setFirstLoad(true);
    } catch (error) {
      console.error("Error in initiateUserAccounts level 2:", error);
      setIsLoading(false);
      return;
    } finally {
      setIsLoading(false);
    }
  };

  const createAccountInstance = async (accountAddress: EthereumAddress) => {
    if (!Signer) return null;
    try {
      return await connectToDCAAccount(accountAddress.toString(), Signer);
    } catch (error) {
      console.error("Error connecting to DCA account:", error);
      return null;
    }
  };

  const startListeners = (accountsInput: AccountStorage[]) => {
    if (DCAFactory) listenForNewAccount(DCAFactory!, address!, onNewAccount);
    if (accountsInput.length > 0) {
      console.log("[DCAStatsProvider] startListeners", accountsInput);
      for (const account of accountsInput) {
        console.log("[DCAStatsProvider] startListeners", account.account);
        listenForNewStrategy(account.instance, onNewStrategy);
        listenForSubscription(account.instance, onSubscription);
      }
    }
  };

  /** GETTERS */

  const getAccount = (account: EthereumAddress) => {
    return accounts.find((a) => a.account === account);
  };

  const getAccountInstance = (
    account: EthereumAddress
  ): DCAAccount | undefined =>
    accounts.find((a) => a.account === account)?.instance;

  const getAccountStrategies = (account: EthereumAddress) =>
    accounts.find((a) => a.account === account)?.strategies;

  const getAccountBalances = (account: EthereumAddress) =>
    accounts.find((a) => a.account === account)?.balances;

  const getAccountStats = (account: EthereumAddress): AccountStats | null =>
    accounts.find((a) => a.account === account)?.statistics || null;

  const getStrategyStats = (
    account: EthereumAddress,
    strategyId: number
  ): StrategyStats | null =>
    accounts.find((a) => a.account === account)?.statistics?.strategy[
      strategyId
    ] || null;

  const getStrategy = (
    accountAddress: EthereumAddress,
    strategyId: number
  ): IDCADataStructures.StrategyStruct => {
    let strat: IDCADataStructures.StrategyStruct;
    console.log(
      "[useDCAProdivder] : Check get Strategy Account",
      accountAddress
    );
    const strategies = getAccountStrategies(accountAddress);
    strat = strategies?.find((s) => s.strategyId === strategyId)!;

    return strat!;
  };

  /** UPDATERS */

  const updateAccount = (
    account: EthereumAddress,
    key: keyof AccountStorage,
    value: any
  ) =>
    setAccounts(
      accounts.map((a) => (a.account === account ? { ...a, [key]: value } : a))
    );

  const updateAccountStrategies = (
    account: EthereumAddress,
    strategies: IDCADataStructures.StrategyStruct[]
  ) =>
    setAccounts(
      accounts.map((a) => (a.account === account ? { ...a, strategies } : a))
    );

  const updateStrategy = (
    account: EthereumAddress,
    strategy: IDCADataStructures.StrategyStruct
  ) =>
    setAccounts(
      accounts.map((a) => {
        if (a.account === account) {
          // Find and update the specific strategy
          const updatedStrategies = a.strategies.map((s) =>
            s.strategyId === strategy.strategyId ? strategy : s
          );
          return { ...a, strategies: updatedStrategies };
        }
        return a;
      })
    );

  const updateStrategyStats = (
    account: EthereumAddress,
    strategyId: number,
    stats: StrategyStats
  ) =>
    setAccounts(
      accounts.map((a) => {
        if (a.account === account && a.statistics) {
          return {
            ...a,
            statistics: {
              ...a.statistics,
              strategy: {
                ...a.statistics.strategy,
                [strategyId]: {
                  ...a.statistics.strategy[strategyId],
                  ...stats,
                },
              },
            },
          };
        }
        return a;
      })
    );

  /** SETTERS */

  const addAccount = (account: AccountStorage): void => {
    console.log("[DCAStatsProvider] adding account", account.account);
    setAccounts([...accounts, account]);
  };

  const addStrategy = (
    account: EthereumAddress,
    strategy: IDCADataStructures.StrategyStruct
  ) =>
    setAccounts(
      accounts.map((a) =>
        a.account === account
          ? { ...a, strategies: [...a.strategies, strategy] }
          : a
      )
    );
  /** FETCHERS */
  const fetchAccountStrategies = async (
    accountAddress: string,
    dcaAccount: DCAAccount
  ): Promise<IDCADataStructures.StrategyStruct[]> => {
    if (!Signer) return [];
    if (!dcaAccount) return [];

    const strategyEvents = await getAccountStrategyCreationEvents(dcaAccount);
    const strategies = await Promise.all(
      strategyEvents.map(async (event) => {
        const rawStrategyData = await dcaAccount.getStrategyData(event.id);
        const formattedStrategy = buildStrategyStruct(rawStrategyData);

        return {
          ...formattedStrategy,
          account: accountAddress,
          accountContract: dcaAccount,
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash,
        };
      })
    );
    return strategies;
  };

  const fetchAccountStrategy = async (
    accountAddress: string,
    strategyId: number
  ): Promise<IDCADataStructures.StrategyStruct> => {
    const accountInstance = getAccountInstance(accountAddress);
    const strategyData = await accountInstance?.getStrategyData(strategyId);
    const formattedStrategy = buildStrategyStruct(strategyData!);
    return formattedStrategy;
  };

  const fetchTokenBalances = async (
    accountAddress: string,
    strategies: IDCADataStructures.StrategyStruct[],
    dcaAccount: DCAAccount
  ) => {
    if (!Signer) return {};

    const balances: TokenBalances = {};

    try {
      // Get unique tokens from strategies
      const uniqueTokens = new Set<string>();
      strategies.forEach((strategy) => {
        uniqueTokens.add(strategy.baseToken.tokenAddress.toString());
        uniqueTokens.add(strategy.targetToken.tokenAddress.toString());
      });

      // Fetch balances for each token
      await Promise.all(
        Array.from(uniqueTokens).map(async (tokenAddress) => {
          try {
            const baseBalance = await dcaAccount.getBaseBalance(tokenAddress);
            const targetBalance = await dcaAccount.getTargetBalance(
              tokenAddress
            );

            // Get strategies that use this token as base token
            const relevantStrategies = strategies.filter(
              (s) => s.baseToken.tokenAddress.toString() === tokenAddress
            );

            // Calculate total amount needed per execution
            const totalPerExecution = relevantStrategies.reduce(
              (sum, strategy) => sum + BigInt(strategy.amount),
              BigInt(0)
            );

            const remainingExecutions =
              totalPerExecution > 0
                ? Number(baseBalance / totalPerExecution)
                : 0;

            balances[tokenAddress] = {
              balance: baseBalance,
              targetBalance,
              remainingExecutions,
              needsTopUp: remainingExecutions < 5 || undefined,
            };
          } catch (error) {
            console.error(
              `Error fetching balance for token ${tokenAddress}:`,
              error
            );
            balances[tokenAddress] = {
              balance: BigInt(0),
              targetBalance: BigInt(0),
              remainingExecutions: 0,
            };
          }
        })
      );

      return balances;
    } catch (error) {
      console.error("Error in fetchTokenBalances:", error);
      return {};
    }
  };

  /** BUILDERS */

  const buildAccountStats = async (
    accountInstance: DCAAccount,
    strategies: IDCADataStructures.StrategyStruct[]
  ): Promise<AccountStats> => {
    const reinvest = await accountInstance?.getAttachedReinvestLibraryVersion();
    const strategyStats: { [strategyId: number]: StrategyStats } = {};
    let totalExecutions = 0;
    for (const strategy of strategies) {
      const stats = await buildStrategyStats(accountInstance, strategy);
      strategyStats[Number(strategy?.strategyId)] = stats;
      totalExecutions += stats.totalExecutions;
    }

    let lastExecution: number | undefined = undefined;

    for (const key in strategyStats) {
      if (
        strategyStats[key].lastExecution &&
        (!lastExecution || strategyStats[key].lastExecution > lastExecution)
      ) {
        lastExecution = strategyStats[key].lastExecution;
      }
    }

    const initStats: AccountStats = {
      reinvestLibraryVersion: reinvest || false,
      totalStrategies: strategies.length,
      totalActiveStrategies: strategies.filter((s) => s.active).length || 0,
      totalExecutions,
      lastExecution,
      strategy: strategyStats,
    };
    console.log("[DCAStatsProvider] initStats", initStats);
    return initStats;
  };

  const buildStrategyStats = async (
    accountInstance: DCAAccount,
    strategy: IDCADataStructures.StrategyStruct
  ): Promise<StrategyStats> => {
    const executions = await getStrategyExecutionEvents(
      accountInstance,
      Number(strategy?.strategyId)
    );

    let totalExecutions = executions.length,
      totalCumulated = 0,
      lastExecution = 0;

    const executionEvents: ExecutionStats[] = [];

    if (totalExecutions > 0) {
      totalCumulated = executions?.reduce(
        (sum, execution) => sum + Number(execution.amountIn),
        0
      );

      const lastExecEvent = executions?.reduce((latest, current) => {
        return latest.blockNumber > current.blockNumber ? latest : current;
      });

      const block = await getBlock(lastExecEvent.blockNumber);

      lastExecution = block?.timestamp!;

      let i = 0;
      for (const execution of executions) {
        i++;
        const block = await getBlock(execution.blockNumber);
        const timestamp = block?.timestamp!;
        executionEvents.push({
          amount: Number(execution.amountIn),
          executionId: i,
          blockNumber: execution.blockNumber,
          timestamp: timestamp,
        });
      }
    }

    const data: StrategyStats = {
      totalExecutions,
      totalCumulated,
      lastExecution,
      executions: executionEvents,
    };

    console.log("[DCAStatsProvider] buildStrategyStats", data);
    return data;
  };

  const buildWalletStats = (accounts: AccountStorage[]) => {
    let totalExecutions = 0;
    let totalActiveStrategies = 0;
    let totalStrategies = 0;

    for (const account of accounts) {
      totalExecutions += account?.statistics?.totalExecutions!;
      totalActiveStrategies += account?.statistics?.totalActiveStrategies!;
      totalStrategies += account?.strategies.length!;
    }

    const walletStats: WalletStats = {
      totalExecutions,
      totalActiveStrategies,
      totalStrategies,
      totalAccounts: accounts.length,
    };

    console.log("[DCAStatsProvider] buildWalletStats", walletStats);
    setWalletStats(walletStats);
  };

  /** LISTENERS */

  const onNewAccount = async (account: string) => {
    console.log("[DCAStatsProvider] onNewAccount", account);
    let accountStates: AccountStorage;
    const instance = await createAccountInstance(account);
    const strategies = await fetchAccountStrategies(account, instance!);

    if (strategies.length > 0) {
      const balances = await fetchTokenBalances(account, strategies, instance!);

      const statistics = await buildAccountStats(instance!, strategies);

      const accountData: AccountStorage = {
        account,
        instance: instance!,
        strategies,
        balances,
        statistics,
      };
      accountStates = accountData;
    } else {
      const balances = {};
      const statistics = {
        totalExecutions: 0,
        totalActiveStrategies: 0,
        totalStrategies: 0,
        reinvestLibraryVersion: "false",
        strategy: {},
        lastExecution: 0,
      };

      const accountData: AccountStorage = {
        account,
        instance: instance!,
        strategies,
        balances,
        statistics,
      };
      accountStates = accountData;
    }

    addAccount(accountStates);
  };

  const onNewStrategy = async (strategyId: number, account: string) => {
    console.log("[DCAStatsProvider] onNewStrategy", strategyId, account);
    const strategy = await fetchAccountStrategy(account, strategyId!);
    addStrategy(account, strategy);
    if (strategy.active) {
      const accountInstance = getAccountInstance(account);
      const strategies = await fetchAccountStrategies(
        account,
        accountInstance!
      );
      const balances = await fetchTokenBalances(
        account,
        strategies,
        accountInstance!
      );
      const statistics = await buildAccountStats(accountInstance!, strategies);
      updateAccount(account, "balances", balances);
      updateAccount(account, "statistics", statistics);
    } else {
      const statistics = {
        totalExecutions: 0,
        totalActiveStrategies: 0,
        totalStrategies: 0,
        reinvestLibraryVersion: "false",
        strategy: {},
        lastExecution: 0,
      };
      updateAccount(account, "statistics", statistics);
    }
  };

  const onSubscription = (
    strategyId: number,
    active: boolean,
    dcaAccount: string
  ) => {
    console.log("[DCAStatsProvider] onSubscription", strategyId, active);
    const strategy = getStrategy(dcaAccount, strategyId);
    strategy.active = active;
    const stratStats: StrategyStats = getStrategyStats(dcaAccount, strategyId)!;
    updateStrategy(dcaAccount, strategy);
    updateStrategyStats(dcaAccount, strategyId, stratStats);
  };

  return (
    <DCAProviderContext.Provider
      value={{
        Signer,
        ACTIVE_NETWORK,
        accounts,
        selectedAccount,
        isLoading,
        firstLoad,
        walletStats,
        loadingMessage,
        setSelectedAccount,
        addAccount,
        addStrategy,
        updateAccount,
        getAccount,
        getAccountInstance,
        getAccountStrategies,
        getAccountBalances,
        getAccountStats,
        getStrategyStats,
        getStrategy,
        initiateUserAccounts,
      }}
    >
      {children}
    </DCAProviderContext.Provider>
  );
}

export const useDCAProvider = (): DCAProviderContextInterface =>
  useContext(DCAProviderContext);

export interface TokenBalanceData {
  balance: bigint;
  targetBalance: bigint;
  remainingExecutions?: number;
  needsTopUp?: true;
}

export type TokenBalances = {
  [tokenAddress: string]: TokenBalanceData;
};

export interface StrategyExecutionTiming {
  lastExecution: number;
  nextExecution: number;
}

export interface ExecutionTimings {
  [strategyId: string]: StrategyExecutionTiming;
}
