export type TransactionType = "debit" | "credit";
export type Category = "Food" | "Transport" | "Entertainment" | "Shopping" | "Utilities" | "Health" | "Salary" | "Miscellaneous";

export interface Transaction {
    id: string;
    amount: number;
    status:"active" | "undone";
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
  search?: string;
  limit?: number;
  offset?: number;
}

export interface TransactionRequest {
    telegram_id: number;
    amount: number;
    category: string;
    type_: 'debit' | 'credit';
    reason: string;
    created_at: string;
}
export interface TransactionRequestUpdate{
    id:string;
    amount: number;
    category: string;
    type_: 'debit' | 'credit';
    reason: string;
}
