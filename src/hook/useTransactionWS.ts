// hooks/useTransactionsWS.ts
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { WS_URL } from '@/lib/constants';

export const useTransactionsWS = (telegramId: string|undefined) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const ws = new WebSocket(`${WS_URL}/ws/transactions`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.action === 'new_transaction') {
        if (telegramId === undefined) return;
        // Refresh queries
        queryClient.invalidateQueries({queryKey: ['transactions', telegramId]});
        queryClient.invalidateQueries({queryKey: ['balance', telegramId]});
      }
    };

    ws.onopen = () => console.log('WebSocket connected');
    ws.onclose = () => console.log('WebSocket disconnected');

    return () => ws.close();
  }, [telegramId, queryClient]);
};

