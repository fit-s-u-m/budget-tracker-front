"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, ArrowDown, Wallet } from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

interface SummaryCardProps {
    title: string;
    amount: number;
    type?: "income" | "expense" | "balance";
    index?: number;
}

export function SummaryCard({ title, amount, type = "balance", index = 0 }: SummaryCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (!cardRef.current) return;
        gsap.fromTo(cardRef.current,
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.5, delay: index * 0.1, ease: "power2.out" }
        );
    }, { scope: cardRef });

    const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(amount);

    return (
        <div ref={cardRef}>
            <Card className="border-none shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardContent className="flex flex-row items-center justify-between p-6">
                    <div>
                        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{title}</p>
                        <h3 className={`text-2xl font-bold mt-2 ${type === 'income' ? 'text-green-600 dark:text-green-500' :
                                type === 'expense' ? 'text-red-600 dark:text-red-500' : 'text-foreground'
                            }`}>
                            {formatted}
                        </h3>
                    </div>
                    <div className={`p-3 rounded-full ${type === 'income' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-500' :
                            type === 'expense' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-500' : 'bg-primary/10 text-primary'
                        }`}>
                        {type === 'income' ? <ArrowUp size={24} /> :
                            type === 'expense' ? <ArrowDown size={24} /> :
                                <Wallet size={24} />}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
