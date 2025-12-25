"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { ThemeToggle } from "../ThemeToggle";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu,LogOut } from "lucide-react";
import { routes } from "./Sidebar";
import clsx from "clsx";
import { logout } from "@/lib/actions";


export function Header() {
    const pathname = usePathname();
    const currentRoute = routes.find(r => r.href === pathname);
    const { transactions } = useStore(); // Access store if needed for header info

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background">
            <div className="flex h-16 items-center px-4 md:px-6">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="md:hidden mr-2 cursor-pointer">
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Toggle menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[240px] sm:w-[300px] p-0 bg-red-100">
                        <SheetTitle className="sr-only">Navigation Menu</SheetTitle> {/* Accessible Title */}
                        <SheetDescription className="sr-only">Main Application Links</SheetDescription>
                        <div className="flex flex-col h-full py-6 px-4">
                            <div className="flex items-center gap-3 px-2 pb-6">
                                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                    <span className="text-primary-foreground font-bold">N</span>
                                </div>
                                <span className="text-lg font-bold">BudgetApp</span>
                            </div>
                            <nav className="flex flex-col gap-1">
                                {routes.map((route) => {
                                    const isActive = pathname === route.href;
                                    return (
                                        <Link
                                            key={route.href}
                                            href={route.href}
                                            className={clsx(
                                                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors group text-sm font-medium",
                                                isActive
                                                    ? "bg-primary text-primary-foreground"
                                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                            )}
                                        >
                                            <route.icon size={18} />
                                            <span>{route.label}</span>
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>
                    </SheetContent>
                </Sheet>

                <div className="flex items-center gap-2 font-bold text-lg hidden md:flex">
                    {currentRoute?.icon && <currentRoute.icon className="h-5 w-5 text-muted-foreground" />}
                    {currentRoute?.label || "Dashboard"}
                </div>

                <div className="ml-auto flex items-center gap-2">
                    <ThemeToggle />
                    <div>
                      <LogOut className="h-5 w-5 text-muted-foreground cursor-pointer" onClick={logout} />
                    </div>
                </div>
            </div>
        </header>
    );
}
