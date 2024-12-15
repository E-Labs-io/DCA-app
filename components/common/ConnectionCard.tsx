/** @format */

import { Card, CardBody, CardHeader } from "@nextui-org/react";
import WalletButton from "./WalletButton";
import { NetworkConnect } from "./NetworkConnect";

interface ConnectionCardProps {
  isConnected: boolean;
  isWrongNetwork: boolean;
}

export default function ConnectionCard({
  isConnected,
  isWrongNetwork,
}: ConnectionCardProps) {
  return (
    <div className="flex justify-center items-center h-screen">
      <Card className="w-[40%] max-w-md">
        <CardHeader>
          <h1 className="text-2xl font-bold">Connect Your Wallet</h1>
        </CardHeader>
        <CardBody>
          {!isConnected && <WalletButton />}
          {isWrongNetwork && <NetworkConnect />}
        </CardBody>
      </Card>
    </div>
  );
}
