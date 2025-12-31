"use client";

import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { ReactNode } from "react";
import { PageTransition } from "../PageTransition";
import { useTransactionsWS } from "@/hook/useTransactionWS";
import { useSession } from "next-auth/react";

export function Shell({ children }: { children: ReactNode }) {
  const session = useSession();
  const telegramId = session?.data?.user?.telegram_id;
  const accountId = session?.data?.user?.account_id;
  useTransactionsWS(telegramId, accountId);
    return (
        <div className="flex h-screen w-full bg-background/50 text-foreground overflow-hidden">
            <div className="hidden md:flex h-full shrink-0">
                <Sidebar className="w-64" />
            </div>
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8">
                    <PageTransition>
                        <div className="container mx-auto max-w-6xl space-y-8 pb-10">
                            {children}
                        </div>
                    </PageTransition>
                </main>
            </div>
        </div>
    );
}
