/** @format */

"use client";

import { Button } from "@nextui-org/react";
import { PlusCircle, Settings, Shield } from "lucide-react";
import { useAppKitAccount } from "@reown/appkit/react";
import { useExecutorAdmin } from "@/hooks/useExecutorAdmin";
import { useEffect, useState } from "react";
import Link from "next/link";

interface AppHeaderProps {
  onCreateAccount: () => void;
  onCreateStrategy: () => void;
  canCreateStrategy: boolean;
}

export function AppHeader({
  onCreateAccount,
  onCreateStrategy,
  canCreateStrategy,
}: AppHeaderProps) {
  const { address, isConnected } = useAppKitAccount();
  const { checkIfAdminOrOwner } = useExecutorAdmin();
  const [hasAdminAccess, setHasAdminAccess] = useState(false);

  useEffect(() => {
    async function checkAdminStatus() {
      if (!address || !isConnected) {
        setHasAdminAccess(false);
        return;
      }

      try {
        const accessStatus = await checkIfAdminOrOwner(address);
        setHasAdminAccess(accessStatus.hasAccess);
      } catch (error) {
        console.error("Error checking admin/owner status:", error);
        setHasAdminAccess(false);
      }
    }

    checkAdminStatus();
  }, [address, isConnected, checkIfAdminOrOwner]);

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
      <h1 className="text-3xl font-bold">ATION CONTROL</h1>
      <div className="flex gap-4">
        <appkit-account-button />
        {hasAdminAccess && (
          <Button
            as={Link}
            href="/dashboard"
            color="warning"
            variant="solid"
            startContent={<Shield size={20} />}
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium"
          >
            Admin Dashboard
          </Button>
        )}
        <Button
          color="primary"
          variant="solid"
          startContent={<PlusCircle size={20} />}
          onPress={onCreateAccount}
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium"
        >
          Create Account
        </Button>
        <Button
          color="secondary"
          variant="solid"
          startContent={<Settings size={20} />}
          onPress={onCreateStrategy}
          isDisabled={!canCreateStrategy}
          className="bg-purple-500 hover:bg-purple-600 text-white font-medium disabled:opacity-50"
        >
          New Strategy
        </Button>
      </div>
    </div>
  );
}
