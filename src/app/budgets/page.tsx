"use client";

import { useStore } from "@/lib/store";
import { BudgetCard } from "@/components/budgets/BudgetCard";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useTransactions, useCategoies } from "@/hook/useBudget";

export default function BudgetsPage() {
  const { budgets } = useStore();

  const { data: session } = useSession();
  const userId = session?.user.user_id;
  const transactions = useTransactions(userId).data
  const categories = useCategoies().data

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return (
    <div className="p-8 flex justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const spending = transactions ? transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear && t.type === 'debit';
  })
    .map(t => ({ ...t, category: t.category.toLowerCase() }))
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>) : {};
  console.log({ budgets, spending, transactions });

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold tracking-tight">Monthly Budgets</h2>
        <p className="text-default-500">Track your spending limits for {new Date().toLocaleString('default', { month: 'long' })} {currentYear}.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories ? categories.map(cat => {
          const budget = budgets.find(b => b.category.toLowerCase() === cat.name.toLowerCase()) || { category: cat.name, limit: 0 };
          const spent = spending[cat.name.toLowerCase()] || 0;
          return (
            <BudgetCard key={cat.name} budget={budget} spent={spent} />
          );
        }) : <div>loading</div>}
      </div>
    </div>
  );
}
