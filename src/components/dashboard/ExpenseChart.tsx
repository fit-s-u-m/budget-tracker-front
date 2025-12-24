"use client";

import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useMemo, useEffect, useState } from "react";

const COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1']; // Updated palette

export function ExpenseChart() {
    const transactions = useStore((state) => state.transactions);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const data = useMemo(() => {
        const expenses = transactions.filter(t => t.type === 'expense');
        const grouped = expenses.reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(grouped).map(([name, value]) => ({ name, value }));
    }, [transactions]);

    if (!mounted) return (
        <Card className="h-full min-h-[400px]">
            <CardHeader>
                <div className="h-6 w-32 bg-muted rounded animate-pulse mb-2"></div>
                <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
                <div className="w-full h-64 bg-muted/20 rounded-full animate-pulse"></div>
            </CardContent>
        </Card>
    );

    return (
        <Card className="h-full min-h-[400px] border-none shadow-sm">
            <CardHeader>
                <CardTitle>Expense Breakdown</CardTitle>
                <CardDescription>Spending by category</CardDescription>
            </CardHeader>
            <CardContent>
                {data.length > 0 ? (
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={4}
                                    dataKey="value"
                                    cornerRadius={6}
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value: any) => `$${Number(value).toFixed(2)}`}
                                    contentStyle={{
                                        borderRadius: '8px',
                                        border: '1px solid var(--border)',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                        backgroundColor: 'var(--background)',
                                        color: 'var(--foreground)'
                                    }}
                                    itemStyle={{ color: 'inherit' }}
                                />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                        <p>No expense data to display</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
