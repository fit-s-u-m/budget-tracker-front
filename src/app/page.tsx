"use client";

import { useStore } from "@/lib/store";
import { useEffect, useState } from "react";
import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { ExpenseChart } from "@/components/dashboard/ExpenseChart";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { useSession } from "next-auth/react";

export default function DashboardPage() {
  const sessionResult = useSession();
  const session = sessionResult?.data;
  const { transactions, balance: storeBalance, fetchInitialData, isLoading, error } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (session?.user?.telegram_id && session?.user?.account_id) {
      fetchInitialData(session.user.telegram_id, session.user.account_id);
    }
  }, [fetchInitialData, session]);

  const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  // Use balance from store if available, otherwise calculate from fetched transactions
  const balance = storeBalance || (income - expense);

  if (!mounted || isLoading) return (
    <div className="p-8 flex justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );

  if (error) return (
    <div className="p-8 text-center text-red-500">
      <p>Error loading dashboard: {error}</p>
      <button
        onClick={() => {
          if (session?.user?.telegram_id && session?.user?.account_id) {
            fetchInitialData(session.user.telegram_id, session.user.account_id);
          }
        }}
        className="mt-4 px-4 py-2 bg-primary text-white rounded"
      >
        Retry
      </button>
    </div>
  );

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-default-500">Overview of your financial health.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard title="Total Balance" amount={balance} type="balance" />
        <SummaryCard title="Total Income" amount={income} type="income" />
        <SummaryCard title="Total Expenses" amount={expense} type="expense" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="h-full">
          <ExpenseChart />
        </div>
        <div className="h-full">
          <RecentTransactions />
        </div>
      </div>
    </div>
  );
}
