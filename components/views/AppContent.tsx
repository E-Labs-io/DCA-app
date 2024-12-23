/** @format */

"use client";

import { Tabs, Tab } from "@nextui-org/react";
import { sepolia } from "viem/chains";
import { LineChart, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
import { LoadingCard } from "../common/LoadingCard";
import { LoadingStats } from "../common/LoadingStats";
import { AppHeader } from "../ui/layout/AppHeader";
import { useDCAFactory } from "@/hooks/useDCAFactory";
import ConnectionCard from "../common/ConnectionCard";
import { useDCAProvider } from "@/lib/providers/DCAStatsProvider";

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
  } = useDCAProvider();

  const { DCAFactory } = useDCAFactory();

  const [isCreateAccountOpen, setIsCreateAccountOpen] = useState(false);
  const [isCreateStrategyOpen, setIsCreateStrategyOpen] = useState(false);
  const [selectedView, setSelectedView] = useState("accounts");

  const isWrongNetwork = chainId !== sepolia.id;

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
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <AppHeader
          onCreateAccount={() => setIsCreateAccountOpen(true)}
          onCreateStrategy={() => setIsCreateStrategyOpen(true)}
          canCreateStrategy={!!selectedAccount}
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
            accountAddress={selectedAccount as string}
            ACTIVE_NETWORK={ACTIVE_NETWORK!}
          />
        )}
      </div>
    </div>
  );
}
