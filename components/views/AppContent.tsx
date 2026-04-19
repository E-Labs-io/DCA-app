/** @format */

"use client";

import { Tabs, Tab } from "@nextui-org/react";
import { base, sepolia } from "viem/chains";
import { ACTIVE_CHAIN } from "@/constants/contracts";
import { LineChart, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
import { LoadingCard } from "../common/LoadingCard";
import { LoadingStats } from "../common/LoadingStats";
import { AppHeader } from "../ui/layout/AppHeader";
import { useDCAFactory } from "@/hooks/useDCAFactory";
import ConnectionCard from "../common/ConnectionCard";
import { useDCAProvider } from "@/providers/DCAStatsProvider";
import LoadingPage from "../common/LoadingPage";
import { TransactionStatusIndicator } from "../ui/TransactionStatusIndicator";

// Dynamically import components with proper default exports
const CreateAccountModal = dynamic(
  () =>
    import("@/components/modals/CreateAccountModal").then(
      (mod) => mod.CreateAccountModal
    ),
  {
    ssr: false,
  }
);

const CreateStrategyModal = dynamic(
  () =>
    import("@/components/modals/CreateStrategyModal").then(
      (mod) => mod.CreateStrategyModal
    ),
  {
    ssr: false,
  }
);

const AccountsView = dynamic(
  () =>
    import("@/components/views/AccountsView").then((mod) => mod.AccountsView),
  {
    ssr: false,
    loading: () => <LoadingCard />,
  }
);

const PairsView = dynamic(
  () => import("@/components/views/PairsView").then((mod) => mod.PairsView),
  {
    ssr: false,
    loading: () => <LoadingCard />,
  }
);

const StrategyView = dynamic(
  () =>
    import("@/components/views/StrategyView").then((mod) => mod.StrategyView),
  {
    ssr: false,
    loading: () => <LoadingCard />,
  }
);

const UserStatsOverview = dynamic(
  () =>
    import("@/components/ui/layout/UserStats").then(
      (mod) => mod.UserStatsOverview
    ),
  {
    ssr: false,
    loading: () => <LoadingStats />,
  }
);

export default function AppContent() {
  const { isConnected } = useAppKitAccount();
  const { chainId } = useAppKitNetwork();

  const {
    initiateUserAccounts,
    isLoading,
    selectedAccount,
    setSelectedAccount,
    ACTIVE_NETWORK,
    Signer,
    getAccountInstance,
    firstLoad,
    loadingMessage,
  } = useDCAProvider();

  const { DCAFactory } = useDCAFactory();

  const [isCreateAccountOpen, setIsCreateAccountOpen] = useState(false);
  const [isCreateStrategyOpen, setIsCreateStrategyOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [selectedView, setSelectedView] = useState("accounts");

  // Check if current network is supported by DCA contracts
  const supportedChainIds = ACTIVE_CHAIN.map(chain => {
    switch (chain) {
      case "BASE_MAINNET": return base.id;
      case "ETH_SEPOLIA": return sepolia.id;
      default: return -1;
    }
  }).filter(id => id !== -1);

  const isWrongNetwork = chainId && !supportedChainIds.includes(chainId);

  useEffect(() => {
    if (isConnected || (!isLoading && DCAFactory)) initiateUserAccounts();
  }, [isConnected, isLoading, DCAFactory, initiateUserAccounts]);

  if (!isConnected || isWrongNetwork) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <h1 className="text-3xl font-bold text-center">ÅTION CONTROL</h1>
        <ConnectionCard
          isConnected={isConnected}
          isWrongNetwork={isWrongNetwork}
          supportedNetworks={["Base", "Ethereum Sepolia"]}
        />
      </div>
    );
  }

  if (!firstLoad)
    return <LoadingPage loadingMessage={loadingMessage ?? null} />;
  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <AppHeader
          onCreateAccount={() => setIsCreateAccountOpen(true)}
          onCreateStrategy={() => setIsCreateStrategyOpen(true)}
          canCreateStrategy={!!selectedAccount}
          onShowTransactionHistory={() => setIsTransactionModalOpen(true)}
        />

        <UserStatsOverview />

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
                <span>Accounts</span>
              </div>
            }
          />
          <Tab
            key="strategies"
            title={
              <div className="flex items-center gap-2">
                <LineChart size={18} />
                <span>Strategies</span>
              </div>
            }
          />
          <Tab
            key="pairs"
            disabled={true}
            title={
              <div className="flex items-center gap-2">
                <LineChart size={18} />
                <span>Pairs</span>
              </div>
            }
          />
        </Tabs>

        {selectedView === "accounts" && (
          <AccountsView
            onAccountSelect={setSelectedAccount}
            ACTIVE_NETWORK={ACTIVE_NETWORK!}
            Signer={Signer!}
          />
        )}
        {selectedView === "pairs" && (
          <PairsView ACTIVE_NETWORK={ACTIVE_NETWORK!} Signer={Signer!} />
        )}
        {selectedView === "strategies" && (
          <StrategyView ACTIVE_NETWORK={ACTIVE_NETWORK!} Signer={Signer!} />
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
            accountAddress={getAccountInstance(selectedAccount as string)!}
            ACTIVE_NETWORK={ACTIVE_NETWORK!}
            Signer={Signer}
          />
        )}

        <TransactionStatusModal
          isOpen={isTransactionModalOpen}
          onClose={() => setIsTransactionModalOpen(false)}
        />
      </div>

      {/* Transaction status indicator */}
      <TransactionStatusIndicator />
    </div>
  );
}
