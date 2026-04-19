/** @format */

import { Suspense } from "react";
import dynamic from "next/dynamic";
import LoadingPage from "@/components/common/LoadingPage";

// Dynamically import the main app component to avoid hydration issues
const AppContent = dynamic(() => import("@/components/views/AppContent"), {
  ssr: false,
  loading: () => <LoadingPage />,
});

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AppContent />
    </Suspense>
  );
}
