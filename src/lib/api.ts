import { SearchTransactionsParams, CategoryName, Transaction, TransactionRequest } from "@/lib/types"
import { DEFAULT_LIMIT } from "@/lib/constants"
import { format, parse, isValid } from "date-fns"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';


export async function fetchUser(userId: string) {
  const res = await fetch(`${API_URL}/users/${userId}`);
  if (!res.ok) throw new Error('Failed to fetch balance');
  return res.json();
}
export async function fetchTransactionCount(userId: string) {
  const res = await fetch(`${API_URL}/transactions/count/${userId}`);
  if (!res.ok) throw new Error('Failed to fetch transaction count');
  console.log("Transaction count response:", res);
  return res.json();
}

export async function fetchTransactions(userId: string, offset = 0, limit = 50) {
  // Note: Typo in backend path "transactions"
  const res = await fetch(`${API_URL}/transactions?limit=${limit}&offset=${offset}&user_id=${userId}`);
  console.log(res)
  if (!res.ok) throw new Error('Failed to fetch transactions');
  return res.json();
}

export async function fetchMonthlySummary(telegramId: string) {
  const res = await fetch(`${API_URL}/monthly_summary?telegram_id=${telegramId}`);
  if (!res.ok) throw new Error('Failed to fetch monthly summary');
  return res.json();
}

export async function submitTransaction(txn: TransactionRequest) {
  const res = await fetch(`${API_URL}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(txn),
  });
  if (!res.ok) throw new Error('Failed to submit transaction');
  return res.json();
}
export async function verifyOTP(username: string, otp: string) {
  console.log("api url", API_URL);
  const input = {
    userName: username,
    otp: parseInt(otp)
  }
  const res = await fetch(`${API_URL}/otp/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
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
  categories: readonly CategoryName[],
): number | null {
  const v = input.toLowerCase().trim();

  categories.forEach(
    (c) => {
      if (c.toLowerCase() === v) {
        return c
      }
    }
  );

  return null
}

export async function searchTransactions({
  userId,
  search,
  limit = DEFAULT_LIMIT,
  offset = 0,
}: SearchTransactionsParams) {
  const params = new URLSearchParams({
    user_id: userId.toString(),
    limit: limit.toString(),
    offset: offset.toString(),
  });
  if (!search) return []
  if (search.trim() === "") return []
  const CATEGORIES = await getAllCategories()

  const category_name = findCategoryId(search, CATEGORIES.map(item => item.name));
  const date = parseDateInput(search);
  console.log("Searching transactions with:", { date, category_name, text: search });

  if (category_name) {
    params.append("category_name", category_name.toString());
  }
  if (date) {
    params.append("created_at", date);
  }
  if (search) {
    params.append("text", search);
  }

  const res = await fetch(
    `${API_URL}/transactions/search?${params.toString()}`,
    {
      cache: "no-store", // important for search
    }
  );

  if (!res.ok) {
    return [] // TODO: handler errors properly
    // throw new Error("Failed to search transactions");
  }

  return res.json() as Promise<Transaction[]>;
}

// Undo a transaction
export async function undoTransaction(transactionId: string) {
  try {
    const response = await fetch(`${API_URL}/transactions/${transactionId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("Undo response:", response);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data; // { transaction_id: "...", status: "undone" | "failed" }
  } catch (error) {
    console.error("Failed to undo transaction:", error);
    return { transaction_id: transactionId, status: "failed" };
  }
}

// Update a transaction
export async function updateTransaction(
  transactionId: string,
  txType: string,
  amount: number,
  categoryId: number,
  reason?: string
) {
  try {
    const response = await fetch(`${API_URL}/transactions/${transactionId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: txType,
        amount,
        category_id: categoryId,
        reason,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data; // { transaction_id: "...", status: "updated" | "failed" }
  } catch (error) {
    console.error("Failed to update transaction:", error);
    return { transaction_id: transactionId, status: "failed" };
  }
}

export async function getCategoryId(catagoryName: string) {
  try {
    const response = await fetch(`${API_URL}/categories/${catagoryName}`)
    const data = await response.json()
    return data

  } catch (error) {

    console.error("Failed to update transaction:", error);
    return null
  }
}
export async function getAllCategories(): Promise<{ name: string, id: number }[]> {
  try {
    const response = await fetch(`${API_URL}/categories`)

    const data = await response.json()
    return data
  } catch (error) {

    console.error("Failed to update transaction:", error);
    return []
  }
}
