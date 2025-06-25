/** @format */

import { Card, CardBody, CardHeader } from "@nextui-org/react";

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
      <Card className="w-full max-w-md">
        {!isConnected && (
          <CardBody className="flex flex-col items-center gap-4 p-8">
            <h1 className="text-2xl font-bold mb-4">Connect Wallet</h1>
            <p className="text-center text-gray-400 mb-6">
              Please connect your wallet to access the Ation Control
            </p>
            <appkit-button />
          </CardBody>
        )}
        {isConnected && isWrongNetwork && (
          <CardBody className="flex flex-col items-center gap-4 p-8">
            <h1 className="text-2xl font-bold mb-4">Wrong Network</h1>
            <p className="text-center text-gray-400 mb-6">
              Ation Control is only available on the Base network. Please switch
              to the Base network to continue.
            </p>
            <appkit-network-button />
          </CardBody>
        )}
      </Card>
    </div>
  );
}
