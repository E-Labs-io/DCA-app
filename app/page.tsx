/** @format */

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { Card, CardBody } from "@nextui-org/react";

// Dynamically import the main app component to avoid hydration issues
const AppContent = dynamic(() => import("@/components/views/AppContent"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <Card>
        <CardBody className="h-24 animate-pulse" />
      </Card>
    </div>
  ),
});

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AppContent />
    </Suspense>
  );
}
