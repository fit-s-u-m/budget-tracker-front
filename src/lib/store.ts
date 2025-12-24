import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Transaction, Budget } from './types';
import * as api from './api';
import { format, formatISO } from 'date-fns';

interface StoreState {
    transactions: Transaction[];
    budgets: Budget[];
    balance: number;
    monthlySummary: any;
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchInitialData: () => Promise<void>;
    addTransaction: (t: Omit<Transaction, 'id'>) => Promise<void>;
    editTransaction: (t: Transaction) => void;
    removeTransaction: (id: string) => void;
    updateBudget: (b: Budget) => void;
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
            error: null,

            fetchInitialData: async () => {
                set({ isLoading: true, error: null });
                try {
                    const [balanceData, transactionsData, summaryData] = await Promise.all([
                        api.fetchBalance(),
                        api.fetchTransactions(),
                        api.fetchMonthlySummary()
                    ]);

                    // Map backend transactions to frontend type
                    const mappedTransactions: Transaction[] = transactionsData.map((t: any) => ({
                        id: String(t.id),
                        amount: t.amount,
                        category: t.category_name as any,
                        date: format(t.created_at,"yyyy-MM-dd"),
                        description: t.reason,
                        type: t.type === 'debit' ? 'expense' : 'income'
                    }));

                    set({
                        balance: balanceData.balance,
                        transactions: mappedTransactions,
                        monthlySummary: summaryData,
                        isLoading: false
                    });
                } catch (error: any) {
                    set({ error: error.message, isLoading: false });
                }
            },

            addTransaction: async (t) => {
                set({ isLoading: true, error: null });
                try {
                    const apiReq: api.TransactionRequest = {
                        account_id: Number(process.env.NEXT_PUBLIC_DEFAULT_ACCOUNT_ID || 20),
                        amount: t.amount,
                        category: t.category,
                        type_: t.type === 'expense' ? 'debit' : 'credit',
                        reason: t.description,
                        created_at: formatISO(t.date) || t.date,
                    };
                    await api.submitTransaction(apiReq);
                    // Refresh data after addition
                    await get().fetchInitialData();
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
