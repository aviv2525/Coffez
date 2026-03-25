'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

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
  const [imageUrl, setImageUrl] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function uploadMenuImage(file: File) {
    setUploading(true);
    const form = new FormData();
    form.append('file', file);
    form.append('upload_preset', UPLOAD_PRESET);
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      { method: 'POST', body: form }
    );
    const json = await res.json();
    setUploading(false);
    if (res.ok && json.secure_url) {
      setImageUrl(json.secure_url);
    } else {
      setError('Image upload failed. Please try again.');
    }
  }

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

  function resetForm() {
    setEditingItemId(null);
    setTitle('');
    setDescription('');
    setPrice('');
    setImageUrl('');
    setIsAvailable(true);
  }

  async function handleSaveItem(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !price.trim()) return;

    setSubmitting(true);
    setError(null);

    const numericPrice = Number(price);
    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      price: numericPrice,
      imageUrl: imageUrl.trim() || null,
      isAvailable,
    };

    try {
      if (editingItemId) {
        const res = await apiFetch<MenuItem>(`/menu/${editingItemId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        if (res.error || !res.data) {
          setError(res.error || 'Failed to update item');
          return;
        }

        setMenu((prev) => prev.map((i) => (i.id === editingItemId ? res.data! : i)));
        resetForm();
        return;
      }

      const createRes = await apiFetch<MenuItem>('/menu', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (createRes.error || !createRes.data) {
        setError(createRes.error || 'Failed to add item');
        return;
      }

      setMenu((prev) => [...prev, createRes.data!]);
      resetForm();
    } finally {
      setSubmitting(false);
    }
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

  function startEditItem(item: MenuItem) {
    setEditingItemId(item.id);
    setTitle(item.title);
    setDescription(item.description ?? '');
    setPrice(String(item.price));
    setImageUrl(item.imageUrl ?? '');
    setIsAvailable(item.isAvailable);
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
          <h2 className="text-lg font-semibold text-amber-950 mb-4">
            {editingItemId ? 'Edit item' : 'Add new item'}
          </h2>
          <form onSubmit={handleSaveItem} className="space-y-4">
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
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Image (optional)</label>
              {imageUrl && (
                <img src={imageUrl} alt="Preview" className="w-20 h-20 rounded-xl object-cover border border-amber-200/80 mb-2" />
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadMenuImage(f); }}
              />
              <div className="flex gap-2 items-center">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-1.5 py-2 px-3 rounded-xl text-sm font-medium border border-amber-300 text-amber-900 hover:bg-amber-50 disabled:opacity-50 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {uploading ? 'Uploading…' : 'Choose image'}
                </button>
                <span className="text-xs text-stone-400">or</span>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="paste a URL"
                  className="flex-1 border border-amber-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-amber-300 focus:border-amber-400 outline-none"
                />
              </div>
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
            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center rounded-xl bg-amber-900 px-4 py-2.5 text-sm font-medium text-amber-50 hover:bg-amber-800 disabled:opacity-50"
              >
                {submitting ? (editingItemId ? 'Saving…' : 'Adding…') : editingItemId ? 'Save changes' : 'Add item'}
              </button>
              {editingItemId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex items-center justify-center rounded-xl border border-amber-200 bg-white px-4 py-2.5 text-sm font-medium text-amber-900 hover:bg-amber-50"
                >
                  Cancel
                </button>
              )}
            </div>
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
                  <div className="flex items-start gap-3">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-14 h-14 rounded-xl object-cover border border-amber-200/80"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl border border-amber-200/80 bg-amber-50 flex items-center justify-center text-amber-300">
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M7 3a4 4 0 0 0-4 4v2a4 4 0 0 0 4 4h2v2a4 4 0 0 0 4 4h6a4 4 0 0 0 4-4v-1a3 3 0 0 0-3-3h-1V7a4 4 0 0 0-4-4H7zm0 2h8a2 2 0 0 1 2 2v6h1a1 1 0 0 1 1 1v1a2 2 0 0 1-2 2h-6a2 2 0 0 1-2-2v-2H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" />
                        </svg>
                      </div>
                    )}
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
                      onClick={() => startEditItem(item)}
                      className="px-3 py-1.5 rounded-xl text-xs font-medium border border-amber-200 text-amber-900 hover:bg-amber-50"
                    >
                      Edit
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
