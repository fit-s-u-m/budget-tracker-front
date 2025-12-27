export type TransactionType = "debit" | "credit";
export type Category = "Food" | "Transport" | "Entertainment" | "Shopping" | "Utilities" | "Health" | "Salary" | "Miscellaneous";

export interface Transaction {
    id: string;
    amount: number;
    category: Category;
    date: string;
    description: string;
    type: TransactionType;
}

export interface Budget {
    category: Category;
    limit: number;
}
export interface SearchTransactionsParams {
  telegramId: string;
  text?: string;
  categoryId?: number;
  txType?: TransactionType;
  limit?: number;
  offset?: number;
}
