const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
import {SearchTransactionsParams, Category,Transaction} from "@/lib/types"
import {CATEGORIES} from "@/lib/constants"
import {format,parse,isValid} from "date-fns"

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
function parseDateInput(input: string): string | null {
  const v = input.toLowerCase().trim();

  if (v === "today") {
    const today = new Date();
    return format(today, "yyyy-MM-dd");
  }

  if (v === "yesterday") {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return format(d, "yyyy-MM-dd");
  }

  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
   const d = parse(v, "yyyy-MM-dd", new Date());
    return isValid(d) ? format(d, "yyyy-MM-dd") : null;
  }
  // 09/12/29
  // DD/MM/YY
  if (/^\d{2}\/\d{2}\/\d{2}$/.test(v)) {
    const d = parse(v, "dd/MM/yy", new Date());
    return isValid(d) ? format(d, "yyyy-MM-dd") : null;
  }
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(v)) {
    const d = parse(v, "dd/MM/yyyy", new Date());
    return isValid(d) ? format(d, "yyyy-MM-dd") : null;
  }

  return null;
}

function findCategoryId(
  input: string,
  categories: readonly Category[],
): number | null {
  const v = input.toLowerCase().trim();

  categories.forEach(
    (c,index) => {
      if(c.toLowerCase() === v){
        return index
      }
    }
  );

  return null
}

export async function searchTransactions({
  telegramId,
  text,
  limit = 50,
  offset = 0,
}: SearchTransactionsParams) {
  const params = new URLSearchParams({
    telegram_id: telegramId.toString(),
    limit: limit.toString(),
    offset: offset.toString(),
  });
  if(!text) return
  const categoryId = findCategoryId(text, CATEGORIES);
  const date = parseDateInput(text);
  console.log("Searching transactions with:", {date,categoryId,text});

  if (categoryId) {
    params.append("category_id", categoryId.toString());
  } else if (date) {
    params.append("created_at", date);
  }else if (text) {
    params.append("text", text);
  }

  const res = await fetch(
    `${API_URL}/transactions/search?${params.toString()}`,
    {
      cache: "no-store", // important for search
    }
  );

  if (!res.ok) {
    throw new Error("Failed to search transactions");
  }

  return res.json() as Promise<Transaction[]>;
}
