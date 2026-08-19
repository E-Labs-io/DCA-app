/** @format */

"use client";

import { NetworkKeys } from "@/types";
import { Card, CardBody } from "@nextui-org/react";
import { Signer } from "ethers";

export interface PairsViewProps {
  ACTIVE_NETWORK: NetworkKeys;
  Signer: Signer;
}

export function PairsView({ ACTIVE_NETWORK, Signer }: PairsViewProps) {
  return (
    <div className="grid grid-cols-1 gap-6">
      <Card className="w-full">
        <CardBody className="text-center py-8">
          <p className="text-gray-400">Pair analytics are coming soon.</p>
        </CardBody>
      </Card>
    </div>
  );
}
