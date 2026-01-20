"use client";

import { useEffect, useState } from "react";
import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { ExpenseChart } from "@/components/dashboard/ExpenseChart";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { useSession } from "next-auth/react";
import { useTransactions, useUser } from "@/hook/useBudget";

export default function DashboardPage() {
  const session = useSession()?.data;
  // const {isLoading, error } = useStore();

  const userId = session?.user.user_id;

  const transactions = useTransactions(userId)?.data || []
  const balance = useUser(userId)?.data?.balance || 0;

  const [mounted, setMounted] = useState(false);


  const income = transactions.filter(t => t.type === 'credit').reduce((acc, t) => acc + t.amount, 0);
  const expense = transactions.filter(t => t.type === 'debit').reduce((acc, t) => acc + t.amount, 0);

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
