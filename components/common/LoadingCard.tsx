"use client";

import { Card, CardBody } from "@nextui-org/react";

export function LoadingCard() {
  return (
    <Card>
      <CardBody className="h-24 animate-pulse" />
    </Card>
  );
}