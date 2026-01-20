export type TransactionType = "debit" | "credit";
export type CategoryName = string

export interface Transaction {
  id: string;
  amount: number;
  status: "active" | "undone";
  category: CategoryName;
  date: string;
  description: string;
  type: TransactionType;
  updated_at?: string;
}

export interface Budget {
  category: CategoryName;
  limit: number;
}
export interface SearchTransactionsParams {
  userId: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface TransactionRequest {
  user_id: number;
  amount: number;
  category_id: number;
  type: 'debit' | 'credit';
  reason: string;
  created_at: string;
}
export interface TransactionRequestUpdate {
  id: string;
  amount: number;
  categoryId: number;
  type_: 'debit' | 'credit';
  reason: string;
}
export interface TransactionCreate {
  amount: number;
  category_id: number;
  created_at: string;
  reason: string;
  type: TransactionType;
}
