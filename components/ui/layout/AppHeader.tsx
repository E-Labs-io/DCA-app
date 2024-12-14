/** @format */

"use client";

import { Button } from "@nextui-org/react";
import { PlusCircle, Settings } from "lucide-react";

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
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
      <h1 className="text-3xl font-bold">ATION CONTROL</h1>
      <div className="flex gap-4">
        <appkit-account-button />
        <Button
          color="primary"
          startContent={<PlusCircle size={20} />}
          onPress={onCreateAccount}
        >
          Create Account
        </Button>
        <Button
          color="secondary"
          startContent={<Settings size={20} />}
          onPress={onCreateStrategy}
          isDisabled={!canCreateStrategy}
        >
          New Strategy
        </Button>
      </div>
    </div>
  );
}
