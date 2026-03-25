'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { apiFetch } from '@/lib/api';

type OnboardingState = 'loading' | 'ready' | 'error';

type SellerProfile = {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
};

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

export default function SellerSettingsPage() {
  const router = useRouter();
  const [state, setState] = useState<OnboardingState>('loading');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [editing, setEditing] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function ensureSellerProfile() {
      const res = await apiFetch<SellerProfile>('/sellers/me');
      if (cancelled) return;

      if (res.status === 401) {
        router.replace('/auth/login');
        return;
      }

      if (res.status === 404) {
        const createRes = await apiFetch<SellerProfile>('/sellers/me', {
          method: 'POST',
          body: JSON.stringify({ displayName: 'My shop' }),
        });
        if (cancelled) return;
        if (createRes.error || createRes.status >= 400) {
          setState('error');
          return;
        }
        setAvatarUrl(createRes.data?.avatarUrl ?? '');
        setUrlInput(createRes.data?.avatarUrl ?? '');
      } else if (res.error && res.status !== 200) {
        setState('error');
        return;
      } else {
        setAvatarUrl(res.data?.avatarUrl ?? '');
        setUrlInput(res.data?.avatarUrl ?? '');
      }

      setState('ready');
    }

    ensureSellerProfile();
    return () => { cancelled = true; };
  }, [router]);

  async function uploadFile(file: File) {
    setUploading(true);
    setSaveMsg(null);
    console.log('Cloudinary upload → cloud_name:', CLOUD_NAME, '| upload_preset:', UPLOAD_PRESET);
    const form = new FormData();
    form.append('file', file);
    form.append('upload_preset', UPLOAD_PRESET);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      { method: 'POST', body: form }
    );
    const json = await res.json();
    setUploading(false);

    if (!res.ok || !json.secure_url) {
      setSaveMsg('Upload failed. Please try again.');
      return;
    }

    setUrlInput(json.secure_url);
    await saveAvatarUrl(json.secure_url);
  }

  async function saveAvatarUrl(url: string) {
    setSaving(true);
    setSaveMsg(null);
    const res = await apiFetch<SellerProfile>('/sellers/me', {
      method: 'PATCH',
      body: JSON.stringify({ avatarUrl: url.trim() || null }),
    });
    setSaving(false);
    if (res.error || res.status >= 400) {
      setSaveMsg('Failed to save. Please try again.');
    } else {
      const saved = res.data?.avatarUrl ?? url;
      setAvatarUrl(saved);
      setUrlInput(saved);
      setSaveMsg('Saved!');
      setEditing(false);
    }
  }

  if (state === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <p className="text-amber-900/80">Checking seller status…</p>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <p className="text-amber-900 mb-4">Something went wrong. Please try again.</p>
        <Link href="/" className="text-amber-800 hover:text-amber-950 font-medium">Back to home</Link>
      </div>
    );
  }

  const isBusy = uploading || saving;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-amber-200/60 bg-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-amber-950">COFFEZ</Link>
          <nav className="flex gap-4">
            <Link href="/marketplace" className="text-amber-900/80 hover:text-amber-950">Marketplace</Link>
            <Link href="/orders" className="text-amber-900/80 hover:text-amber-950">Orders</Link>
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8 bg-amber-50/30 min-h-screen">
        <h1 className="text-2xl font-bold text-amber-950 mb-6">Seller settings</h1>

        {/* Profile image / cover */}
        <div className="bg-white rounded-2xl border border-amber-200/80 p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-amber-950">Profile image / cover</h2>
            {!editing && (
              <button
                onClick={() => { setEditing(true); setSaveMsg(null); }}
                className="text-sm text-amber-800 hover:text-amber-950 font-medium border border-amber-200 rounded-lg px-3 py-1.5 hover:bg-amber-50 transition-colors"
              >
                Edit image
              </button>
            )}
          </div>

          {/* Preview */}
          <div className="mb-4 w-full aspect-[4/3] max-w-xs rounded-xl overflow-hidden bg-amber-50 border border-amber-200/80">
            {(editing ? urlInput : avatarUrl) ? (
              <img
                src={editing ? urlInput : avatarUrl}
                alt="Cover preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-amber-300">
                <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                </svg>
              </div>
            )}
          </div>

          {/* Edit panel */}
          {editing && (
            <div className="space-y-4">
              {/* Upload from computer */}
              <div>
                <p className="text-sm font-medium text-amber-900 mb-2">Upload from computer</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadFile(file);
                  }}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isBusy}
                  className="flex items-center gap-2 py-2 px-4 rounded-xl text-sm font-medium border border-amber-300 text-amber-900 hover:bg-amber-50 disabled:opacity-50 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {uploading ? 'Uploading…' : 'Choose image'}
                </button>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-amber-100" />
                <span className="text-xs text-stone-400">or paste a URL</span>
                <div className="flex-1 h-px bg-amber-100" />
              </div>

              {/* URL input */}
              <div>
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => { setUrlInput(e.target.value); setSaveMsg(null); }}
                  placeholder="https://example.com/photo.jpg"
                  className="w-full rounded-xl border border-amber-200 px-3 py-2 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
                <p className="text-xs text-stone-500 mt-1">
                  This image will be shown as your public profile cover
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => saveAvatarUrl(urlInput)}
                  disabled={isBusy}
                  className="py-2 px-5 rounded-xl text-sm font-medium bg-amber-900 text-amber-50 hover:bg-amber-800 disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <button
                  onClick={() => { setEditing(false); setUrlInput(avatarUrl); setSaveMsg(null); }}
                  disabled={isBusy}
                  className="py-2 px-4 rounded-xl text-sm font-medium text-stone-500 hover:text-stone-700 transition-colors"
                >
                  Cancel
                </button>
              </div>

              {saveMsg && (
                <p className={`text-sm ${saveMsg === 'Saved!' ? 'text-green-700' : 'text-red-600'}`}>
                  {saveMsg}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="bg-white rounded-2xl border border-amber-200/80 p-6 space-y-4">
          <Link href="/settings/seller/menu" className="block text-amber-800 hover:text-amber-950 font-medium">
            → Manage menu
          </Link>
          <Link href="/settings/seller/media" className="block text-amber-800 hover:text-amber-950 font-medium">
            → Manage media gallery (photos of your setup)
          </Link>
        </div>
      </main>
    </div>
  );
}
