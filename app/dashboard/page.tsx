/** @format */

"use client";

import React from "react";
import { Card, CardBody, CardHeader, Divider } from "@nextui-org/react";
import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
import { base } from "viem/chains";
import { AdminGuard } from "@/components/ui/admin/AdminGuard";
import { ExecutorControls } from "@/components/ui/admin/ExecutorControls";
import { FactoryControls } from "@/components/ui/admin/FactoryControls";
import { SystemMetrics } from "@/components/ui/admin/SystemMetrics";
import { AdminPanel } from "@/components/ui/admin/AdminPanel";

export default function AdminDashboard() {
  const { address, isConnected } = useAppKitAccount();
  const { chainId } = useAppKitNetwork();

  const isWrongNetwork = chainId !== base.id;

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
          {/* DCA Factory Controls */}
          <FactoryControls />

          {/* DCA Executor Controls */}
          <ExecutorControls />
        </div>

        <Divider />

        {/* Admin Management */}
        <AdminPanel />
      </div>
    </AdminGuard>
  );
}
