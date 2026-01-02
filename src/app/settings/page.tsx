"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Download, Database } from "lucide-react";
import { useSession } from "next-auth/react";
import { useTransactions,useBalance } from "@/hook/useBudget";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { DashboardPDF } from "@/components/downloadable";
import { format } from "date-fns";

export default function SettingsPage() {

    const { data: session } = useSession();
    const telegramId = session?.user.telegram_id;
    const transactions = useTransactions(telegramId).data
           ?.filter(i=>i.status=="active")
           ?.map(i=>({...i, date: format(i.date,"dd-MM-yyyy")}))

    const balance = useBalance(telegramId)?.data?.balance || 0;

    const income = transactions ? transactions
      .filter(t => t.type === "credit")
      .reduce((acc, t) => acc + t.amount, 0) : [];

    const expense = transactions ? transactions
      .filter(t => t.type === "debit")
      .reduce((acc, t) => acc + t.amount, 0): [];

    const handleExport = () => {
        if (!transactions || transactions.length === 0) return
        const csvContent = "data:text/csv;charset=utf-8,"
            + "Date,Description,Category,Type,Amount\n"
            + transactions.map(t => `${t.date},"${t.description.replace(/"/g, '""')}",${t.category},${t.type},${t.amount}`).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `transactions_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <>
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
                <p className="text-muted-foreground">Manage your data preferences.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Database className="h-5 w-5" />
                        Data Management
                    </CardTitle>
                    <CardDescription>Export your data for external use.</CardDescription>
                </CardHeader>
                <CardContent className="flex gap-5 flex-col">
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-secondary/50">
                        <div className="space-y-1">
                            <p className="font-medium text-sm">Export Transactions</p>
                            <p className="text-xs text-muted-foreground">Download all your records as a CSV file.</p>
                        </div>
                        <Button onClick={handleExport} size="sm">
                            <Download className="mr-2 h-4 w-4" />
                            Export CSV
                        </Button>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-secondary/50">
                        <div className="space-y-1">
                            <p className="font-medium text-sm">Export Transactions</p>
                            <p className="text-xs text-muted-foreground">Download all your records as a pdf file.</p>
                        </div>
                        <Button>
                          <Download className="mr-2 h-4 w-4" />
                          <PDFDownloadLink
                            document={
                              <DashboardPDF 
                                   expense={typeof expense =="number" ?  expense : 0}
                                   income={typeof income =="number" ?  income : 0}
                                   transactions={transactions??[]} balance={balance} />
                            }
                            fileName="dashboard.pdf"
                          >
                            {({ loading }) =>
                              loading ? "Preparing PDF..." : "Download PDF"
                            }
                          </PDFDownloadLink>
                      </Button>
                    </div>
                </CardContent>
            </Card>
        </>
    );
}
