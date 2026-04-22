/** @format */

"use client";

import React from "react";
import { Card, CardBody, CardHeader, Divider } from "@nextui-org/react";
import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
import { base, baseSepolia, optimism, optimismSepolia, sepolia } from "viem/chains";
import { ACTIVE_CHAIN } from "@/constants/contracts";
import { AdminGuard } from "@/components/ui/admin/AdminGuard";
import { ExecutorControls } from "@/components/ui/admin/ExecutorControls";
import { FactoryControls } from "@/components/ui/admin/FactoryControls";
import { SystemMetrics } from "@/components/ui/admin/SystemMetrics";
import { AdminPanel } from "@/components/ui/admin/AdminPanel";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

export default function AdminDashboard() {
  const { address, isConnected } = useAppKitAccount();
  const { chainId } = useAppKitNetwork();

  // Check if current network is supported by DCA contracts.
  // Keep in sync with ACTIVE_CHAIN in constants/contracts.ts.
  const supportedChainIds = ACTIVE_CHAIN.map((chain) => {
    switch (chain) {
      case "BASE_MAINNET": return base.id;
      case "BASE_SEPOLIA": return baseSepolia.id;
      case "OPT_MAINNET": return optimism.id;
      case "OPT_SEPOLIA": return optimismSepolia.id;
      case "ETH_SEPOLIA": return sepolia.id;
      default: return -1;
    }
  }).filter((id) => id !== -1);

  const chainIdNum = typeof chainId === "string" ? Number(chainId) : chainId;
  const isWrongNetwork =
    chainIdNum !== undefined && !supportedChainIds.includes(chainIdNum as never);

  // Handle not connected state
  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardBody className="flex flex-col items-center gap-4 p-8">
            <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
            <p className="text-center text-gray-500 mb-6">
              Please connect your wallet to access the admin dashboard.
            </p>
            <appkit-button />
          </CardBody>
        </Card>
      </div>
    );
  }

  // Handle wrong network state
  if (isWrongNetwork) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardBody className="flex flex-col items-center gap-4 p-8">
            <h1 className="text-2xl font-bold mb-4">Wrong Network</h1>
            <p className="text-center text-gray-500 mb-6">
              Admin dashboard is only available on Base network. Please switch
              to Base network to continue.
            </p>
            <appkit-network-button />
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <AdminGuard userAddress={address}>
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            DCA System Admin Dashboard
          </h1>
          <p className="text-gray-500">
            Control and monitor the DCA Factory and Executor contracts
          </p>
          <div className="flex items-center gap-2 mt-2">
            <p className="text-sm text-blue-500">Connected as: {address}</p>
            <appkit-account-button />
          </div>
        </div>

        {/* System Metrics */}
        <SystemMetrics />

        <Divider />

        {/* Contract Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Each admin card is isolated — if one RPC call in
              FactoryControls throws during render, we don't lose the
              ExecutorControls pane too. Critical during an incident
              when the pause button is what you're reaching for. */}
          <ErrorBoundary label="FactoryControls">
            <FactoryControls />
          </ErrorBoundary>

          <ErrorBoundary label="ExecutorControls">
            <ExecutorControls />
          </ErrorBoundary>
        </div>

        <Divider />

        <ErrorBoundary label="AdminPanel">
          <AdminPanel />
        </ErrorBoundary>
      </div>
    </AdminGuard>
  );
}
