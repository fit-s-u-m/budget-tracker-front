// hooks/useBudget.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '@/lib/api';
import { formatISO } from 'date-fns';
import {TransactionRequest, Transaction, Budget } from '@/lib/types';
import { DEFAULT_LIMIT } from '@/lib/constants';

// Fetch balance
export const useBalance = (telegramId: string | undefined, accountId: string | undefined) =>
  useQuery({
    queryKey: ['balance', telegramId, accountId],
    queryFn: () => telegramId&&accountId ? api.fetchBalance(telegramId, accountId): 0
  })

// Fetch transactions
export const useTransactions = (telegramId: string | undefined, offset:number = 0 ,limit = DEFAULT_LIMIT) =>
  useQuery<Transaction[]>({
    queryKey: ['transactions', telegramId, offset, limit], 
    queryFn: async () => {
                if (!telegramId) return [];
                const data = await api.fetchTransactions(telegramId,offset,limit);
                return data.map((t: any): Transaction => ({
                  id: String(t.id),
                  amount: t.amount,
                  category: t.category_name,
                  date: t.created_at,
                  description: t.reason,
                  type: t.type === 'debit' ? 'debit' : 'credit',
                }));
    },
    enabled: !!telegramId
  });

// Fetch monthly summary
export const useMonthlySummary = (telegramId: string) =>
  useQuery({
    queryKey: ['monthlySummary', telegramId],
    queryFn: () => api.fetchMonthlySummary(telegramId)
  });

// Add transaction
export const useAddTransaction = (telegramId: string, accountId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (t: Omit<Transaction, 'id'>) => {
      const req:TransactionRequest = {
        account_id: Number(accountId),
        amount: t.amount,
        category: t.category,
        type_: t.type === 'debit' ? 'debit' : 'credit',
        reason: t.description,
        created_at: formatISO(t.date) || t.date,
      };
      await api.submitTransaction(req);
    },
   onSuccess: () => {
        // Refresh transactions and balance
        queryClient.invalidateQueries({queryKey: ['transactions', telegramId]});
        queryClient.invalidateQueries({queryKey: ['balance', telegramId, accountId]});
        queryClient.invalidateQueries({queryKey: ['monthlySummary', telegramId]});
      },
  });
}

// Edit transaction (local only)
export const useEditTransaction = () => {
  const queryClient = useQueryClient();
  return (updated: Transaction) => {
    const prev = queryClient.getQueryData<Transaction[]>(['transactions']);
    if (prev) {
      queryClient.setQueryData(
        ['transactions'],
        prev.map((t) => (t.id === updated.id ? updated : t))
      );
    }
  };
};

// Remove transaction (local only)
export const useRemoveTransaction = () => {
  const queryClient = useQueryClient();
  return (id: string) => {
    const prev = queryClient.getQueryData<Transaction[]>(['transactions']);
    if (prev) {
      queryClient.setQueryData(
        ['transactions'],
        prev.filter((t) => t.id !== id)
      );
    }
  };
};

export const useTransactionsSearch = (telegramId: string|undefined, search: string,offset: number) =>
  useQuery<Transaction[]>({
    queryKey: ['transactions', telegramId, search],
    queryFn: () => telegramId ? api.searchTransactions({telegramId, search,offset}): [],
    enabled: !!search && !!telegramId
  });
