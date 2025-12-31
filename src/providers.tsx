"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import {
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
            <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
                {children}
            </NextThemesProvider>
        </SessionProvider>
      </QueryClientProvider>
    );
}
