'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { Header } from '@/components/Header';
import { useOrderStream } from '@/hooks/useOrderStream';
import { useAuth } from '@/components/AuthProvider';

function TipButtons({ tipBit, tipPaypal }: { tipBit?: string | null; tipPaypal?: string | null }) {
  const [copied, setCopied] = useState(false);

  function handleBit() {
    if (!tipBit) {
      alert('The seller hasn\'t set up Bit payments yet.');
      return;
    }
    navigator.clipboard.writeText(tipBit).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  function handlePaypal() {
    if (!tipPaypal) {
      alert('The seller hasn\'t set up PayPal payments yet.');
      return;
    }
    window.open(
      `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=${encodeURIComponent(tipPaypal)}&currency_code=ILS`,
      '_blank',
    );
  }

  return (
    <div className="mt-3 pt-3 border-t border-stone-100">
      <p className="text-xs text-stone-400 mb-2">Leave a tip ☕</p>
      <div className="flex gap-2 flex-wrap">
        <button onClick={handleBit}
          className="text-xs font-medium px-3 py-1.5 rounded-lg bg-[#00AAFF] text-white hover:opacity-90 transition-opacity">
          {copied ? '✓ Copied!' : 'Tip with Bit'}
        </button>
        <button onClick={handlePaypal}
          className="text-xs font-medium px-3 py-1.5 rounded-lg bg-[#003087] text-white hover:opacity-90 transition-opacity">
          Tip with PayPal
        </button>
      </div>
      {tipBit && !copied && (
        <p className="text-xs text-stone-400 mt-1.5">Bit: tap to copy number, then open the Bit app</p>
      )}
    </div>
  );
}

type Order = {
  id: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';
  note: string | null;
  estimatedMinutes: number | null;
  createdAt: string;
  menuItem?: { title: string; price: number };
  seller?: { displayName: string; userId: string; tipBit?: string | null; tipPaypal?: string | null };
};

const STATUS_LABEL: Record<Order['status'], string> = {
  PENDING: 'Waiting for seller',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

const STATUS_COLOR: Record<Order['status'], string> = {
  PENDING: 'bg-amber-100 text-amber-800 border-amber-200',
  ACCEPTED: 'bg-green-100 text-green-800 border-green-200',
  REJECTED: 'bg-red-100 text-red-700 border-red-200',
  COMPLETED: 'bg-stone-100 text-stone-600 border-stone-200',
  CANCELLED: 'bg-stone-100 text-stone-500 border-stone-200',
};

const STEPS: { key: Order['status']; label: string }[] = [
  { key: 'PENDING', label: 'Placed' },
  { key: 'ACCEPTED', label: 'Accepted' },
  { key: 'COMPLETED', label: 'Ready' },
];

function OrderStatusStepper({ status, estimatedMinutes }: { status: Order['status']; estimatedMinutes: number | null }) {
  if (status === 'REJECTED' || status === 'CANCELLED') return null;

  const activeIndex = status === 'COMPLETED' ? 2 : status === 'ACCEPTED' ? 1 : 0;

  return (
    <div className="mt-3 mb-1">
      <div className="flex items-center gap-0">
        {STEPS.map((step, i) => {
          const done = i <= activeIndex;
          const current = i === activeIndex;
          return (
            <div key={step.key} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${
                    done
                      ? current
                        ? 'bg-amber-800 text-white ring-2 ring-amber-300'
                        : 'bg-green-600 text-white'
                      : 'bg-stone-200 text-stone-400'
                  }`}
                >
                  {done && !current ? (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>
                <span className={`text-[10px] mt-1 font-medium ${done ? 'text-amber-900' : 'text-stone-400'}`}>
                  {step.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 mb-4 transition-all duration-500 ${i < activeIndex ? 'bg-green-500' : 'bg-stone-200'}`} />
              )}
            </div>
          );
        })}
      </div>
      {status === 'ACCEPTED' && estimatedMinutes && (
        <div className="mt-2 flex items-center gap-1.5 text-green-700 text-xs font-medium">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Ready in ~{estimatedMinutes} minutes
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  const { user } = useAuth();
  const qc = useQueryClient();

  useOrderStream(!!user);

  const { data, isLoading } = useQuery({
    queryKey: ['orders-my'],
    queryFn: async () => {
      const res = await apiFetch<{ data: Order[] }>('/orders/my');
      if (res.error) throw new Error(res.error);
      return res.data!;
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const res = await apiFetch(`/orders/${orderId}/cancel`, { method: 'PATCH' });
      if (res.error || res.status >= 400) throw new Error('Failed to cancel');
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders-my'] }),
  });

  const orders = data?.data ?? [];
  const active = orders.filter((o) => ['PENDING', 'ACCEPTED'].includes(o.status));
  const past = orders.filter((o) => ['COMPLETED', 'REJECTED', 'CANCELLED'].includes(o.status));

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-6 max-w-xl">
        <h1 className="text-2xl font-bold text-amber-950 mb-6">My orders</h1>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => <div key={i} className="h-24 bg-amber-100/50 rounded-2xl animate-pulse" />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-amber-200/80 p-10 text-center">
            <p className="text-stone-500 text-sm">No orders yet.</p>
            <Link href="/marketplace" className="mt-3 inline-block text-sm text-amber-800 hover:underline font-medium">
              Browse sellers →
            </Link>
          </div>
        ) : (
          <>
            {/* Active orders */}
            {active.length > 0 && (
              <section className="mb-6">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-amber-700 mb-3">Active</h2>
                <div className="space-y-3">
                  {active.map((o) => (
                    <div key={o.id} className={`bg-white rounded-2xl border-2 p-5 ${o.status === 'ACCEPTED' ? 'border-green-300/60' : 'border-amber-200'}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-amber-950">{o.menuItem?.title ?? 'Order'}</p>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-lg border ${STATUS_COLOR[o.status]}`}>
                              {STATUS_LABEL[o.status]}
                            </span>
                          </div>
                          {o.seller && (
                            <Link href={`/seller/${o.seller.userId}`} className="text-sm text-amber-800 hover:underline mt-0.5 block">
                              {o.seller.displayName}
                            </Link>
                          )}
                          {o.note && (
                            <p className="text-xs text-stone-500 mt-1">Note: {o.note}</p>
                          )}
                          <OrderStatusStepper status={o.status} estimatedMinutes={o.estimatedMinutes} />
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-semibold text-amber-900 text-sm">₪{o.menuItem?.price}</p>
                          <p className="text-xs text-stone-400 mt-0.5">
                            {new Date(o.createdAt).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      {o.status === 'PENDING' && (
                        <button
                          onClick={() => cancelMutation.mutate(o.id)}
                          disabled={cancelMutation.isPending}
                          className="mt-3 text-xs text-red-500 hover:text-red-700 disabled:opacity-50 transition-colors"
                        >
                          Cancel order
                        </button>
                      )}
                      {o.status === 'ACCEPTED' && (
                        <TipButtons tipBit={o.seller?.tipBit} tipPaypal={o.seller?.tipPaypal} />
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Past orders */}
            {past.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-3">History</h2>
                <div className="space-y-2">
                  {past.map((o) => (
                    <div key={o.id} className="bg-white rounded-xl border border-stone-200 px-4 py-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-stone-700">{o.menuItem?.title ?? 'Order'}</p>
                        <p className="text-xs text-stone-400">
                          {o.seller?.displayName ?? '—'} · {new Date(o.createdAt).toLocaleDateString('he-IL')}
                        </p>
                      </div>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-lg border shrink-0 ${STATUS_COLOR[o.status]}`}>
                        {STATUS_LABEL[o.status]}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
