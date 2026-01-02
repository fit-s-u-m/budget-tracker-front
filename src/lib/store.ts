import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Budget } from './types';
interface StoreState {
    budgets: Budget[];
    isLoading: boolean;
    error: string | null;

    // Actions
    updateBudget: (b: Budget) => void;
    ws: WebSocket | null;
}

export const useStore = create<StoreState>()(
    persist(
        (set, get) => ({
            budgets: [
                { category: 'Food', limit: 500 },
                { category: 'Transport', limit: 300 },
                { category: 'Entertainment', limit: 400 },
                { category: 'Shopping', limit: 400 },
                { category: 'Utilities', limit: 400 },
                { category: 'Miscellaneous', limit: 400 },
            ],
            isLoading: false,
            error: null,
            ws: null as WebSocket | null,


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
