"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import clsx from "clsx";
import { LayoutDashboard, Receipt, PiggyBank, Settings } from "lucide-react";
import {useStore} from "@/lib/store";

export const routes = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/transactions", label: "Transactions", icon: Receipt },
    { href: "/budgets", label: "Budgets", icon: PiggyBank },
    { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ className }: { className?: string }) {
    const pathname = usePathname();

    return (
        <aside className={clsx("h-full w-64 bg-background border-r border-border py-6 px-4 flex flex-col gap-4", className)}>
            <div className="flex items-center gap-3 px-2 pb-6">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/30">
                    <span className="text-primary-foreground font-bold text-lg">N</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-black to-purple-600 bg-clip-text text-transparent">
                    Nehemiah BudgetApp
                </span>
            </div>

            <nav className="flex flex-col gap-1.5">
                {routes.map((route) => {
                    const isActive = pathname === route.href;
                    return (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={clsx(
                                "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group text-sm font-medium",
                                isActive
                                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                            )}
                        >
                            <route.icon size={18} className={clsx(isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
                            <span>{route.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-auto px-4 py-4 rounded-xl bg-card border border-border shadow-sm">
                <p className="text-xs text-muted-foreground">Total Balance</p>
                <p className="text-lg font-bold text-green-600 dark:text-green-500">{useStore().balance}</p>
            </div>
        </aside>
    );
}
