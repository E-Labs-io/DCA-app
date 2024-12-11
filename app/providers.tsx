/** @format */

"use client";

import { NextUIProvider } from "@nextui-org/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode } from "react";
import { Toaster } from "sonner";
import AppKit from "@/context/AppKit";

const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AppKit>
        <NextUIProvider>
          <NextThemesProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            forcedTheme="dark"
            disableTransitionOnChange
          >
            <Toaster richColors position="top-right" />
            {children}
          </NextThemesProvider>
        </NextUIProvider>
      </AppKit>
    </QueryClientProvider>
  );
}
