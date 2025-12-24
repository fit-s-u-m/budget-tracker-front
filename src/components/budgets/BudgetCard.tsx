"use client";

import { Budget } from "@/lib/types";
import { Edit } from "lucide-react";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BudgetCardProps {
    budget: Budget;
    spent: number;
}

export function BudgetCard({ budget, spent }: BudgetCardProps) {
    const { updateBudget } = useStore();
    const [isOpen, setIsOpen] = useState(false);
    const [limit, setLimit] = useState(budget.limit.toString());

    const percentage = budget.limit > 0 ? Math.min((spent / budget.limit) * 100, 100) : (spent > 0 ? 100 : 0);
    const isExceeded = budget.limit > 0 && spent > budget.limit;

    const handleSave = () => {
        updateBudget({ ...budget, limit: parseFloat(limit) || 0 });
        setIsOpen(false);
    };

    return (
        <>
            <Card className={`overflow-hidden transition-all duration-300 hover:shadow-md ${isExceeded ? 'border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20' : ''}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        {budget.category}
                    </CardTitle>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(true)}>
                        <Edit className="h-4 w-4 text-muted-foreground" />
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-between items-baseline mb-2">
                        <div className="text-2xl font-bold">${spent.toFixed(0)}</div>
                        <div className="text-xs text-muted-foreground">of ${budget.limit.toFixed(0)}</div>
                    </div>
                    <Progress
                        value={percentage}
                        className={`h-2 ${isExceeded ? 'bg-red-200 [&>div]:bg-red-600' : ''}`}
                    />
                    <p className={`text-xs mt-2 ${isExceeded ? 'text-red-600 font-semibold' : 'text-muted-foreground'}`}>
                        {isExceeded ? 'Budget Exceeded!' : `${percentage.toFixed(0)}% used`}
                    </p>
                </CardContent>
            </Card>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit Budget • {budget.category}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="limit" className="text-right">
                                Limit
                            </Label>
                            <div className="col-span-3">
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                                    <Input
                                        id="limit"
                                        type="number"
                                        value={limit}
                                        onChange={(e) => setLimit(e.target.value)}
                                        className="pl-7"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
