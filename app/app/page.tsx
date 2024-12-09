'use client';

import { Card, CardBody, Button, Tabs, Tab } from '@nextui-org/react';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { sepolia } from 'viem/chains';
import { PlusCircle, LineChart, Settings } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';

const CreateAccountModal = dynamic(() => import('@/components/modals/CreateAccountModal').then(mod => ({ default: mod.CreateAccountModal })), {
  ssr: false,
  loading: () => null
});

const CreateStrategyModal = dynamic(() => import('@/components/modals/CreateStrategyModal').then(mod => ({ default: mod.CreateStrategyModal })), {
  ssr: false,
  loading: () => null
});

const AccountsView = dynamic(() => import('@/components/views/AccountsView').then(mod => ({ default: mod.AccountsView })), {
  ssr: false,
  loading: () => <Card><CardBody className="h-24 animate-pulse" /></Card>
});

const PairsView = dynamic(() => import('@/components/views/PairsView').then(mod => ({ default: mod.PairsView })), {
  ssr: false,
  loading: () => <Card><CardBody className="h-24 animate-pulse" /></Card>
});

const StatsOverview = dynamic(() => import('@/components/StatsOverview'), {
  ssr: false,
  loading: () => (
    <Card className="mb-8">
      <CardBody>
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-600 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-600 rounded"></div>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  ),
});

export default function AppPage() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const [isCreateAccountOpen, setIsCreateAccountOpen] = useState(false);
  const [isCreateStrategyOpen, setIsCreateStrategyOpen] = useState(false);
  const [selectedView, setSelectedView] = useState('accounts');
  const [selectedAccount, setSelectedAccount] = useState('');

  const isWrongNetwork = chainId !== sepolia.id;

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardBody className="flex flex-col items-center gap-4 p-8">
            <h1 className="text-2xl font-bold mb-4">Connect Wallet</h1>
            <p className="text-center text-gray-400 mb-6">
              Please connect your wallet to access the DCA Protocol
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (isWrongNetwork) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardBody className="flex flex-col items-center gap-4 p-8">
            <h1 className="text-2xl font-bold mb-4">Wrong Network</h1>
            <p className="text-center text-gray-400 mb-6">
              Please switch to Sepolia network to use the DCA Protocol
            </p>
            <Button 
              color="primary"
              size="lg"
              onPress={() => {
                try {
                  switchChain({ chainId: sepolia.id });
                } catch (error) {
                  toast.error('Failed to switch network. Please try manually.');
                }
              }}
            >
              Switch to Sepolia
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold">DCA Protocol</h1>
          <div className="flex gap-4">
            <Button
              color="primary"
              startContent={<PlusCircle size={20} />}
              onPress={() => setIsCreateAccountOpen(true)}
            >
              Create Account
            </Button>
            <Button
              color="secondary"
              startContent={<Settings size={20} />}
              onPress={() => setIsCreateStrategyOpen(true)}
              isDisabled={!selectedAccount}
            >
              New Strategy
            </Button>
          </div>
        </div>

        <StatsOverview />

        <Tabs 
          selectedKey={selectedView}
          onSelectionChange={(key) => setSelectedView(key.toString())}
          className="mb-8"
        >
          <Tab
            key="accounts"
            title={
              <div className="flex items-center gap-2">
                <Settings size={18} />
                <span>By Accounts</span>
              </div>
            }
          />
          <Tab
            key="pairs"
            title={
              <div className="flex items-center gap-2">
                <LineChart size={18} />
                <span>By Pairs</span>
              </div>
            }
          />
        </Tabs>

        {selectedView === 'accounts' ? (
          <AccountsView onAccountSelect={setSelectedAccount} />
        ) : (
          <PairsView />
        )}

        {isCreateAccountOpen && (
          <CreateAccountModal 
            isOpen={isCreateAccountOpen} 
            onClose={() => setIsCreateAccountOpen(false)} 
          />
        )}
        
        {isCreateStrategyOpen && selectedAccount && (
          <CreateStrategyModal 
            isOpen={isCreateStrategyOpen} 
            onClose={() => setIsCreateStrategyOpen(false)}
            accountAddress={selectedAccount}
          />
        )}
      </div>
    </div>
  );
}