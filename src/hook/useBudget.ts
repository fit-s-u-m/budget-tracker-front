// hooks/useBudget.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '@/lib/api';
import { formatISO } from 'date-fns';
import { TransactionRequest, Transaction, Budget, TransactionRequestUpdate, TransactionCreate } from '@/lib/types';
import { DEFAULT_LIMIT } from '@/lib/constants';

// Fetch balance
export const useUser = (userId: string | undefined) =>
  useQuery({
    queryKey: ['user', userId],
    queryFn: () => userId ? api.fetchUser(userId) : 0
  })

export const useCategoies = () =>
  useQuery({
    queryKey: ['categories'],
    queryFn: () => api.getAllCategories()
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

// Add transaction
export const useAddTransaction = (userId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (t: Omit<TransactionCreate, 'id'>) => {
      console.log(t)
      const req: TransactionRequest = {
        user_id: Number(userId),
        amount: t.amount,
        category_id: Number(t.category_id),
        type: t.type === 'debit' ? 'debit' : 'credit',
        reason: t.reason,
        created_at: formatISO(t.created_at) || t.created_at,
      };
      await api.submitTransaction(req);
    },
    onSuccess: () => {
      // Refresh transactions and balance
      queryClient.invalidateQueries({ queryKey: ['transactions', userId] });
      queryClient.invalidateQueries({ queryKey: ['balance', userId] });
      queryClient.invalidateQueries({ queryKey: ['monthlySummary', userId] });
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
    mutationFn: async ({ id, type_, amount, categoryId, reason }: TransactionRequestUpdate) => {
      // Call the API
      const resp = await api.updateTransaction(id, type_, amount, categoryId, reason);
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

export const useTransactionsSearch = (userId: string | undefined, search: string, offset: number, limit?: number) =>
  useQuery<Transaction[]>({
    queryKey: ['transactions', userId, search, offset, limit],
    queryFn: () => userId ? api.searchTransactions({ userId, search, offset, limit }) : [],
    enabled: !!search && !!userId
  });
