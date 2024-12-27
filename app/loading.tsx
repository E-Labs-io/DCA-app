/** @format */

import React from "react";
import LoadingPage from "../components/common/LoadingPage";

export interface LoadingProps {
  loadingMessage?: string | null;
}

export default function Loading({ loadingMessage }: LoadingProps) {
  console.log("Loading Page Mounted");
  return <LoadingPage loadingMessage={loadingMessage} />;
}
