'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

type MenuItem = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  isAvailable: boolean;
};

type SellerProfile = {
  userId: string;
  displayName: string;
};

type LoadState = 'loading' | 'ready' | 'no-profile' | 'error';

export default function SellerMenuPage() {
  const router = useRouter();
  const [state, setState] = useState<LoadState>('loading');
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadMenu() {
      setError(null);
      setState('loading');

      const sellerRes = await apiFetch<SellerProfile>('/sellers/me');
      if (cancelled) return;

      if (sellerRes.status === 401) {
        router.replace('/auth/login');
        return;
      }

      if (sellerRes.status === 404) {
        setState('no-profile');
        return;
      }

      if (sellerRes.error || !sellerRes.data) {
        setError(sellerRes.error || 'Failed to load seller profile');
        setState('error');
        return;
      }

      const sellerId = sellerRes.data.userId;
      const menuRes = await apiFetch<MenuItem[]>(`/sellers/${sellerId}/menu`);
      if (cancelled) return;

      if (menuRes.error && menuRes.status !== 200) {
        setError(menuRes.error || 'Failed to load menu');
        setState('error');
        return;
      }

      setMenu(menuRes.data ?? []);
      setState('ready');
    }

    loadMenu();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleAddItem(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !price.trim()) return;

    setSubmitting(true);
    setError(null);

    const numericPrice = Number(price);
    const createRes = await apiFetch<MenuItem>('/menu', {
      method: 'POST',
      body: JSON.stringify({
        title: title.trim(),
        description: description.trim() || null,
        price: numericPrice,
        imageUrl: null,
        isAvailable,
      }),
    });
    setSubmitting(false);

    if (createRes.error || !createRes.data) {
      setError(createRes.error || 'Failed to add item');
      return;
    }

    setMenu((prev) => [...prev, createRes.data!]);
    setTitle('');
    setDescription('');
    setPrice('');
    setIsAvailable(true);
  }

  async function handleDeleteItem(id: string) {
    const prevMenu = menu;
    setMenu((items) => items.filter((i) => i.id !== id));

    const res = await apiFetch<unknown>(`/menu/${id}`, { method: 'DELETE' });
    if (res.error || res.status >= 400) {
      // revert on error
      setMenu(prevMenu);
      setError(res.error || 'Failed to delete item');
    }
  }

  async function handleToggleAvailability(item: MenuItem) {
    const nextAvailable = !item.isAvailable;
    setMenu((items) =>
      items.map((i) => (i.id === item.id ? { ...i, isAvailable: nextAvailable } : i)),
    );

    const res = await apiFetch<MenuItem>(`/menu/${item.id}/availability`, {
      method: 'PATCH',
      body: JSON.stringify({ isAvailable: nextAvailable }),
    });

    if (res.error || res.status >= 400 || !res.data) {
      // revert on error
      setMenu((items) =>
        items.map((i) => (i.id === item.id ? { ...i, isAvailable: item.isAvailable } : i)),
      );
      setError(res.error || 'Failed to update availability');
    } else {
      setMenu((items) =>
        items.map((i) => (i.id === item.id ? { ...i, isAvailable: res.data!.isAvailable } : i)),
      );
    }
  }

  if (state === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <p className="text-amber-900/80">Loading your menu…</p>
      </div>
    );
  }

  if (state === 'no-profile') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <p className="text-amber-900 mb-4">
          You do not have a seller profile yet. First complete your seller settings.
        </p>
        <Link href="/settings/seller" className="text-amber-800 hover:text-amber-950 font-medium">
          Go to seller settings
        </Link>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <p className="text-amber-900 mb-2">Something went wrong loading your menu.</p>
        {error && <p className="text-sm text-stone-600 mb-4">{error}</p>}
        <Link href="/settings/seller" className="text-amber-800 hover:text-amber-950 font-medium">
          ← Back to seller settings
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-amber-200/60 bg-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-amber-950">
            COFFEZ
          </Link>
          <Link href="/settings/seller" className="text-gray-600 hover:text-gray-900">
            ← Seller settings
          </Link>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 text-amber-950">Manage menu</h1>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="mb-8 bg-white rounded-2xl border border-amber-200/80 p-6">
          <h2 className="text-lg font-semibold text-amber-950 mb-4">Add new item</h2>
          <form onSubmit={handleAddItem} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-amber-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-300 focus:border-amber-400 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Description (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-amber-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-300 focus:border-amber-400 outline-none"
                rows={3}
              />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-stone-700 mb-1">Price (₪)</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full border border-amber-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-300 focus:border-amber-400 outline-none"
                  required
                />
              </div>
              <label className="inline-flex items-center gap-2 text-sm text-stone-700">
                <input
                  type="checkbox"
                  checked={isAvailable}
                  onChange={(e) => setIsAvailable(e.target.checked)}
                  className="rounded border-amber-300 text-amber-900 focus:ring-amber-400"
                />
                Available
              </label>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center rounded-xl bg-amber-900 px-4 py-2.5 text-sm font-medium text-amber-50 hover:bg-amber-800 disabled:opacity-50"
            >
              {submitting ? 'Adding…' : 'Add item'}
            </button>
          </form>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-amber-950 mb-3">Your menu</h2>
          {menu.length === 0 ? (
            <p className="text-stone-600 text-sm">
              You don&apos;t have any menu items yet. Add your first drink above.
            </p>
          ) : (
            <div className="space-y-3">
              {menu.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-amber-200/80 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-amber-950">{item.title}</h3>
                      <span className="text-amber-800 font-medium text-sm">₪{item.price}</span>
                    </div>
                    {item.description && (
                      <p className="mt-1 text-sm text-stone-600">{item.description}</p>
                    )}
                    <p className="mt-1 text-xs text-stone-500">
                      {item.isAvailable ? 'Available for orders' : 'Currently unavailable'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => handleToggleAvailability(item)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border ${
                        item.isAvailable
                          ? 'border-amber-300 text-amber-900 hover:bg-amber-50'
                          : 'border-stone-300 text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      {item.isAvailable ? 'Mark unavailable' : 'Mark available'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(item.id)}
                      className="px-3 py-1.5 rounded-xl text-xs font-medium border border-red-200 text-red-700 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
