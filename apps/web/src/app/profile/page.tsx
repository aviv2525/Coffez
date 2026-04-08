'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';
import { Header } from '@/components/Header';
import { OnlineToggle } from '@/components/OnlineToggle';

type User = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  createdAt: string;
};

type SellerProfile = {
  displayName: string;
  isOnline: boolean;
  status: string;
  tier: string;
};

type Order = {
  id: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  estimatedMinutes: number | null;
  menuItem?: { title: string; price: number };
  seller?: { displayName: string; userId: string };
  buyer?: { fullName: string };
};

const STATUS_COLOR: Record<Order['status'], string> = {
  PENDING: 'bg-amber-100 text-amber-800',
  ACCEPTED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-700',
  COMPLETED: 'bg-stone-100 text-stone-600',
  CANCELLED: 'bg-stone-100 text-stone-400',
};

const STATUS_LABEL: Record<Order['status'], string> = {
  PENDING: 'Waiting',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

function Initials({ name }: { name: string }) {
  const parts = name.trim().split(' ');
  const letters = parts.length >= 2
    ? parts[0][0] + parts[parts.length - 1][0]
    : name.slice(0, 2);
  return (
    <div className="w-16 h-16 rounded-2xl bg-amber-900 flex items-center justify-center text-amber-50 text-xl font-bold shrink-0">
      {letters.toUpperCase()}
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { logout } = useAuth();
  const qc = useQueryClient();

  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState('');

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['user-me'],
    queryFn: async () => {
      const res = await apiFetch<User>('/users/me');
      if (res.status === 401) { router.replace('/auth/login'); return null; }
      if (res.error || !res.data) throw new Error('Failed');
      return res.data;
    },
  });

  const { data: sellerProfile, isLoading: sellerLoading } = useQuery({
    queryKey: ['seller-me-profile'],
    queryFn: async () => {
      const res = await apiFetch<SellerProfile>('/sellers/me');
      if (res.status === 404 || res.error) return null;
      return res.data ?? null;
    },
    enabled: !!user,
  });

  const isSeller = !!sellerProfile && sellerProfile.status === 'APPROVED';
  const isPendingSeller = !!sellerProfile && sellerProfile.status === 'PENDING';
  const isRejectedSeller = !!sellerProfile && sellerProfile.status === 'REJECTED';

  const { data: buyerOrders } = useQuery({
    queryKey: ['orders-my-profile'],
    queryFn: async () => {
      const res = await apiFetch<{ data: Order[] }>('/orders/my?limit=5');
      return res.data?.data ?? [];
    },
    enabled: !!user && !isSeller,
  });

  const { data: sellerOrders } = useQuery({
    queryKey: ['orders-incoming-profile'],
    queryFn: async () => {
      const res = await apiFetch<{ data: Order[] }>('/orders/incoming');
      return res.data?.data ?? [];
    },
    enabled: !!user && isSeller,
  });

  useEffect(() => {
    if (user) setNameInput(user.fullName);
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: async (fullName: string) => {
      const res = await apiFetch<User>('/users/me', {
        method: 'PATCH',
        body: JSON.stringify({ fullName }),
      });
      if (res.error || res.status >= 400) throw new Error('Failed');
      return res.data!;
    },
    onSuccess: (updated) => {
      qc.setQueryData(['user-me'], updated);
      setEditing(false);
    },
  });

  const isLoading = userLoading || (!!user && sellerLoading);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-24">
          <div className="animate-pulse h-8 w-48 bg-amber-100 rounded" />
        </div>
      </div>
    );
  }

  /* ── PENDING SELLER ── */
  if (isPendingSeller) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-6 max-w-lg">

          {/* Profile card — same as buyer */}
          <div className="bg-white rounded-2xl border border-amber-200/80 p-6 mb-4">
            <div className="flex items-center gap-4">
              <Initials name={user.fullName} />
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-bold text-amber-950 truncate">{user.fullName}</h1>
                <p className="text-sm text-stone-500 truncate">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Pending section */}
          <div className="bg-white rounded-2xl border border-amber-300/60 p-6 mb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-amber-950 text-sm">Application under review</p>
                <p className="text-xs text-stone-400">We're reviewing your seller application</p>
              </div>
            </div>
            <p className="text-sm text-stone-600 leading-relaxed">
              We're taking care of your request ☕<br />
              Approval usually takes <strong>24–48 hours</strong>. We may reach out by phone or email to verify a few details before activating your seller account.
            </p>
            <div className="mt-4 bg-amber-50 rounded-xl p-3 text-xs text-amber-800">
              <strong>Tier:</strong> {sellerProfile!.tier === 'BUSINESS' ? 'Business' : 'Home seller'}
            </div>
          </div>

          {/* Still can browse as buyer */}
          <div className="bg-white rounded-2xl border border-amber-200/80 overflow-hidden mb-4">
            <Link href="/orders" className="flex items-center gap-4 px-5 py-4 hover:bg-amber-50 transition-colors group border-b border-amber-100/80">
              <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-amber-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-stone-800">My orders</p>
                <p className="text-xs text-stone-400">Continue ordering coffee while you wait</p>
              </div>
              <svg className="w-4 h-4 text-stone-300 group-hover:text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link href="/marketplace" className="flex items-center gap-4 px-5 py-4 hover:bg-amber-50 transition-colors group">
              <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-amber-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-stone-800">Find Coffez</p>
                <p className="text-xs text-stone-400">Browse sellers & order coffee</p>
              </div>
              <svg className="w-4 h-4 text-stone-300 group-hover:text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <button
            onClick={async () => { await logout(); router.replace('/'); }}
            className="w-full py-3 rounded-2xl text-sm font-medium text-red-500 hover:text-red-700 border border-red-100 hover:bg-red-50 transition-colors"
          >
            Log out
          </button>

        </main>
      </div>
    );
  }

  /* ── SELLER PROFILE ── */
  if (isSeller) {
    const pending = (sellerOrders ?? []).filter((o) => o.status === 'PENDING');
    const recent = (sellerOrders ?? []).filter((o) =>
      ['COMPLETED', 'REJECTED', 'CANCELLED'].includes(o.status)
    ).slice(0, 3);

    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-6 max-w-lg">

          {/* Profile card */}
          <div className="bg-white rounded-2xl border border-amber-200/80 p-6 mb-4">
            <div className="flex items-center gap-4 mb-5">
              <Initials name={user.fullName} />
              <div className="flex-1 min-w-0">
                {editing ? (
                  <input
                    autoFocus
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') updateMutation.mutate(nameInput.trim());
                      if (e.key === 'Escape') { setEditing(false); setNameInput(user.fullName); }
                    }}
                    className="w-full text-lg font-bold border-b-2 border-amber-400 outline-none bg-transparent text-amber-950 pb-0.5"
                  />
                ) : (
                  <h1 className="text-lg font-bold text-amber-950 truncate">{user.fullName}</h1>
                )}
                <p className="text-sm text-stone-500 truncate">
                  <span className="text-[10px] text-stone-400 uppercase tracking-wide mr-1">Shop</span>
                  {sellerProfile.displayName}
                </p>
              </div>
              <OnlineToggle initialValue={sellerProfile.isOnline} />
            </div>

            {editing ? (
              <div className="flex gap-2">
                <button
                  onClick={() => updateMutation.mutate(nameInput.trim())}
                  disabled={updateMutation.isPending || !nameInput.trim()}
                  className="flex-1 py-2 rounded-xl text-sm font-medium bg-amber-900 text-amber-50 hover:bg-amber-800 disabled:opacity-50 transition-colors"
                >
                  {updateMutation.isPending ? 'Saving…' : 'Save'}
                </button>
                <button
                  onClick={() => { setEditing(false); setNameInput(user.fullName); }}
                  className="py-2 px-4 rounded-xl text-sm font-medium text-stone-500 hover:text-stone-700 border border-stone-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="w-full py-2 rounded-xl text-sm font-medium border border-amber-200 text-amber-800 hover:bg-amber-50 transition-colors"
              >
                Edit name
              </button>
            )}
          </div>

          {/* Pending orders banner */}
          {pending.length > 0 && (
            <Link href="/settings/seller/orders" className="block bg-amber-900 text-amber-50 rounded-2xl p-4 mb-4 hover:bg-amber-800 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-amber-300 mb-0.5">Incoming orders</p>
                  <p className="font-semibold">{pending.length} order{pending.length !== 1 ? 's' : ''} waiting</p>
                </div>
                <svg className="w-5 h-5 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          )}

          {/* Quick links */}
          <div className="bg-white rounded-2xl border border-amber-200/80 overflow-hidden mb-4">
            <Link href="/settings/seller/orders" className="flex items-center gap-4 px-5 py-4 hover:bg-amber-50 transition-colors group border-b border-amber-100/80">
              <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-amber-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-stone-800">Incoming orders</p>
                <p className="text-xs text-stone-400">Manage your orders</p>
              </div>
              <svg className="w-4 h-4 text-stone-300 group-hover:text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            <Link href="/settings/seller" className="flex items-center gap-4 px-5 py-4 hover:bg-amber-50 transition-colors group border-b border-amber-100/80">
              <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-amber-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-stone-800">My Shop</p>
                <p className="text-xs text-stone-400">Profile, menu & gallery</p>
              </div>
              <svg className="w-4 h-4 text-stone-300 group-hover:text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            <Link href="/marketplace" className="flex items-center gap-4 px-5 py-4 hover:bg-amber-50 transition-colors group border-b border-amber-100/80">
              <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-amber-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-stone-800">Order coffee</p>
                <p className="text-xs text-stone-400">Browse marketplace</p>
              </div>
              <svg className="w-4 h-4 text-stone-300 group-hover:text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            <Link href="/orders" className="flex items-center gap-4 px-5 py-4 hover:bg-amber-50 transition-colors group">
              <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-amber-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-stone-800">My orders</p>
                <p className="text-xs text-stone-400">Orders you placed</p>
              </div>
              <svg className="w-4 h-4 text-stone-300 group-hover:text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Recent received orders */}
          {recent.length > 0 && (
            <div className="bg-white rounded-2xl border border-amber-200/80 overflow-hidden mb-4">
              <div className="px-5 py-3 border-b border-amber-100 flex items-center justify-between">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-400">Recent orders received</h2>
                <Link href="/settings/seller/orders" className="text-xs text-amber-800 hover:underline flex items-center gap-0.5">
                  See all
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              <div className="divide-y divide-amber-50">
                {recent.map((o) => (
                  <div key={o.id} className="px-5 py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-stone-800 truncate">{o.menuItem?.title ?? 'Order'}</p>
                      <p className="text-xs text-stone-400 truncate">{o.buyer?.fullName ?? '—'} · {new Date(o.createdAt).toLocaleDateString('he-IL')}</p>
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-lg shrink-0 ${STATUS_COLOR[o.status]}`}>
                      {STATUS_LABEL[o.status]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Logout */}
          <button
            onClick={async () => { await logout(); router.replace('/'); }}
            className="w-full py-3 rounded-2xl text-sm font-medium text-red-500 hover:text-red-700 border border-red-100 hover:bg-red-50 transition-colors"
          >
            Log out
          </button>

        </main>
      </div>
    );
  }

  /* ── BUYER PROFILE ── */
  const orders = buyerOrders ?? [];
  const activeOrder = orders.find((o) => ['PENDING', 'ACCEPTED'].includes(o.status));

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-6 max-w-lg">

        {/* Profile card */}
        <div className="bg-white rounded-2xl border border-amber-200/80 p-6 mb-4">
          <div className="flex items-center gap-4 mb-5">
            <Initials name={user.fullName} />
            <div className="flex-1 min-w-0">
              {editing ? (
                <input
                  autoFocus
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') updateMutation.mutate(nameInput.trim());
                    if (e.key === 'Escape') { setEditing(false); setNameInput(user.fullName); }
                  }}
                  className="w-full text-lg font-bold border-b-2 border-amber-400 outline-none bg-transparent text-amber-950 pb-0.5"
                />
              ) : (
                <h1 className="text-lg font-bold text-amber-950 truncate">{user.fullName}</h1>
              )}
              <p className="text-sm text-stone-500 truncate">{user.email}</p>
            </div>
          </div>

          {editing ? (
            <div className="flex gap-2">
              <button
                onClick={() => updateMutation.mutate(nameInput.trim())}
                disabled={updateMutation.isPending || !nameInput.trim()}
                className="flex-1 py-2 rounded-xl text-sm font-medium bg-amber-900 text-amber-50 hover:bg-amber-800 disabled:opacity-50 transition-colors"
              >
                {updateMutation.isPending ? 'Saving…' : 'Save'}
              </button>
              <button
                onClick={() => { setEditing(false); setNameInput(user.fullName); }}
                className="py-2 px-4 rounded-xl text-sm font-medium text-stone-500 hover:text-stone-700 border border-stone-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="w-full py-2 rounded-xl text-sm font-medium border border-amber-200 text-amber-800 hover:bg-amber-50 transition-colors"
            >
              Edit name
            </button>
          )}
        </div>

        {/* Rejected seller banner */}
        {isRejectedSeller && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4 text-sm text-red-800">
            <p className="font-semibold mb-0.5">הבקשה שלך לא אושרה</p>
            <p className="text-xs text-red-600">לשאלות פנה אלינו בדוא"ל <a href="mailto:avivcoffez@gmail.com" className="underline">avivcoffez@gmail.com</a></p>
          </div>
        )}

        {/* Active order banner */}
        {activeOrder && (
          <Link href="/orders" className="block bg-amber-900 text-amber-50 rounded-2xl p-4 mb-4 hover:bg-amber-800 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-amber-300 mb-0.5">Active order</p>
                <p className="font-semibold">{activeOrder.menuItem?.title ?? 'Order'}</p>
                <p className="text-sm text-amber-200">{activeOrder.seller?.displayName}</p>
              </div>
              <div className="text-right">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${
                  activeOrder.status === 'ACCEPTED' ? 'bg-green-500/20 text-green-200' : 'bg-amber-700 text-amber-200'
                }`}>
                  {STATUS_LABEL[activeOrder.status]}
                </span>
                {activeOrder.status === 'ACCEPTED' && activeOrder.estimatedMinutes && (
                  <p className="text-xs text-amber-300 mt-1">~{activeOrder.estimatedMinutes} min</p>
                )}
              </div>
            </div>
          </Link>
        )}

        {/* Quick links */}
        <div className="bg-white rounded-2xl border border-amber-200/80 overflow-hidden mb-4">
          <Link href="/orders" className="flex items-center gap-4 px-5 py-4 hover:bg-amber-50 transition-colors group border-b border-amber-100/80">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-amber-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-stone-800">My orders</p>
              <p className="text-xs text-stone-400">Order history & status</p>
            </div>
            <svg className="w-4 h-4 text-stone-300 group-hover:text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          <Link href="/marketplace" className="flex items-center gap-4 px-5 py-4 hover:bg-amber-50 transition-colors group border-b border-amber-100/80">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-amber-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-stone-800">Find Coffez</p>
              <p className="text-xs text-stone-400">Browse sellers & order coffee</p>
            </div>
            <svg className="w-4 h-4 text-stone-300 group-hover:text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          <Link href="/become-seller" className="flex items-center gap-4 px-5 py-4 hover:bg-amber-50 transition-colors group">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-amber-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-stone-800">Become a seller</p>
              <p className="text-xs text-stone-400">Sell your homemade coffee on Coffez</p>
            </div>
            <svg className="w-4 h-4 text-stone-300 group-hover:text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Recent orders */}
        {orders.length > 0 && (
          <div className="bg-white rounded-2xl border border-amber-200/80 overflow-hidden mb-4">
            <div className="px-5 py-3 border-b border-amber-100 flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-400">Recent orders</h2>
              <Link href="/orders" className="text-xs text-amber-800 hover:underline">See all</Link>
            </div>
            <div className="divide-y divide-amber-50">
              {orders.slice(0, 5).map((o) => (
                <div key={o.id} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-stone-800 truncate">{o.menuItem?.title ?? 'Order'}</p>
                    <p className="text-xs text-stone-400 truncate">{o.seller?.displayName} · {new Date(o.createdAt).toLocaleDateString('he-IL')}</p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-lg shrink-0 ${STATUS_COLOR[o.status]}`}>
                    {STATUS_LABEL[o.status]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={async () => { await logout(); router.replace('/'); }}
          className="w-full py-3 rounded-2xl text-sm font-medium text-red-500 hover:text-red-700 border border-red-100 hover:bg-red-50 transition-colors"
        >
          Log out
        </button>

      </main>
    </div>
  );
}
