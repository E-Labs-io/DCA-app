/** @format */

import useSigner from "@/hooks/useSigner";
import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  useEffect,
  useCallback,
} from "react";
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
  clearAccountCache,
} from "@/hooks/helpers/getAccountEvents";
import {
  listenForNewAccount,
  listenForNewStrategy,
  listenForStrategyExecution,
  listenForSubscription,
} from "./listeners";
import {
  HealthCheckResponse,
  SupportedChain,
  GlobalDCAStats,
  ChainDCAStats,
} from "@/types";
import { DCAStatsAPIClient } from "@/utils/dcaApiClient";
import { dbg, dbgWarn } from '@/helpers/debug';

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
  globalStats: GlobalDCAStats | null;
  chainStats: ChainDCAStats | null;
  loadingMessage: string | null;

  // Core Functions
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

  // API Client Functions
  apiHealthCheck: () => Promise<HealthCheckResponse>;

  // Aggregate Functions
  loadGlobalStats: () => Promise<void>;
  loadChainStats: (chain: SupportedChain) => Promise<void>;
  refreshAllStats: () => Promise<void>;
}

export const DCAProviderContext = createContext(
  {} as DCAProviderContextInterface
);

export interface DCAProviderProps {
  children?: ReactNode;
}

const blockCache = new Map<number, any>();

const getCachedBlock = async (blockNumber: number, getBlock: Function) => {
  if (blockCache.has(blockNumber)) {
    return blockCache.get(blockNumber);
  }
  const block = await getBlock(blockNumber);
  blockCache.set(blockNumber, block);
  return block;
};

export function DCAStatsProvider({ children }: DCAProviderProps) {
  const { ACTIVE_NETWORK, Signer, getBlock, address } = useSigner();
  const { getUsersAccountAddresses, DCAFactory } = useDCAFactory();

  /** STATE */
  const [isLoading, setIsLoading] = useState(false);
  const [firstLoad, setFirstLoad] = useState(false);
  const [accounts, setAccounts] = useState<AccountStorage[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<EthereumAddress>("");
  const [walletStats, setWalletStats] = useState<WalletStats>();
  const [globalStats, setGlobalStats] = useState<GlobalDCAStats | null>(null);
  const [chainStats, setChainStats] = useState<ChainDCAStats | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);

  /** API CLIENT FUNCTIONS */

  // Health Check
  const apiHealthCheck = useCallback(async (): Promise<HealthCheckResponse> => {
    return await DCAStatsAPIClient.healthCheck();
  }, []);

  // Aggregate Functions
  const loadGlobalStats = useCallback(async (): Promise<void> => {
    try {
      const [
        totalAccounts,
        totalExecutions,
        totalActiveSubscribers,
        totalLifetimeSubscribers,
        totalVolume,
        totalLockedAmount,
        averageSubscriptionDuration,
      ] = await Promise.all([
        DCAStatsAPIClient.getTotalAccounts(),
        DCAStatsAPIClient.getTotalExecutions(),
        DCAStatsAPIClient.getTotalActiveSubscribers(),
        DCAStatsAPIClient.getTotalLifetimeSubscribers(),
        DCAStatsAPIClient.getTotalVolume(),
        DCAStatsAPIClient.getTotalLockedAmount(),
        DCAStatsAPIClient.getAverageSubscriptionDuration(),
      ]);

      const globalStats: GlobalDCAStats = {
        totalAccounts,
        totalExecutions,
        totalActiveSubscribers,
        totalLifetimeSubscribers,
        totalVolume,
        totalLockedAmount,
        averageSubscriptionDuration,
      };

      setGlobalStats(globalStats);
      dbg("[DCAStatsProvider] Global stats loaded:", globalStats);
    } catch (error) {
      console.error("[DCAStatsProvider] Error loading global stats:", error);
    }
  }, []);

  const loadChainStats = useCallback(
    async (chain: SupportedChain): Promise<void> => {
      try {
        const [
          accountsData,
          executionsData,
          activeSubscribersData,
          lifetimeSubscribersData,
          activeStrategiesData,
          volumeData,
          lockedAmountData,
          averageSubscriptionDuration,
        ] = await Promise.all([
          DCAStatsAPIClient.getAccountsByChain(chain),
          DCAStatsAPIClient.getExecutionsByChain(chain),
          DCAStatsAPIClient.getActiveSubscribersByChain(chain),
          DCAStatsAPIClient.getLifetimeSubscribersByChain(chain),
          DCAStatsAPIClient.getActiveStrategiesByChain(chain),
          DCAStatsAPIClient.getVolumeByChain(chain),
          DCAStatsAPIClient.getLockedAmountByChain(chain),
          DCAStatsAPIClient.getAverageSubscriptionDurationByChain(chain),
        ]);

        const chainStats: ChainDCAStats = {
          chain,
          accounts: accountsData.total,
          executions: executionsData.total,
          activeSubscribers: activeSubscribersData.total,
          lifetimeSubscribers: lifetimeSubscribersData.total,
          activeStrategies: activeStrategiesData.total,
          volume: volumeData.total,
          lockedAmount: lockedAmountData.total,
          averageSubscriptionDuration,
        };

        setChainStats(chainStats);
        dbg(`[DCAStatsProvider] ${chain} stats loaded:`, chainStats);
      } catch (error) {
        console.error(
          `[DCAStatsProvider] Error loading ${chain} stats:`,
          error
        );
      }
    },
    []
  );

  const refreshAllStats = useCallback(async (): Promise<void> => {
    await Promise.all([
      loadGlobalStats(),
      ACTIVE_NETWORK === "BASE_MAINNET"
        ? loadChainStats("BASE_MAINNET")
        : Promise.resolve(),
    ]);
  }, [loadGlobalStats, loadChainStats, ACTIVE_NETWORK]);

  /** EFFECTS */
  useEffect(() => {
    const handleStrategyCreated = async (e: CustomEvent) => {
      const { accountAddress, strategyId } = e.detail;

      dbg("[DCAStatsProvider] ===== STRATEGY CREATED EVENT =====");
      dbg("[DCAStatsProvider] Event Details:", {
        accountAddress,
        strategyId,
      });
      dbg("[DCAStatsProvider] Current Accounts State:", {
        accountsCount: accounts.length,
        accounts: accounts.map((a) => ({
          address: a.account,
          strategiesCount: a.strategies.length,
          strategiesIds: a.strategies.map((s) => s.strategyId),
        })),
      });

      // Clear cache to ensure we get fresh data
      dbg("[DCAStatsProvider] Clearing cache for:", accountAddress);
      clearAccountCache(accountAddress);

      // Check if account exists in our state
      const existingAccount = accounts.find(
        (a) => a.account === accountAddress
      );
      dbg("[DCAStatsProvider] Account lookup debug:", {
        targetAccountAddress: accountAddress,
        targetAccountType: typeof accountAddress,
        existingAccountFound: !!existingAccount,
        availableAccounts: accounts.map((a) => ({
          address: a.account,
          type: typeof a.account,
          matches: a.account === accountAddress,
          lowercaseMatches:
            a.account.toLowerCase() === accountAddress.toLowerCase(),
        })),
      });

      // Refresh the specific account data
      const instance = getAccountInstance(accountAddress);
      if (instance) {
        dbg(
          "[DCAStatsProvider] Account instance found:",
          instance.target
        );

        try {
          // Fetch fresh data
          dbg("[DCAStatsProvider] Fetching fresh strategies...");
          const strategies = await fetchAccountStrategies(
            accountAddress,
            instance
          );

          dbg("[DCAStatsProvider] Fetched strategies:", {
            count: strategies.length,
            ids: strategies.map((s) => s.strategyId),
            details: strategies.map((s) => ({
              id: s.strategyId,
              active: s.active,
              baseToken: s.baseToken.ticker,
              targetToken: s.targetToken.ticker,
              accountAddress: s.accountAddress,
            })),
          });

          dbg("[DCAStatsProvider] Fetching balances...");
          const balances = await fetchTokenBalances(
            accountAddress,
            strategies,
            instance
          );

          dbg("[DCAStatsProvider] Fetching statistics...");
          const statistics = await buildAccountStats(instance, strategies);

          dbg("[DCAStatsProvider] All data fetched successfully");

          // Update account in state
          dbg("[DCAStatsProvider] Updating accounts state...");
          setAccounts((prev) => {
            dbg(
              "[DCAStatsProvider] Previous accounts state:",
              prev.map((a) => ({
                address: a.account,
                strategiesCount: a.strategies.length,
              }))
            );

            const updated = prev.map((account) => {
              const isMatch = account.account === accountAddress;
              const isLowercaseMatch =
                account.account.toLowerCase() === accountAddress.toLowerCase();

              dbg(
                `[DCAStatsProvider] Checking account ${account.account}:`,
                {
                  exactMatch: isMatch,
                  lowercaseMatch: isLowercaseMatch,
                  willUpdate: isMatch || isLowercaseMatch,
                }
              );

              if (isMatch || isLowercaseMatch) {
                dbg(
                  "[DCAStatsProvider] Updating account:",
                  account.account
                );
                dbg(
                  "[DCAStatsProvider] Old strategies:",
                  account.strategies.map((s) => s.strategyId)
                );
                dbg(
                  "[DCAStatsProvider] New strategies:",
                  strategies.map((s) => s.strategyId)
                );
                return { ...account, strategies, balances, statistics };
              }
              return account;
            });

            dbg("[DCAStatsProvider] Updated accounts state:", {
              totalAccounts: updated.length,
              accountsWithStrategies: updated.filter(
                (a) => a.strategies.length > 0
              ).length,
              totalStrategies: updated.reduce(
                (sum, a) => sum + a.strategies.length,
                0
              ),
              updatedAccountDetails: updated.map((a) => ({
                address: a.account,
                strategiesCount: a.strategies.length,
                strategiesIds: a.strategies.map((s) => s.strategyId),
              })),
            });

            return updated;
          });

          dbg("[DCAStatsProvider] State update complete");

          // Rebuild API stats
          dbg("[DCAStatsProvider] Refreshing API stats...");
          refreshAllStats();

          // Add a small delay and force a component re-render check
          setTimeout(() => {
            dbg(
              "[DCAStatsProvider] ===== POST-UPDATE VERIFICATION ====="
            );
            dbg(
              "[DCAStatsProvider] Checking if UI should have updated..."
            );
          }, 100);

          dbg(
            "[DCAStatsProvider] ===== STRATEGY CREATED HANDLING COMPLETE ====="
          );
        } catch (error) {
          console.error(
            "[DCAStatsProvider] Error during strategy refresh:",
            error
          );
        }
      } else {
        console.error(
          "[DCAStatsProvider] No account instance found for:",
          accountAddress
        );
        dbg(
          "[DCAStatsProvider] Available accounts:",
          accounts.map((a) => a.account)
        );
      }
    };

    window.addEventListener(
      "strategy-created",
      handleStrategyCreated as unknown as EventListener
    );

    return () => {
      window.removeEventListener(
        "strategy-created",
        handleStrategyCreated as unknown as EventListener
      );
    };
  }, [accounts, refreshAllStats]);

  // Load global stats on mount and network change
  useEffect(() => {
    if (ACTIVE_NETWORK) {
      refreshAllStats();
    }
  }, [ACTIVE_NETWORK, refreshAllStats]);

  /** LOGIC */
  const initiateUserAccounts = async () => {
    if (!Signer || firstLoad || isLoading || !DCAFactory) return;
    setIsLoading(true);
    setLoadingMessage("Initializing...");

    try {
      dbg("[DCAStatsProvider] Pre Get Accounts");

      // 1. Get all user accounts in one call
      const accountAddresses = await getUsersAccountAddresses();
      dbg("[DCAStatsProvider] initiateUserAccounts");

      // 2. Quick initial load with basic data
      const basicAccountData: AccountStorage[] = await Promise.all(
        accountAddresses.map(async (account) => {
          const instance = await createAccountInstance(account);
          return {
            account: account as EthereumAddress,
            instance: instance!,
            strategies: [],
            balances: {},
            statistics: {
              totalExecutions: 0,
              totalActiveStrategies: 0,
              totalStrategies: 0,
              reinvestLibraryVersion: false as const,
              strategy: {},
            },
          };
        })
      );

      dbg("[DCAStatsProvider] Got Basic Account Data");

      // Store basic data but DON'T set firstLoad yet
      setAccounts(basicAccountData);

      // 3. Add loading progress tracking
      let loadedAccounts = 0;
      const totalAccounts = accountAddresses.length;

      dbg("[DCAStatsProvider] Loaded Accounts", loadedAccounts);

      // 4. Load detailed data in parallel
      const detailedDataPromises = basicAccountData.map(
        async ({ account, instance }, index) => {
          if (!instance) return null;

          setLoadingMessage(
            `Loading account ${index + 1} of ${totalAccounts}...`
          );

          // Load strategies and initial balances in parallel
          const [strategies, initialBalances] = await Promise.all([
            fetchAccountStrategies(account as string, instance),
            fetchTokenBalances(account as string, [], instance),
          ]);

          // Load statistics and final balances in parallel
          const [statistics, finalBalances] = await Promise.all([
            buildAccountStats(instance, strategies),
            fetchTokenBalances(account as string, strategies, instance),
          ]);

          // Increment loaded accounts counter
          loadedAccounts++;

          // If we've loaded most accounts (80%), we can show the UI
          if (loadedAccounts / totalAccounts >= 0.8 && !firstLoad) {
            setFirstLoad(true);
          }

          return {
            account,
            instance,
            strategies,
            balances: finalBalances,
            statistics,
          };
        }
      );

      // 5. Process all detailed data
      const completedAccounts = (
        await Promise.all(detailedDataPromises)
      ).filter(
        (account): account is NonNullable<typeof account> => account !== null
      );

      // 6. Final state update
      setAccounts(completedAccounts);
      buildWalletStats(completedAccounts);
      startListeners(completedAccounts);

      // 7. Load API stats after accounts are loaded
      await refreshAllStats();

      // Ensure firstLoad is true after everything is loaded
      setFirstLoad(true);
    } catch (error) {
      console.error("Error in initiateUserAccounts:", error);
    } finally {
      setLoadingMessage(null);
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
    dbg(
      "[DCAStatsProvider] startListeners - Setting up event listeners"
    );

    try {
      if (DCAFactory && address) {
        dbg("[DCAStatsProvider] Setting up factory event listener");
        listenForNewAccount(DCAFactory, address, onNewAccount);
      }
    } catch (error) {
      dbgWarn(
        "[DCAStatsProvider] Failed to set up factory listener:",
        error
      );
    }

    if (accountsInput.length > 0) {
      dbg(
        "[DCAStatsProvider] Setting up account listeners for",
        accountsInput.length,
        "accounts"
      );
      for (const account of accountsInput) {
        try {
          dbg(
            "[DCAStatsProvider] Setting up listeners for account:",
            account.account
          );
          // These are now async functions
          listenForNewStrategy(account.instance, onNewStrategy);
          listenForSubscription(account.instance, onSubscription);
        } catch (error) {
          dbgWarn(
            `[DCAStatsProvider] Failed to set up listeners for account ${account.account}:`,
            error
          );
        }
      }
    }

    dbg("[DCAStatsProvider] Event listener setup completed");
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
    dbg(
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
    dbg("[DCAStatsProvider] adding account", account.account);
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
    dbg(
      "[DCAStatsProvider] fetchAccountStrategies called for:",
      accountAddress
    );

    if (!Signer) {
      dbg("[DCAStatsProvider] No signer available");
      return [];
    }
    if (!dcaAccount) {
      dbg("[DCAStatsProvider] No DCA account available");
      return [];
    }

    dbg("[DCAStatsProvider] Getting strategy creation events...");
    const strategyEvents = await getAccountStrategyCreationEvents(
      dcaAccount,
      true
    ); // Force refresh

    dbg("[DCAStatsProvider] Strategy events found:", {
      count: strategyEvents.length,
      events: strategyEvents.map((e) => ({
        id: e.id,
        blockNumber: e.blockNumber,
        transactionHash: e.transactionHash,
      })),
    });

    dbg("[DCAStatsProvider] Processing strategy events...");
    const strategies = await Promise.all(
      strategyEvents.map(async (event, index) => {
        dbg(
          `[DCAStatsProvider] Processing event ${index + 1}/${
            strategyEvents.length
          }: strategy ID ${event.id}`
        );

        const rawStrategyData = await dcaAccount.getStrategyData(event.id);
        dbg(`[DCAStatsProvider] Raw strategy data for ${event.id}:`, {
          strategyId: rawStrategyData.strategyId.toString(),
          active: rawStrategyData.active,
          baseToken: rawStrategyData.baseToken.ticker,
          targetToken: rawStrategyData.targetToken.ticker,
          accountAddress: rawStrategyData.accountAddress,
        });

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

    dbg("[DCAStatsProvider] Final processed strategies:", {
      count: strategies.length,
      strategies: strategies.map((s) => ({
        id: s.strategyId,
        active: s.active,
        baseToken: s.baseToken.ticker,
        targetToken: s.targetToken.ticker,
      })),
    });

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
    const [reinvest, strategyStatsArray] = await Promise.all([
      accountInstance.getAttachedReinvestLibraryVersion(),
      Promise.all(
        strategies.map((strategy) =>
          buildStrategyStats(accountInstance, strategy)
        )
      ),
    ]);

    const strategyStats: { [strategyId: number]: StrategyStats } = {};
    let totalExecutions = 0;
    let lastExecution: number | undefined = undefined;

    strategyStatsArray.forEach((stats, index) => {
      const strategyId = Number(strategies[index].strategyId);
      strategyStats[strategyId] = stats;
      totalExecutions += stats.totalExecutions;

      if (
        stats.lastExecution &&
        (!lastExecution || stats.lastExecution > lastExecution)
      ) {
        lastExecution = stats.lastExecution;
      }
    });

    return {
      reinvestLibraryVersion: reinvest || false,
      totalStrategies: strategies.length,
      totalActiveStrategies: strategies.filter((s) => s.active).length,
      totalExecutions,
      lastExecution,
      strategy: strategyStats,
    };
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

      const block = await getCachedBlock(lastExecEvent.blockNumber, getBlock);

      lastExecution = block?.timestamp!;

      let i = 0;
      for (const execution of executions) {
        i++;
        const block = await getCachedBlock(execution.blockNumber, getBlock);
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

    dbg("[DCAStatsProvider] buildStrategyStats", data);
    return data;
  };

  const buildWalletStats = (accounts: NonNullable<AccountStorage>[]) => {
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

    dbg("[DCAStatsProvider] buildWalletStats", walletStats);
    setWalletStats(walletStats);
  };

  /** LISTENERS */
  const onNewAccount = async (account: string) => {
    dbg("[DCAStatsProvider] onNewAccount", account);
    let accountStates: AccountStorage;
    const instance = await createAccountInstance(account as EthereumAddress);
    const strategies = await fetchAccountStrategies(account, instance!);

    if (strategies.length > 0) {
      const balances = await fetchTokenBalances(account, strategies, instance!);

      const statistics = await buildAccountStats(instance!, strategies);

      const accountData: AccountStorage = {
        account: account as EthereumAddress,
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
        account: account as EthereumAddress,
        instance: instance!,
        strategies: [],
        balances,
        statistics,
      };
      accountStates = accountData;
    }

    addAccount(accountStates);
    // Refresh API stats when new account is added
    refreshAllStats();
  };

  const onNewStrategy = async (strategyId: number, account: string) => {
    dbg("[DCAStatsProvider] onNewStrategy", strategyId, account);
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
    // Refresh API stats when new strategy is added
    refreshAllStats();
  };

  const onSubscription = (
    strategyId: number,
    active: boolean,
    dcaAccount: string
  ) => {
    dbg("[DCAStatsProvider] onSubscription", strategyId, active);
    const strategy = getStrategy(dcaAccount, strategyId);
    strategy.active = active;
    const stratStats: StrategyStats = getStrategyStats(dcaAccount, strategyId)!;
    updateStrategy(dcaAccount, strategy);
    updateStrategyStats(dcaAccount, strategyId, stratStats);
    // Refresh API stats when subscription changes
    refreshAllStats();
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
        globalStats,
        chainStats,
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

        // API Client Functions
        apiHealthCheck,
        loadGlobalStats,
        loadChainStats,
        refreshAllStats,
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
  needsTopUp?: boolean;
}

export type TokenBalances = Record<string, TokenBalanceData>;

export interface StrategyExecutionTiming {
  lastExecution: number;
  nextExecution: number;
}

export interface ExecutionTimings {
  [strategyId: string]: StrategyExecutionTiming;
}
