'use client';

import { Card, CardBody, ButtonGroup } from '@nextui-org/react';
import { Settings, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import { useAccountStats } from '@/hooks/useAccountStats';
import { useAccountStore } from '@/lib/store/accountStore';
import { useState } from 'react';
import { AccountAnalytics } from './AccountAnalytics';
import { StrategyList } from './StrategyList';

interface AccountsViewProps {
  onAccountSelect: (address: string) => void;
}

export function AccountsView({ onAccountSelect }: AccountsViewProps) {
  const { accountsWithStrategies, isLoading } = useAccountStats();
  const selectedAccount = useAccountStore((state) => state.selectedAccount);
  const setSelectedAccount = useAccountStore((state) => state.setSelectedAccount);
  const [expandedAccount, setExpandedAccount] = useState<string | null>(null);

  const handleAccountClick = (address: string) => {
    if (expandedAccount === address) {
      setExpandedAccount(null);
      setSelectedAccount('');
    } else {
      setExpandedAccount(address);
      setSelectedAccount(address);
      onAccountSelect(address);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6">
        {[1, 2].map((i) => (
          <Card key={i} className="w-full animate-pulse">
            <CardBody className="h-24" />
          </Card>
        ))}
      </div>
    );
  }

  if (!accountsWithStrategies.length) {
    return (
      <Card>
        <CardBody className="text-center py-8">
          <p className="text-gray-400">No DCA accounts found. Create your first account to get started!</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      {accountsWithStrategies.map((account) => (
        <div key={account.account}>
          <Card 
            className={`w-full transition-all duration-200 ${
              selectedAccount === account.account 
                ? 'border-2 border-primary shadow-lg' 
                : 'hover:scale-[1.01]'
            }`}
            isPressable
            onPress={() => handleAccountClick(account.account)}
          >
            <CardBody>
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {`${account.account.slice(0, 6)}...${account.account.slice(-4)}`}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {account.strategies?.length || 0} Active Strategies
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <ButtonGroup>
                      <div className="flex gap-2">
                        <div
                          className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg hover:bg-default-100 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Add manage functionality
                          }}
                        >
                          <Settings size={18} />
                          <span>Manage</span>
                        </div>
                        <div
                          className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg hover:bg-default-100 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Add analytics functionality
                          }}
                        >
                          <TrendingUp size={18} />
                          <span>Analytics</span>
                        </div>
                      </div>
                    </ButtonGroup>
                    {expandedAccount === account.account ? (
                      <ChevronUp size={20} />
                    ) : (
                      <ChevronDown size={20} />
                    )}
                  </div>
                </div>

                {expandedAccount === account.account && (
                  <div className="mt-4 space-y-6 border-t pt-4">
                    <AccountAnalytics accountAddress={account.account} />
                    <StrategyList 
                      accountAddress={account.account}
                      strategies={Array.isArray(account.strategies) ? account.strategies : []}
                    />
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </div>
      ))}
    </div>
  );
}