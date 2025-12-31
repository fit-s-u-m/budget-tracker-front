"use client";

import { useStore } from "@/lib/store";
import { useEffect, useState } from "react";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useTransactions } from "@/hook/useBudget";
import { useSession } from "next-auth/react";

export function RecentTransactions() {
    // const transactions = useStore((state) => state.transactions);
    const [mounted, setMounted] = useState(false);
    const { data: session } = useSession();
    const telegramId = session?.user.telegram_id;
    const transactions = useTransactions(telegramId).data

    useEffect(() => setMounted(true), []);

    const recent = mounted && transactions
        ? [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5)
        : [];

    if (!mounted) return <div className="h-64 bg-muted rounded-xl animate-pulse" />;

    return (
        <Card className="border-none shadow-sm">
            <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Description</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {recent.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center text-muted-foreground h-24">
                                    No recent transactions
                                </TableCell>
                            </TableRow>
                        ) : (
                            recent.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium capitalize">{item.description}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="font-normal">{item.category}</Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">{item.date}</TableCell>
                                    <TableCell className={`text-right font-medium ${item.type === 'credit' ? 'text-green-600 dark:text-green-500' : 'text-expense'}`}>
                                        {item.type === 'credit' ? '+' : '-'}${Math.abs(item.amount).toFixed(2)}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
