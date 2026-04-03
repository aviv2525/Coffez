'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { OnlineToggle } from '@/components/OnlineToggle';
import { Toast } from '@/components/Toast';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === 'development' ? 'http://localhost:4000' : '');

const MILK_LABELS: Record<string, string> = {
  regular: 'רגיל / Regular',
  oat: 'שיבולת שועל / Oat',
  soy: 'סויה / Soy',
  almond: 'שקדים / Almond',
};

type Order = {
  id: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';
  note: string | null;
  milkOption: string | null;
  estimatedMinutes: number | null;
  createdAt: string;
  menuItem?: { title: string; price: number };
  buyer?: { fullName: string; email: string };
};

const STATUS_LABEL: Record<Order['status'], string> = {
  PENDING: 'Pending',
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

const ETA_OPTIONS = [5, 10, 15, 20, 30, 45, 60];

export default function SellerOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [etaMap, setEtaMap] = useState<Record<string, number>>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const prevPendingCount = useRef(0);

  const load = useCallback(async (silent = false) => {
    const [ordersRes, profileRes] = await Promise.all([
      apiFetch<{ data: Order[] }>('/orders/incoming'),
      apiFetch<{ isOnline: boolean }>('/sellers/me'),
    ]);
    if (ordersRes.status === 401) { router.replace('/auth/login'); return; }
    if (ordersRes.error || !ordersRes.data) { if (!silent) setLoadState('error'); return; }
    const incoming = ordersRes.data.data;
    const newPending = incoming.filter((o) => o.status === 'PENDING').length;
    if (newPending > prevPendingCount.current && prevPendingCount.current >= 0 && loadState === 'ready') {
      setToast('New order arrived!');
    }
    prevPendingCount.current = newPending;
    setOrders(incoming);
    if (profileRes.data) setIsOnline(profileRes.data.isOnline ?? false);
    setLoadState('ready');
  }, [loadState, router]);

  // Initial load
  useEffect(() => {
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // SSE — real-time updates instead of polling
  useEffect(() => {
    const token = (window as any).__orderbridge_access_token as string | undefined;
    if (!token) return;

    const es = new EventSource(`${API_BASE}/orders/stream?token=${encodeURIComponent(token)}`);

    es.onmessage = () => {
      // Any event (new order or status change) → silent reload
      load(true);
    };

    es.onerror = () => es.close();

    return () => es.close();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function updateStatus(orderId: string, status: Order['status'], estimatedMinutes?: number) {
    setActionLoading(orderId + status);
    setErrorMsg(null);
    const body: Record<string, unknown> = { status };
    if (estimatedMinutes) body.estimatedMinutes = estimatedMinutes;
    const res = await apiFetch<Order>(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
    setActionLoading(null);
    if (res.error || res.status >= 400) {
      setErrorMsg('Action failed. Please try again.');
      return;
    }
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, ...res.data! } : o));
  }

  const pending = orders.filter((o) => o.status === 'PENDING');
  const active = orders.filter((o) => o.status === 'ACCEPTED');
  const done = orders.filter((o) => ['COMPLETED', 'REJECTED', 'CANCELLED'].includes(o.status));

  if (loadState === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-amber-900/70">Loading orders…</p>
      </div>
    );
  }

  if (loadState === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <p className="text-amber-900">Something went wrong.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-20 border-b border-amber-200/60 bg-white/95 backdrop-blur">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/" className="text-lg font-bold text-amber-950">COFFEZ</Link>
          <Link href="/settings/seller" className="text-sm text-amber-900/80 hover:text-amber-950 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Seller settings
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-amber-950">Incoming orders</h1>
            {pending.length > 0 && (
              <p className="text-sm text-amber-700 mt-0.5">{pending.length} order{pending.length !== 1 ? 's' : ''} waiting</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <OnlineToggle initialValue={isOnline} />
            <button
              onClick={() => { setLoadState('loading'); load(); }}
              className="text-sm text-amber-800 hover:text-amber-950 border border-amber-200 rounded-lg px-3 py-1.5 hover:bg-amber-50 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMsg}
          </div>
        )}

        {/* PENDING */}
        {pending.length > 0 && (
          <section className="mb-6">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-amber-700 mb-3">New orders</h2>
            <div className="space-y-3">
              {pending.map((o) => (
                <div key={o.id} className="bg-white rounded-2xl border-2 border-amber-300/60 p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="font-semibold text-amber-950">{o.menuItem?.title ?? 'Order'}</p>
                      <p className="text-sm text-stone-500 mt-0.5">from {o.buyer?.fullName ?? '—'}</p>
                      {o.milkOption && (
                        <p className="text-sm text-amber-800 mt-1 font-medium">🥛 {MILK_LABELS[o.milkOption] ?? o.milkOption}</p>
                      )}
                      {o.note && (
                        <p className="text-sm text-stone-600 mt-1 bg-stone-50 rounded-lg px-3 py-1.5 border border-stone-200">
                          Note: {o.note}
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold text-amber-900">₪{o.menuItem?.price}</p>
                      <p className="text-xs text-stone-400 mt-1">{new Date(o.createdAt).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>

                  {/* ETA selector */}
                  <div className="mb-3">
                    <p className="text-xs text-stone-500 mb-1.5">Estimated time (minutes):</p>
                    <div className="flex flex-wrap gap-1.5">
                      {ETA_OPTIONS.map((mins) => (
                        <button
                          key={mins}
                          onClick={() => setEtaMap((m) => ({ ...m, [o.id]: mins }))}
                          className={`px-3 py-1 rounded-lg text-sm font-medium border transition-colors ${
                            etaMap[o.id] === mins
                              ? 'bg-amber-900 text-amber-50 border-amber-900'
                              : 'border-amber-200 text-amber-900 hover:bg-amber-50'
                          }`}
                        >
                          {mins}m
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => updateStatus(o.id, 'ACCEPTED', etaMap[o.id])}
                      disabled={!!actionLoading}
                      className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-green-700 text-white hover:bg-green-800 disabled:opacity-50 transition-colors"
                    >
                      {actionLoading === o.id + 'ACCEPTED' ? 'Accepting…' : '✓ Accept'}
                    </button>
                    <button
                      onClick={() => updateStatus(o.id, 'REJECTED')}
                      disabled={!!actionLoading}
                      className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
                    >
                      {actionLoading === o.id + 'REJECTED' ? 'Rejecting…' : '✕ Reject'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ACCEPTED */}
        {active.length > 0 && (
          <section className="mb-6">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-green-700 mb-3">In progress</h2>
            <div className="space-y-3">
              {active.map((o) => (
                <div key={o.id} className="bg-white rounded-2xl border border-green-200 p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="font-semibold text-amber-950">{o.menuItem?.title ?? 'Order'}</p>
                      <p className="text-sm text-stone-500 mt-0.5">for {o.buyer?.fullName ?? '—'}</p>
                      {o.milkOption && (
                        <p className="text-sm text-amber-800 mt-1 font-medium">🥛 {MILK_LABELS[o.milkOption] ?? o.milkOption}</p>
                      )}
                      {o.estimatedMinutes && (
                        <p className="text-xs text-green-700 mt-1 font-medium">⏱ {o.estimatedMinutes} min estimated</p>
                      )}
                    </div>
                    <p className="font-semibold text-amber-900 shrink-0">₪{o.menuItem?.price}</p>
                  </div>
                  <button
                    onClick={() => updateStatus(o.id, 'COMPLETED')}
                    disabled={!!actionLoading}
                    className="w-full py-2.5 rounded-xl text-sm font-medium bg-amber-900 text-amber-50 hover:bg-amber-800 disabled:opacity-50 transition-colors"
                  >
                    {actionLoading === o.id + 'COMPLETED' ? 'Completing…' : '✓ Mark as completed'}
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* DONE */}
        {done.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-3">History</h2>
            <div className="space-y-2">
              {done.map((o) => (
                <div key={o.id} className="bg-white rounded-xl border border-stone-200 px-4 py-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-stone-700">{o.menuItem?.title ?? 'Order'}</p>
                    <p className="text-xs text-stone-400">{o.buyer?.fullName ?? '—'} · {new Date(o.createdAt).toLocaleDateString('he-IL')}</p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-lg border ${STATUS_COLOR[o.status]}`}>
                    {STATUS_LABEL[o.status]}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {orders.length === 0 && (
          <div className="bg-white rounded-2xl border border-amber-200/80 p-12 text-center">
            <p className="text-stone-500 text-sm">No orders yet.</p>
            <p className="text-stone-400 text-xs mt-1">New orders will appear here automatically.</p>
          </div>
        )}
      </main>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
