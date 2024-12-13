<!-- @format -->

# Stats & Hooks

## Introduction

To maintain an updated UI and allow for quick and simple interaction with the contracts and services we need to build a range of Hooks and functionality that will allow for this.

### Events

**DCAAccount**:

```typescript
/**
     * @notice Emitted when a strategy has been executed
     * @param strategyId_ the id for the executed strategy
     * @param amountIn_ amount received from the swap
     * @param reInvested_  wether the strategy reinvested or not
     */
    event StrategyExecuted(
        uint256 indexed strategyId_,
        uint256 indexed amountIn_,
        bool reInvested_
    );
    /**
     * @notice Emitted when the Strategy is confirmed to be subscribed to an Executor
     * @param strategyId_ ID of the strategy that has been subscribed
     * @param executor_ Address of the Executor contract subscribed to
     */
    event StrategySubscribed(
        uint256 indexed strategyId_,
        address indexed executor_
    );
    /**
     * @notice Emitted when a strategy has been unsubscribed from an Executor
     * @param strategyId_ Id of the strategy being unsubscribed
     */
    event StrategyUnsubscribed(uint256 indexed strategyId_);
    /**
     * @notice Emitted when a new strategy has been created
     * @param strategyId_ Id of the newly created strategy
     */
    event StrategyCreated(uint256 indexed strategyId_);
    /**
     * @notice Emits when the reinvest address has been changed
     * @param newLibraryAddress The address for the Library contract
     */
    event ReinvestLibraryChanged(address indexed newLibraryAddress);

    /**
     * @notice Emits when a Reinvest modula has been executed
     * @param strategyId_ the ID of the strategy executed
     * @param success Wether the reinvest was successful
     * @param amountReturned The amount returned by the Reinvest
     */
    event ReinvestExecuted(
        uint256 indexed strategyId_,
        bool indexed success,
        uint256 amountReturned
    );

    /**
     * @notice Emited when a Reinvest is unwound
     * @param strategyId The ID of the strategy
     * @param amount The amount unwond and returned to the account
     * @param success If the unwind was successful
     */
    event ReinvestUnwound(
        uint256 indexed strategyId,
        uint256 amount,
        bool indexed success
    );
```

**DCAFactory**

```typescript
  /**
     * @notice Emitted when a new DCAAccount is created.
     * @param owner The owner of the DCAAccount
     * @param dcaAccount The address of the DCAAccount
     */
    event AccountCreated(address indexed owner, address indexed dcaAccount);

    /**
     * @notice Emitted when the DCAExecutor address is changed.
     * @param newAddress The new address of the DCAExecutor
     */
    event ExecutorChanged(address indexed newAddress);
    /**
     * @notice Emitted when the DCAReinvestContract address is changed.
     * @param newLibraryAddress The new address of the DCAReinvestContract
     */
    event ReinvestLibraryChanged(address indexed newLibraryAddress);
```

**DCAExecutor**

```typescript
 /**
     * @notice Emitted once a strategy has finished executing successfully
     * @param account_ Address of the DCAAccount
     * @param strategyId_  ID of the strategy executed
     */
    event ExecutedStrategy(
        address indexed account_,
        uint256 indexed strategyId_
    );

    /**
     * @notice Emitted when a new strategy subscribes or unsubscribes to the executor
     * @param DCAAccountAddress_  address of the DCAAccount subscribing
     * @param strategyId_  ID of the strategy to (un-)subscribe
     * @param strategyInterval_  Interval state of how ofter to be executed
     * @param active_ wether the strategy is being subscribed (true) or unsubscribed (false)
     */
    event StrategySubscription(
        address indexed DCAAccountAddress_,
        uint256 indexed strategyId_,
        Interval strategyInterval_,
        bool indexed active_
    );

    /**
     * @notice Emitted each time the protocol fees are distributed
     * @param token_ address of the token being distributed
     * @param amount_ amount of the total token distributed
     */
    event FeesDistributed(address indexed token_, uint256 indexed amount_);

    event FeeDataChanged();
```

## useAccountStats

This hook provides access and calling logic for getting statistics on a spesific account and/or strategy. It utilisies the rest of the Account, Factory and Signer hooks.

### Statistics

| Name | Type | Source |
|----|----|----|
| Total Accounts | Number | Length of`DCAFactory.getAccountsOfUser(usersWalletAddress_)` |
| Total Strategies | Number | Sum of `DCAAccount.StrategyCreated()` event’s from each account |
| Total Executions | Number | Sum of `DCAAccount.StrategyExecuted()` events or `DCAExecutor.ExecutedStrategy()` event with Account address as `account_` argument |
| Account Strategies | Number | Sum of `DCAAccount.StrategyCreated()` events with argumetns of `strategyId_` matching. |
| Strategy Executions | Number | Sum of all `DCAAccount.StrategyExecuted()` from an account with the argument `strategyId_` aligning |
| Execution Value | Number | The `amount_` of each individual `DCAAccount.StrategyExecuted() `event. |
| Strategy Value | Number | The sum of `ampunt_ `from`DCAAccount.StrategyExecuted()`for the spesific strategy |
| Average Execution Return | Number | The average amount the Strategy Execution yields. |
| Last Execution | Object | Seconds since last execution from calling `DCAAccount.getTimeTillWindow() ` |
| Token Balances | Object | Totals, by strategy & by account, of account holdings of Base & Target tokens. |
| Active Strategies | number | BY STRATEGY & ACCOUNT - Sum of all `IDCADataStructures.StrategyStruct.active` |

### Hook

The hook & storage system needs to allow us to store and search by Strategy & Account. Allowing us to be finite or big picture with out stats base, depending on the needs.

The hook needs to maintain event listeners that will allow it to automaticaly react to and keep updated the stats and interactions on the screen.  


We want to beable to pull when the next execution for the spesific stat will be, with it counting down, then once at zero it should be waiting for the next execution event of that strategy to start the countdown again, allowing it to maintian some truth. 