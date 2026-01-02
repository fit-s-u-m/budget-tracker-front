import {SearchTransactionsParams, Category,Transaction,TransactionRequest} from "@/lib/types"
import {CATEGORIES,DEFAULT_LIMIT} from "@/lib/constants"
import {format,parse,isValid} from "date-fns"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';


export async function fetchBalance(telegramId: string) {
    const res = await fetch(`${API_URL}/balance?telegram_id=${telegramId}`);
    if (!res.ok) throw new Error('Failed to fetch balance');
    return res.json();
}

export async function fetchTransactions(telegramId: string, offset = 0, limit = 50) {
    // Note: Typo in backend path "trasactions"
    const res = await fetch(`${API_URL}/trasactions?limit=${limit}&offset=${offset}&telegram_id=${telegramId}`);
    if (!res.ok) throw new Error('Failed to fetch transactions');
    return res.json();
}

export async function fetchMonthlySummary(telegramId: string) {
    const res = await fetch(`${API_URL}/monthly_summary?telegram_id=${telegramId}`);
    if (!res.ok) throw new Error('Failed to fetch monthly summary');
    return res.json();
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
    console.log("api url",API_URL);
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
  search,
  limit = DEFAULT_LIMIT,
  offset = 0,
}: SearchTransactionsParams) {
  const params = new URLSearchParams({
    telegram_id: telegramId.toString(),
    limit: limit.toString(),
    offset: offset.toString(),
  });
  if(!search) return []
  if(search.trim() === "") return []

  const categoryId = findCategoryId(search, CATEGORIES);
  const date = parseDateInput(search);
  console.log("Searching transactions with:", {date,categoryId,text: search});

  if (categoryId) {
    params.append("category_id", categoryId.toString());
  } else if (date) {
    params.append("created_at", date);
  }else if (search) {
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
    const response = await fetch(`${API_URL}/transaction/undo?transaction_id=${transactionId}`, {
      method: "POST",
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
  categoryName: string,
  reason?: string
) {
  try {
    const response = await fetch(`${API_URL}/transaction/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        transaction_id: transactionId,
        tx_type: txType,
        amount,
        category_name: categoryName,
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

