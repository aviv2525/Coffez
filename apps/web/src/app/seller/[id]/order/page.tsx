'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';

type MenuItem = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  isAvailable: boolean;
};

const MILK_LABELS: Record<string, string> = {
  regular: 'רגיל / Regular',
  oat: 'שיבולת שועל / Oat',
  soy: 'סויה / Soy',
  almond: 'שקדים / Almond',
};

type Seller = {
  userId: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  milkOptions?: string[];
};

export default function OrderPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const sellerId = params.id as string;
  const menuItemId = searchParams.get('item');

  const [note, setNote] = useState('');
  const [milkOption, setMilkOption] = useState<string | null>(null);

  const { data: menuItem, isLoading: loadingMenuItem } = useQuery({
    queryKey: ['menu-item', sellerId, menuItemId],
    queryFn: async () => {
      const res = await apiFetch<MenuItem[]>(`/sellers/${sellerId}/menu`);
      if (res.error) throw new Error(res.error);
      const items = res.data ?? [];
      const item = items.find(i => i.id === menuItemId);
      if (!item) throw new Error('Menu item not found');
      return item;
    },
    enabled: !!menuItemId && !!sellerId,
  });

  const { data: seller, isLoading: loadingSeller } = useQuery({
    queryKey: ['seller', sellerId],
    queryFn: async () => {
      const res = await apiFetch<Seller>(`/sellers/${sellerId}`);
      if (res.error || !res.data) throw new Error(res.error || 'Not found');
      return res.data;
    },
    enabled: !!sellerId,
  });

  const createOrderMutation = useMutation({
    mutationFn: async (data: { sellerId: string; menuItemId: string; note: string | null; milkOption: string | null }) => {
      const res = await apiFetch('/orders', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (res.status === 401) throw new Error('UNAUTHORIZED');
      if (res.error) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => {
      router.push('/orders');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!menuItemId || !sellerId) return;

    createOrderMutation.mutate({
      sellerId,
      menuItemId,
      note: note.trim() || null,
      milkOption: milkOption || null,
    });
  };

  if (loadingMenuItem || loadingSeller) {
    return (
      <div className="min-h-screen bg-amber-50/40 flex items-center justify-center">
        <div className="animate-pulse h-10 w-48 bg-amber-200/50 rounded" />
      </div>
    );
  }

  if (!menuItem || !seller) {
    return (
      <div className="min-h-screen bg-amber-50/40 flex items-center justify-center">
        <div className="text-center">
          <p className="text-amber-900">Item or seller not found.</p>
          <Link href="/marketplace" className="text-amber-800 hover:text-amber-950 mt-2 inline-block">
            Back to marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50/40">
      <header className="border-b border-amber-200/60 bg-white/90 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-amber-950">COFFEZ</Link>
          <Link href={`/seller/${sellerId}`} className="text-amber-900/80 hover:text-amber-950">
            ← Back to {seller.displayName}
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-amber-950 mb-2">Place your order</h1>
          <p className="text-stone-600 mb-6">Confirm your order details below.</p>

          <div className="bg-white rounded-xl border border-amber-200/80 p-6 mb-6">
            <div className="flex items-start gap-4">
              {menuItem.imageUrl && (
                <img
                  src={menuItem.imageUrl}
                  alt={menuItem.title}
                  className="w-16 h-16 rounded-lg object-cover border border-amber-200/80"
                />
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-amber-950">{menuItem.title}</h3>
                {menuItem.description && (
                  <p className="text-sm text-stone-600 mt-1">{menuItem.description}</p>
                )}
                <p className="text-amber-800 font-semibold mt-2">₪{menuItem.price}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-amber-950 mb-2">
                Milk — חלב
              </label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(MILK_LABELS).map(([opt, label]) => {
                  const available = seller.milkOptions?.includes(opt) ?? false;
                  const selected = milkOption === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      disabled={!available}
                      onClick={() => setMilkOption(selected ? null : opt)}
                      className={`px-4 py-2 rounded-xl text-sm border transition-colors flex flex-col items-center ${
                        !available
                          ? 'border-stone-200 text-stone-300 bg-stone-50 cursor-not-allowed'
                          : selected
                          ? 'bg-amber-900 text-amber-50 border-amber-900'
                          : 'border-amber-200 text-stone-700 hover:bg-amber-50'
                      }`}
                    >
                      {label}
                      {!available && <span className="text-[10px] text-stone-300 mt-0.5">אין במלאי</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label htmlFor="note" className="block text-sm font-medium text-amber-950 mb-2">
                Special instructions (optional)
              </label>
              <textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Any special requests or notes for your order..."
                className="w-full border border-amber-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-300 focus:border-amber-400 outline-none resize-none"
                rows={3}
              />
            </div>

            <button
              type="submit"
              disabled={createOrderMutation.isPending}
              className="w-full py-3 px-4 rounded-xl font-medium bg-amber-900 text-amber-50 hover:bg-amber-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createOrderMutation.isPending ? 'Placing order...' : 'Place order'}
            </button>

            {createOrderMutation.error && (
              createOrderMutation.error.message === 'UNAUTHORIZED' ? (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                  <p className="text-sm font-medium text-amber-900 mb-1">כדי להזמין יש ליצור חשבון</p>
                  <p className="text-xs text-stone-500 mb-3">You need an account to place an order</p>
                  <Link
                    href={`/auth/register?redirect=/seller/${sellerId}/order?item=${menuItemId}`}
                    className="inline-block px-5 py-2 rounded-xl bg-amber-900 text-amber-50 text-sm font-medium hover:bg-amber-800 transition-colors"
                  >
                    Create account →
                  </Link>
                  <Link href="/auth/login" className="block mt-2 text-xs text-amber-800 hover:underline">
                    Already have an account? Log in
                  </Link>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
                  Failed to place order: {createOrderMutation.error.message}
                </div>
              )
            )}
          </form>
        </div>
      </main>
    </div>
  );
}