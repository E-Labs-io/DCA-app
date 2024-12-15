"use client";

import { Card, CardBody } from "@nextui-org/react";

export function LoadingStats() {
  return (
    <Card className="mb-8">
      <CardBody>
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-600 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-600 rounded"></div>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}