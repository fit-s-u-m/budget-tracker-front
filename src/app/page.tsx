"use client";

import { useEffect, useState } from "react";
import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { ExpenseChart } from "@/components/dashboard/ExpenseChart";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { useSession } from "next-auth/react";
import { useTransactions,useBalance } from "@/hook/useBudget";

export default function DashboardPage() {
  const session = useSession()?.data;
  // const {isLoading, error } = useStore();

  const telegramId = session?.user.telegram_id;
  const accountId = session?.user.account_id;

  const transactions = useTransactions(telegramId)?.data || []
  const balance = useBalance(telegramId,accountId)?.data?.balance || 0;

  const [mounted, setMounted] = useState(false);


  const income = transactions.filter(t => t.type === 'credit').reduce((acc, t) => acc + t.amount, 0);
  const expense = transactions.filter(t => t.type === 'debit').reduce((acc, t) => acc + t.amount, 0);

  // if (!mounted || isLoading) return (
  //   <div className="p-8 flex justify-center">
  //     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  //   </div>
  // );
  //
  // if (error) return (
  //   <div className="p-8 text-center text-red-500">
  //     <p>Error loading dashboard: {error}</p>
  //     <button
  //       onClick={() => {
  //         // TODO: write retry logic
  //       }}
  //       className="mt-4 px-4 py-2 bg-primary text-white rounded"
  //     >
  //       Retry
  //     </button>
  //   </div>
  // );

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-default-500">Overview of your financial health.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard title="Total Balance" amount={balance} type="balance" />
        <SummaryCard title="Total Income" amount={income} type="credit" />
        <SummaryCard title="Total Expenses" amount={expense} type="debit" />
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
