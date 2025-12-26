const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
import {SearchTransactionsParams} from "@/lib/types"

export async function fetchBalance(telegramId: string, accountId: string) {
    const res = await fetch(`${API_URL}/balance?account_id=${accountId}&telegram_id=${telegramId}`);
    if (!res.ok) throw new Error('Failed to fetch balance');
    return res.json();
}

export async function fetchTransactions(telegramId: string, limit = 50) {
    // Note: Typo in backend path "trasactions"
    const res = await fetch(`${API_URL}/trasactions?limit=${limit}&telegram_id=${telegramId}`);
    if (!res.ok) throw new Error('Failed to fetch transactions');
    return res.json();
}

export async function fetchMonthlySummary(telegramId: string) {
    const res = await fetch(`${API_URL}/monthly_summary?telegram_id=${telegramId}`);
    if (!res.ok) throw new Error('Failed to fetch monthly summary');
    return res.json();
}

export interface TransactionRequest {
    account_id: number;
    amount: number;
    category: string;
    type_: 'debit' | 'credit';
    reason: string;
    created_at: string;
}

export async function submitTransaction(txn: TransactionRequest) {
    const res = await fetch(`${API_URL}/transaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(txn),
    });
    if (!res.ok) throw new Error('Failed to submit transaction');
    return res.json();
}
export async function verifyOTP(otp: string) {
    const res = await fetch(`${API_URL}/verify_otp?entered_otp=${otp}`);
    console.log("Verifying OTP with API:", otp, res);
    if (!res.ok) throw new Error('Failed to verify OTP');
    return res.json();
}

export async function searchTransactions({
  telegramId,
  text,
  categoryId,
  txType,
  limit = 50,
  offset = 0,
}: SearchTransactionsParams) {
  const params = new URLSearchParams({
    telegram_id: telegramId.toString(),
    limit: limit.toString(),
    offset: offset.toString(),
  });

  if (text) params.append("text", text);
  if (categoryId) params.append("category_id", categoryId.toString());
  if (txType) params.append("tx_type", txType);

  const res = await fetch(
    `${API_URL}/transactions/search?${params.toString()}`,
    {
      cache: "no-store", // important for search
    }
  );

  if (!res.ok) {
    throw new Error("Failed to search transactions");
  }

  return res.json() as Promise<{
    count: number;
    items: any[];
  }>;
}
