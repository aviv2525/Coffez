'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;
const MAX_ITEMS = 20;

type MediaItem = {
  id: string;
  type: 'IMAGE' | 'VIDEO';
  url: string;
  thumbnailUrl: string | null;
  title: string | null;
  caption: string | null;
  sortOrder: number;
};

type SellerProfile = { userId: string };

export default function SellerMediaPage() {
  const router = useRouter();
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const sellerRes = await apiFetch<SellerProfile>('/sellers/me');
      if (cancelled) return;
      if (sellerRes.status === 401) { router.replace('/auth/login'); return; }
      if (sellerRes.error || !sellerRes.data) { setLoadState('error'); return; }

      const mediaRes = await apiFetch<MediaItem[]>(`/sellers/${sellerRes.data.userId}/media`);
      if (cancelled) return;
      setMedia(mediaRes.data ?? []);
      setLoadState('ready');
    }
    load();
    return () => { cancelled = true; };
  }, [router]);

  async function uploadFile(file: File) {
    if (media.length >= MAX_ITEMS) { setError(`Maximum ${MAX_ITEMS} photos allowed.`); return; }
    setUploading(true);
    setError(null);
    const form = new FormData();
    form.append('file', file);
    form.append('upload_preset', UPLOAD_PRESET);
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      { method: 'POST', body: form }
    );
    const json = await res.json();
    setUploading(false);
    if (!res.ok || !json.secure_url) { setError('Upload failed. Please try again.'); return; }
    await addMediaItem(json.secure_url, 'IMAGE');
  }

  async function addMediaItem(url: string, type: 'IMAGE' | 'VIDEO') {
    const res = await apiFetch<MediaItem>('/sellers/me/media', {
      method: 'POST',
      body: JSON.stringify({ type, url, sortOrder: media.length }),
    });
    if (res.error || !res.data) { setError(res.error || 'Failed to add photo.'); return; }
    setMedia((prev) => [...prev, res.data!]);
    setUrlInput('');
  }

  async function deleteItem(id: string) {
    const prev = media;
    setMedia((m) => m.filter((i) => i.id !== id));
    const res = await apiFetch(`/sellers/me/media/${id}`, { method: 'DELETE' });
    if (res.error || res.status >= 400) { setMedia(prev); setError('Failed to delete.'); }
  }

  async function moveItem(idx: number, dir: -1 | 1) {
    const sorted = [...media].sort((a, b) => a.sortOrder - b.sortOrder);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;

    const a = sorted[idx];
    const b = sorted[swapIdx];
    const newSorted = sorted.map((item) => {
      if (item.id === a.id) return { ...item, sortOrder: b.sortOrder };
      if (item.id === b.id) return { ...item, sortOrder: a.sortOrder };
      return item;
    });
    setMedia(newSorted);

    await Promise.all([
      apiFetch(`/sellers/me/media/${a.id}`, { method: 'PATCH', body: JSON.stringify({ sortOrder: b.sortOrder }) }),
      apiFetch(`/sellers/me/media/${b.id}`, { method: 'PATCH', body: JSON.stringify({ sortOrder: a.sortOrder }) }),
    ]);
  }

  if (loadState === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-amber-900/80">Loading gallery…</p>
      </div>
    );
  }

  if (loadState === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <p className="text-amber-900 mb-4">Something went wrong.</p>
        <Link href="/settings/seller" className="text-amber-800 hover:text-amber-950 font-medium">← Back</Link>
      </div>
    );
  }

  const atLimit = media.length >= MAX_ITEMS;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-amber-200/60 bg-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-amber-950">COFFEZ</Link>
          <Link href="/settings/seller" className="text-gray-600 hover:text-gray-900">← Seller settings</Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-amber-950 mb-1">Business gallery</h1>
        <p className="text-sm text-stone-500 mb-6">
          Photos of your setup — machine, workspace, beans. Shown on your public profile to build trust with buyers.
        </p>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Add new photo */}
        {!atLimit && (
          <div className="bg-white rounded-2xl border border-amber-200/80 p-6 mb-6">
            <h2 className="text-base font-semibold text-amber-950 mb-4">Add photo</h2>

            {/* Upload from computer */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(f); }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 py-2 px-4 rounded-xl text-sm font-medium border border-amber-300 text-amber-900 hover:bg-amber-50 disabled:opacity-50 transition-colors mb-4"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {uploading ? 'Uploading…' : 'Upload from computer'}
            </button>

            {/* Or URL */}
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 h-px bg-amber-100" />
              <span className="text-xs text-stone-400">or paste a URL</span>
              <div className="flex-1 h-px bg-amber-100" />
            </div>
            <div className="flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className="flex-1 border border-amber-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-amber-300 focus:border-amber-400 outline-none"
              />
              <button
                onClick={() => { if (urlInput.trim()) addMediaItem(urlInput.trim(), 'IMAGE'); }}
                disabled={!urlInput.trim()}
                className="py-2 px-4 rounded-xl text-sm font-medium bg-amber-900 text-amber-50 hover:bg-amber-800 disabled:opacity-50 transition-colors"
              >
                Add
              </button>
            </div>
            <p className="text-xs text-stone-400 mt-2">{media.length} / {MAX_ITEMS} photos</p>
          </div>
        )}

        {atLimit && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            You&apos;ve reached the maximum of {MAX_ITEMS} photos.
          </div>
        )}

        {/* Gallery grid */}
        {media.length === 0 ? (
          <div className="bg-white rounded-2xl border border-amber-200/80 p-12 text-center">
            <p className="text-stone-500">No photos yet. Add your first one above.</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-stone-400 mb-3">
              The <span className="font-semibold text-amber-800">first photo</span> appears as your profile hero image (when no cover image is set). Use ↑ ↓ to reorder.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...media].sort((a, b) => a.sortOrder - b.sortOrder).map((item, idx, arr) => (
                <div key={item.id} className="relative group rounded-xl overflow-hidden aspect-square bg-amber-50 border border-amber-200/80">
                  {idx === 0 && (
                    <div className="absolute top-2 left-2 z-10 bg-amber-900/80 text-amber-50 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                      1st
                    </div>
                  )}
                  {item.type === 'IMAGE' ? (
                    <img src={item.url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <video src={item.url} className="w-full h-full object-cover" muted playsInline preload="metadata" />
                  )}
                  {/* Controls */}
                  <div className="absolute bottom-0 inset-x-0 flex items-center justify-between px-1.5 py-1.5 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-1">
                      <button
                        onClick={() => moveItem(idx, -1)}
                        disabled={idx === 0}
                        className="w-7 h-7 rounded-lg bg-white/20 hover:bg-white/40 text-white flex items-center justify-center disabled:opacity-30 transition-colors"
                        title="Move up"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => moveItem(idx, 1)}
                        disabled={idx === arr.length - 1}
                        className="w-7 h-7 rounded-lg bg-white/20 hover:bg-white/40 text-white flex items-center justify-center disabled:opacity-30 transition-colors"
                        title="Move down"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="w-7 h-7 rounded-lg bg-white/20 hover:bg-red-600 text-white flex items-center justify-center transition-colors"
                      title="Delete"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
