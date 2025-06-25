/** @format */

"use client";

import { Card, CardBody } from "@nextui-org/react";

export function NetworkConnect() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardBody className="flex flex-col items-center gap-4 p-8">
          <h1 className="text-2xl font-bold mb-4">Wrong Network</h1>
          <p className="text-center text-gray-400 mb-6">
            Ation Control is currently only available on Base Mainnet.
          </p>
          <appkit-network-button />
        </CardBody>
      </Card>
    </div>
  );
}
