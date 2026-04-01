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

        // orders-my cache shape: { data: Order[] }
        qc.setQueriesData({ queryKey: ['orders-my'] }, (old: any) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.map((o: any) =>
              o.id === data.orderId
                ? { ...o, status: data.status, estimatedMinutes: data.estimatedMinutes }
                : o,
            ),
          };
        });
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
