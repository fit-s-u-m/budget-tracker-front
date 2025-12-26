"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { transactionSchema, TransactionFormData } from "@/lib/schema";
import { Transaction } from "@/lib/types";
import { useStore } from "@/lib/store";
import { useEffect } from "react";
import { CATEGORIES } from "@/lib/constants";
import { useSession } from "next-auth/react";

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface TransactionFormProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: Transaction | null;
}

export function TransactionForm({ isOpen, onClose, initialData }: TransactionFormProps) {
    const { data: session } = useSession();
    const { addTransaction, editTransaction } = useStore();

    const form = useForm<TransactionFormData>({
        resolver: zodResolver(transactionSchema) as any,
        defaultValues: {
            amount: 0,
            description: "",
            category: "Miscellaneous",
            type: "income",
            date: new Date().toISOString().split('T')[0],
        }
    });

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                form.reset({
                    amount: initialData.amount,
                    description: initialData.description,
                    category: initialData.category,
                    type: initialData.type,
                    date: initialData.date,
                });
            } else {
                form.reset({
                    amount: 0,
                    description: "From ...",
                    category: "Other",
                    type: "expense",
                    date: new Date().toISOString().split('T')[0],
                });
            }
        }
    }, [initialData, isOpen, form]);

    const onSubmit = async (data: TransactionFormData) => {
        if (initialData) {
            editTransaction({ ...initialData, ...data, category: data.category as any });
        } else if (session?.user?.telegram_id && session?.user?.account_id) {
            await addTransaction(
                { ...data, category: data.category as any },
                session.user.telegram_id,
                session.user.account_id
            );
        }
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <Form {...form}>
                <DialogContent className="sm:max-w-106.25 bg-background">
                    <DialogHeader>
                        <DialogTitle>{initialData ? "Edit Transaction" : "New Transaction"}</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormLabel>Transaction Type</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className="flex space-x-4"
                                        >
                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="income" />
                                                </FormControl>
                                                <FormLabel className="font-normal text-green-600">
                                                    Income
                                                </FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="expense" />
                                                </FormControl>
                                                <FormLabel className="font-normal text-red-600">
                                                    Expense
                                                </FormLabel>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Grocery Shopping" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Amount</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                                            <Input type="number" className="pl-7" {...field} />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <FormItem >
                                    <FormLabel>Category</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a category" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="z-1000 bg-gray-100">
                                            {CATEGORIES.map((cat) => (
                                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Date</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" className="cursor-pointer hover:border-red-300 hover:bg-red-300" variant="outline" onClick={onClose}>Cancel</Button>
                            <Button type="submit" className="cursor-pointer hover:bg-gray-400">{initialData ? "Save Changes" : "Add Transaction"}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Form>
        </Dialog>
    );
}
