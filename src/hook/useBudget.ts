// hooks/useBudget.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '@/lib/api';
import { formatISO } from 'date-fns';
import { TransactionRequest, Transaction, Budget, TransactionRequestUpdate } from '@/lib/types';
import { DEFAULT_LIMIT } from '@/lib/constants';

// Fetch balance
export const useBalance = (telegramId: string | undefined) =>
  useQuery({
    queryKey: ['balance', telegramId],
    queryFn: () => telegramId ? api.fetchBalance(telegramId) : 0
  })

// Fetch transactions
export const useTransactions = (telegramId: string | undefined, offset: number = 0, limit = DEFAULT_LIMIT) =>
  useQuery<Transaction[]>({
    queryKey: ['transactions', telegramId, offset, limit],
    queryFn: async () => {
      if (!telegramId) return [];
      const data = await api.fetchTransactions(telegramId, offset, limit);
      return data.map((t: any): Transaction => ({
        id: String(t.id),
        amount: t.amount,
        status: t.status,
        category: t.category_name,
        date: t.created_at,
        description: t.reason,
        type: t.type === 'debit' ? 'debit' : 'credit',
        updated_at: t.updated_at,
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
export const useAddTransaction = (telegramId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (t: Omit<Transaction, 'id'>) => {
      const req: TransactionRequest = {
        telegram_id: Number(telegramId),
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
      queryClient.invalidateQueries({ queryKey: ['transactions', telegramId] });
      queryClient.invalidateQueries({ queryKey: ['balance', telegramId] });
      queryClient.invalidateQueries({ queryKey: ['monthlySummary', telegramId] });
    },
  });
}

// Remove transaction (local only)
export const useUndoTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Call the API
      const resp = await api.undoTransaction(id);
      if (resp.status === 'failed') {
        throw new Error('Undo transaction failed');
      }
      return resp;
    },
    // Optimistically update the cache
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ['transactions'] });
      const previous = queryClient.getQueryData<Transaction[]>(['transactions']);

      if (previous) {
        queryClient.setQueryData(
          ['transactions'],
          previous.filter((t) => t.id !== id)
        );
      }

      return { previous };
    },
    // Rollback if mutation fails
    onError: (err, id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['transactions'], context.previous);
      }
    },
    // Refetch after success
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  }
  );
};
export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, type_, amount, category, reason }: TransactionRequestUpdate) => {
      // Call the API
      const resp = await api.updateTransaction(id, type_, amount, category, reason);
      if (resp.status === 'failed') {
        throw new Error('update transaction failed');
      }
      return resp;
    },
    // Optimistically update the cache
    onMutate: async ({ id }: TransactionRequestUpdate) => {
      await queryClient.cancelQueries({ queryKey: ['transactions'] });
      const previous = queryClient.getQueryData<Transaction[]>(['transactions']);

      if (previous) {
        queryClient.setQueryData(
          ['transactions'],
          previous.filter((t) => t.id !== id)
        );
      }

      return { previous };
    },
    // Rollback if mutation fails
    onError: (err, id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['transactions'], context.previous);
      }
    },
    // Refetch after success
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  }
  );
};
export const useTransactionCount = (telegramId?: string) => {
  return useQuery<{ total: number }>({
    queryKey: ["transactionCount", telegramId],
    queryFn: async () => {
      if (!telegramId) return 0;
      return api.fetchTransactionCount(telegramId);
    },
    enabled: !!telegramId,
  });
};

export const useTransactionsSearch = (telegramId: string | undefined, search: string, offset: number, limit?: number) =>
  useQuery<Transaction[]>({
    queryKey: ['transactions', telegramId, search, offset, limit],
    queryFn: () => telegramId ? api.searchTransactions({ telegramId, search, offset, limit }) : [],
    enabled: !!search && !!telegramId
  });
