"use client";

import { useStore } from "@/lib/store";
import { useEffect, useState, useMemo } from "react";
import { Plus, Search, MoreVertical, Edit, Trash } from "lucide-react";
import { TransactionForm } from "@/components/transactions/TransactionForm";
import { Transaction } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useDebounce } from "@/hook/useDebounce";
import { useSession } from "next-auth/react";
import {searchTransactions} from "@/lib/api";
import {format} from "date-fns";

export default function TransactionsPage() {
    const { data: session } = useSession();
    const telegramId = session?.user.telegram_id;

    const { transactions, removeTransaction } = useStore();
    const [mounted, setMounted] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

    const [filterValue, setFilterValue] = useState("");
    const debouncedSearch = useDebounce(filterValue);
    const [loading, setLoading] = useState(false);
    const [fetchedTransactions, setFilteredTransactions] = useState<Transaction[]>([]);

    useEffect(() => {
        if (!telegramId) return;
        const controller = new AbortController();

        async function load() {
          setLoading(true);
          try {
            const res = await searchTransactions({
              telegramId:telegramId || "",
              text: debouncedSearch || undefined,
              limit: 10,
            });

            if (!controller.signal.aborted) {
              setFilteredTransactions(res);
            }
          } catch (err) {
            if (!controller.signal.aborted) {
              console.error(err);
            }
          } finally {
            if (!controller.signal.aborted) {
              setLoading(false);
            }
          }
        }

        load();

        return () => controller.abort();
     }, [debouncedSearch, telegramId]);

    useEffect(() => setMounted(true), []);

    const handleEdit = (item: Transaction) => {
        setEditingTransaction(item);
        setIsFormOpen(true);
    };

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this transaction?")) {
            removeTransaction(id);
        }
    };

    const handleAdd = () => {
        setEditingTransaction(null);
        setIsFormOpen(true);
    };

    const handleClose = () => {
        setEditingTransaction(null);
        setIsFormOpen(false);
    }

    if (!mounted) return (
        <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Transactions</h2>
                    <p className="text-muted-foreground">Manage and track your financial activity.</p>
                </div>
                <Button onClick={handleAdd}>
                    <Plus className="mr-2 h-4 w-4" /> Add Transaction
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search transactions..."
                                className="pl-9"
                                value={filterValue}
                                onChange={(e) => setFilterValue(e.target.value)}
                            />

                            {
                              loading && (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                              )
                            }
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead className="w-12.5"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {fetchedTransactions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            No results.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    fetchedTransactions.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium capitalize">{item.description}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{item.category ?? "other"}</Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm">
                                              {
                                                item.date == null ? 'N/A' :(
                                                <>
                                                  <span className="sm:hidden">{format(item.date, "dd/MMM/yyyy")}</span>
                                                  <span className="hidden sm:inline lg:hidden">{format(item.date, "HH:mm dd/MMM/yyyy")}</span>
                                                  <span className="hidden lg:inline">{format(item.date, "hh:mm ccc dd/MMM/yyyy BBBB")}</span>
                                                </>
                                                )
                                              }
                                            </TableCell>
                                            <TableCell className={`text-right font-medium ${item.type === 'credit' ? 'text-green-600' : 'text-expense-foreground'}`}>
                                                {item.type === 'debit' ? '+' : '-'}${Math.abs(item.amount).toFixed(2)}
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Open menu</span>
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleEdit(item)}>
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleDelete(item.id)} className="text-red-600">
                                                            <Trash className="mr-2 h-4 w-4" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <TransactionForm isOpen={isFormOpen} onClose={handleClose} initialData={editingTransaction} />
        </div>
    );
}
