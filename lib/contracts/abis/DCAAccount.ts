export const DCAAccountABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "executorAddress_",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "swapRouter_",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "owner_",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "reinvestLibraryContract_",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "OwnableInvalidOwner",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "OwnableUnauthorizedAccount",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "newLibraryAddress",
        "type": "address"
      }
    ],
    "name": "DCAReinvestLibraryChanged",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "newAddress_",
        "type": "address"
      }
    ],
    "name": "ExecutorAddressChange",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "strategyId_",
        "type": "uint256"
      }
    ],
    "name": "NewStrategyCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "strategyId_",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "amountIn_",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "reInvest_",
        "type": "bool"
      }
    ],
    "name": "StrategyExecuted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "strategyId_",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "executor_",
        "type": "address"
      }
    ],
    "name": "StrategySubscribed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "strategyId_",
        "type": "uint256"
      }
    ],
    "name": "StrategyUnsubscribed",
    "type": "event"
  },
  {
    "stateMutability": "payable",
    "type": "fallback"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "strategyId_",
        "type": "uint256"
      },
      {
        "internalType": "uint16",
        "name": "feeAmount_",
        "type": "uint16"
      }
    ],
    "name": "Execute",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "strategyId_",
        "type": "uint256"
      }
    ],
    "name": "ExecutorDeactivateStrategy",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "token_",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount_",
        "type": "uint256"
      }
    ],
    "name": "FundAccount",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "baseToken_",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "targetToken_",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount_",
        "type": "uint256"
      }
    ],
    "name": "SWAP",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "SWAP_ROUTER",
    "outputs": [
      {
        "internalType": "contract ISwapRouter",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "accountAddress",
            "type": "address"
          },
          {
            "components": [
              {
                "internalType": "address",
                "name": "tokenAddress",
                "type": "address"
              },
              {
                "internalType": "uint8",
                "name": "decimals",
                "type": "uint8"
              },
              {
                "internalType": "string",
                "name": "ticker",
                "type": "string"
              }
            ],
            "internalType": "struct IDCADataStructures.TokeData",
            "name": "baseToken",
            "type": "tuple"
          },
          {
            "components": [
              {
                "internalType": "address",
                "name": "tokenAddress",
                "type": "address"
              },
              {
                "internalType": "uint8",
                "name": "decimals",
                "type": "uint8"
              },
              {
                "internalType": "string",
                "name": "ticker",
                "type": "string"
              }
            ],
            "internalType": "struct IDCADataStructures.TokeData",
            "name": "targetToken",
            "type": "tuple"
          },
          {
            "internalType": "enum IDCADataStructures.Interval",
            "name": "interval",
            "type": "uint8"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "strategyId",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "active",
            "type": "bool"
          },
          {
            "components": [
              {
                "internalType": "bytes",
                "name": "reinvestData",
                "type": "bytes"
              },
              {
                "internalType": "bool",
                "name": "active",
                "type": "bool"
              },
              {
                "internalType": "uint8",
                "name": "investCode",
                "type": "uint8"
              },
              {
                "internalType": "address",
                "name": "dcaAccountAddress",
                "type": "address"
              }
            ],
            "internalType": "struct DCAReinvest.Reinvest",
            "name": "reinvest",
            "type": "tuple"
          }
        ],
        "internalType": "struct IDCADataStructures.Strategy",
        "name": "newStrategy_",
        "type": "tuple"
      },
      {
        "internalType": "uint256",
        "name": "seedFunds_",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "subscribeToExecutor_",
        "type": "bool"
      }
    ],
    "name": "SetupStrategy",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "strategyId_",
        "type": "uint256"
      }
    ],
    "name": "SubscribeStrategy",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "token_",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount_",
        "type": "uint256"
      }
    ],
    "name": "UnFundAccount",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "strategyId_",
        "type": "uint256"
      }
    ],
    "name": "UnsubscribeStrategy",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "token_",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount_",
        "type": "uint256"
      }
    ],
    "name": "WithdrawSavings",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newLibraryAddress_",
        "type": "address"
      }
    ],
    "name": "changeDCAReinvestLibrary",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "executorAddress_",
        "type": "address"
      }
    ],
    "name": "changeExecutor",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAttachedReinvestLibraryAddress",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAttachedReinvestLibraryVersion",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "token_",
        "type": "address"
      }
    ],
    "name": "getBaseBalance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "token_",
        "type": "address"
      }
    ],
    "name": "getBaseTokenCostPerBlock",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "token_",
        "type": "address"
      }
    ],
    "name": "getBaseTokenRemainingBlocks",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "strategyId_",
        "type": "uint256"
      }
    ],
    "name": "getStrategyData",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "accountAddress",
            "type": "address"
          },
          {
            "components": [
              {
                "internalType": "address",
                "name": "tokenAddress",
                "type": "address"
              },
              {
                "internalType": "uint8",
                "name": "decimals",
                "type": "uint8"
              },
              {
                "internalType": "string",
                "name": "ticker",
                "type": "string"
              }
            ],
            "internalType": "struct IDCADataStructures.TokeData",
            "name": "baseToken",
            "type": "tuple"
          },
          {
            "components": [
              {
                "internalType": "address",
                "name": "tokenAddress",
                "type": "address"
              },
              {
                "internalType": "uint8",
                "name": "decimals",
                "type": "uint8"
              },
              {
                "internalType": "string",
                "name": "ticker",
                "type": "string"
              }
            ],
            "internalType": "struct IDCADataStructures.TokeData",
            "name": "targetToken",
            "type": "tuple"
          },
          {
            "internalType": "enum IDCADataStructures.Interval",
            "name": "interval",
            "type": "uint8"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "strategyId",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "active",
            "type": "bool"
          },
          {
            "components": [
              {
                "internalType": "bytes",
                "name": "reinvestData",
                "type": "bytes"
              },
              {
                "internalType": "bool",
                "name": "active",
                "type": "bool"
              },
              {
                "internalType": "uint8",
                "name": "investCode",
                "type": "uint8"
              },
              {
                "internalType": "address",
                "name": "dcaAccountAddress",
                "type": "address"
              }
            ],
            "internalType": "struct DCAReinvest.Reinvest",
            "name": "reinvest",
            "type": "tuple"
          }
        ],
        "internalType": "struct IDCADataStructures.Strategy",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "token_",
        "type": "address"
      }
    ],
    "name": "getTargetBalance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "strategyId_",
        "type": "uint256"
      }
    ],
    "name": "getTimeTillWindow",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "lastEx",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "secondsLeft",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "checkReturn",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "removeExecutor",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "strategyId_",
        "type": "uint256"
      },
      {
        "components": [
          {
            "internalType": "bytes",
            "name": "reinvestData",
            "type": "bytes"
          },
          {
            "internalType": "bool",
            "name": "active",
            "type": "bool"
          },
          {
            "internalType": "uint8",
            "name": "investCode",
            "type": "uint8"
          },
          {
            "internalType": "address",
            "name": "dcaAccountAddress",
            "type": "address"
          }
        ],
        "internalType": "struct DCAReinvest.Reinvest",
        "name": "reinvest_",
        "type": "tuple"
      }
    ],
    "name": "setStrategyReinvest",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "swapRouter_",
        "type": "address"
      }
    ],
    "name": "updateSwapAddress",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "stateMutability": "payable",
    "type": "receive"
  }
] as const;