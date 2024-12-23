/** @format */

import { useAppKitAccount } from "@reown/appkit/react";
import useSigner from "@/hooks/useSigner";
import { useAppKitNetwork } from "@reown/appkit/react";
import react, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { TokenBalances, useAccountStats } from "@/hooks/useAccountStats";
import { useDCAFactory } from "@/hooks/useDCAFactory";
import { EthereumAddress } from "@/types/generic";
import { DCAAccount } from "@/types/contracts";
import { IDCADataStructures } from "@/types/contracts/contracts/base/DCAAccount";
import { Signer } from "ethers";
import { NetworkKeys } from "@/types";
import { connectToDCAAccount } from "@/hooks/helpers/connectToContract";
import { useDCAAccount } from "@/hooks/useDCAAccount";
import { buildStrategyStruct } from "@/hooks/helpers/buildDataTypes";
import {
  getAccountStrategyCreationEvents,
  getStrategyExecutionEvents,
} from "@/hooks/helpers/getAccountEvents";

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

export interface DCAProviderContextInterface {
  Signer: Signer | null;
  ACTIVE_NETWORK: NetworkKeys | undefined;
  accounts: AccountStorage[];
  selectedAccount: EthereumAddress;
  isLoading: boolean;
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

  getAccountBalances: (account: EthereumAddress) => TokenBalances | undefined;
  getAccountStats: (account: EthereumAddress) => AccountStats | null;
}

export const DCAProviderContext = createContext(
  {} as DCAProviderContextInterface
);

export interface DCAProviderProps {
  children?: ReactNode;
}

export function DCAStatsProvider({ children }: DCAProviderProps) {
  const { ACTIVE_NETWORK, Signer, getBlock } = useSigner();
  const { getUsersAccountAddresses, DCAFactory } = useDCAFactory();

  /** STATE */

  const [isLoading, setIsLoading] = useState(false);
  const [firstLoad, setFirstLoad] = useState(false);
  const [accounts, setAccounts] = useState<AccountStorage[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<EthereumAddress>("");

  /** EFFECTS */

  /** LOGIC */

  const initiateUserAccounts = async () => {
    if (!Signer || firstLoad || isLoading || !DCAFactory) return;
    console.log("[DCAStatsProvider] initiateUserAccounts Mounted");
    setIsLoading(true);

    const accountStates: AccountStorage[] = [];

    try {
      await getUsersAccountAddresses().then(async (accounts) => {
        try {
          for (let i = 0; i < accounts.length; i++) {
            const account: string = accounts[i];

            const instance = await createAccountInstance(account);
            const strategies = await fetchAccountStrategies(account, instance!);

            if (strategies.length > 0) {
              const balances = await fetchTokenBalances(
                account,
                strategies,
                instance!
              );

              const statistics = await buildAccountStats(instance!, strategies);

              const accountData: AccountStorage = {
                account,
                instance: instance!,
                strategies,
                balances,
                statistics,
              };
              accountStates.push(accountData);
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
              accountStates.push(accountData);
            }
          }
        } catch (error) {
          console.error("Error in initiateUserAccounts level 1:", error);
        }
      });

      setAccounts(accountStates);
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
    const totalExecutions = executions.length;
    const totalCumulated = executions.reduce(
      (sum, execution) => sum + Number(execution.amountIn),
      0
    );

    const lastExecEvent = executions.reduce((latest, current) => {
      return latest.blockNumber > current.blockNumber ? latest : current;
    });

    const block = await getBlock(lastExecEvent.blockNumber);

    const lastExecution = block?.timestamp!;

    const executionEvents: ExecutionStats[] = [];
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

    const data: StrategyStats = {
      totalExecutions,
      totalCumulated,
      lastExecution,
      executions: executionEvents,
    };

    console.log("[DCAStatsProvider] buildStrategyStats", data);
    return data;
  };

  return (
    <DCAProviderContext.Provider
      value={{
        Signer,
        ACTIVE_NETWORK,
        accounts,
        selectedAccount,
        isLoading,
        setSelectedAccount,
        addAccount,
        addStrategy,
        updateAccount,
        getAccount,
        getAccountInstance,
        getAccountStrategies,
        getAccountBalances,
        getAccountStats,
        initiateUserAccounts,
      }}
    >
      {children}
    </DCAProviderContext.Provider>
  );
}

export const useDCAProvider = (): DCAProviderContextInterface =>
  useContext(DCAProviderContext);
