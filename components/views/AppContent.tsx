/** @format */

"use client";

import { Card, CardBody, Button, Tabs, Tab } from "@nextui-org/react";
import { sepolia } from "viem/chains";
import { PlusCircle, LineChart, Settings } from "lucide-react";
import { useState } from "react";
import dynamic from "next/dynamic";
import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
import WalletButton from "../common/WalletButton";
import { NetworkConnect } from "../common/NetworkConnect";
import { LoadingCard } from "../ui/LoadingCard";
import { LoadingStats } from "../ui/LoadingStats";
import { AppHeader } from "../ui/layout/AppHeader";

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

const StatsOverview = dynamic(
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

  const [isCreateAccountOpen, setIsCreateAccountOpen] = useState(false);
  const [isCreateStrategyOpen, setIsCreateStrategyOpen] = useState(false);
  const [selectedView, setSelectedView] = useState("accounts");
  const [selectedAccount, setSelectedAccount] = useState("");

  const isWrongNetwork = chainId !== sepolia.id;

  if (!isConnected) {
    return <WalletButton />;
  }

  if (isWrongNetwork) {
    return <NetworkConnect />;
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <AppHeader
          onCreateAccount={() => setIsCreateAccountOpen(true)}
          onCreateStrategy={() => setIsCreateStrategyOpen(true)}
          canCreateStrategy={!!selectedAccount}
        />

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
            title={
              <div className="flex items-center gap-2">
                <LineChart size={18} />
                <span>Pairs</span>
              </div>
            }
          />
        </Tabs>

        {selectedView === "accounts" && (
          <AccountsView onAccountSelect={setSelectedAccount} />
        )}
        {selectedView === "pairs" && <PairsView />}
        {selectedView === "strategies" && <StrategyView />}

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