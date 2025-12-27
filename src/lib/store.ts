import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Transaction, Budget } from './types';
import * as api from './api';
import { format, formatISO } from 'date-fns';
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';

interface StoreState {
    transactions: Transaction[];
    budgets: Budget[];
    balance: number;
    monthlySummary: any;
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchInitialData: (telegramId: string, accountId: string) => Promise<void>;
    addTransaction: (t: Omit<Transaction, 'id'>, telegramId: string, accountId: string) => Promise<void>;
    editTransaction: (t: Transaction) => void;
    removeTransaction: (id: string) => void;
    updateBudget: (b: Budget) => void;
    ws: WebSocket | null;
}

export const useStore = create<StoreState>()(
    persist(
        (set, get) => ({
            transactions: [],
            budgets: [
                { category: 'Food', limit: 500 },
                { category: 'Transport', limit: 300 },
                { category: 'Entertainment', limit: 400 },
            ],
            balance: 0,
            monthlySummary: null,
            isLoading: false,
            telegram_id: "",
            account_id: "",
            error: null,
            ws: null as WebSocket | null,

            fetchInitialData: async (telegramId, accountId) => {
                set({ isLoading: true, error: null });
                const defaultLimit = 50;
                try {
                    if (!get().ws) {
                      const ws = new WebSocket(`${WS_URL}/ws/transactions`);
                        ws.onmessage = (event) => {
                          const data = JSON.parse(event.data);
                          console.log("websocket message received:", data);
                          if (data.action === "new_transaction") {
                            set((state) => ({
                              transactions: [data, ...state.transactions],
                              balance: state.balance + (data.type === "debit" ? -data.amount : data.amount),
                            }));
                          }
                          set({ws})
                      };
                      ws.onopen = () => console.log("WebSocket connected");
                      ws.onclose = () => console.log("WebSocket disconnected");
                    }
                    const [balanceData, transactionsData, summaryData] = await Promise.all([
                        api.fetchBalance(telegramId, accountId),
                        api.fetchTransactions(telegramId, defaultLimit),
                        api.fetchMonthlySummary(telegramId)
                    ]);

                    // Map backend transactions to frontend type
                    const mappedTransactions: Transaction[] = transactionsData.map((t: any) => ({
                        id: String(t.id),
                        amount: t.amount,
                        category: t.category_name as any,
                        date: format(t.created_at, "yyyy-MM-dd"),
                        description: t.reason,
                        type: t.type === 'debit' ? 'debit' : 'credit',
                    }));


                    set({
                        balance: balanceData.balance,
                        transactions: mappedTransactions,
                        monthlySummary: summaryData,
                        isLoading: false,
                    });
                } catch (error: any) {
                    set({ error: error.message, isLoading: false });
                }
            },

            addTransaction: async (t, telegramId, accountId) => {
                set({ isLoading: true, error: null });
                try {
                    const apiReq: api.TransactionRequest = {
                        account_id: Number(accountId),
                        amount: t.amount,
                        category: t.category,
                        type_: t.type === 'debit' ? 'debit' : 'credit',
                        reason: t.description,
                        created_at: formatISO(t.date) || t.date,
                    };
                    await api.submitTransaction(apiReq);
                    // Refresh data after addition
                    await get().fetchInitialData(telegramId, accountId);
                } catch (error: any) {
                    set({ error: error.message, isLoading: false });
                }
            },

            editTransaction: (updated) => set((state) => ({
                transactions: state.transactions.map(t => t.id === updated.id ? updated : t)
            })),
            removeTransaction: (id) => set((state) => ({ transactions: state.transactions.filter(t => t.id !== id) })),
            updateBudget: (b) => set((state) => {
                const index = state.budgets.findIndex(item => item.category === b.category);
                if (index !== -1) {
                    const newBudgets = [...state.budgets];
                    newBudgets[index] = b;
                    return { budgets: newBudgets };
                }
                return { budgets: [...state.budgets, b] };
            }),
        }),
        {
            name: 'budget-store',
        }
    )
);
