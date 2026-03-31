'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === 'development' ? 'http://localhost:4000' : '');

export function useOrderStream(enabled: boolean) {
  const qc = useQueryClient();

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const token = (window as any).__orderbridge_access_token as string | undefined;
    if (!token) return;

    const url = `${API_BASE}/orders/stream`;
    const es = new EventSource(`${url}?token=${encodeURIComponent(token)}`);

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as {
          orderId: string;
          status: string;
          estimatedMinutes: number | null;
        };

        // Update the cached order in both my orders and incoming orders lists
        const updateOrder = (old: any) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: {
              ...old.data,
              data: old.data.data.map((o: any) =>
                o.id === data.orderId
                  ? { ...o, status: data.status, estimatedMinutes: data.estimatedMinutes }
                  : o,
              ),
            },
          };
        };

        qc.setQueriesData({ queryKey: ['orders-my'] }, updateOrder);
        qc.setQueriesData({ queryKey: ['orders-incoming'] }, updateOrder);
      } catch {
        // ignore parse errors
      }
    };

    es.onerror = () => {
      es.close();
    };

    return () => es.close();
  }, [enabled, qc]);
}
