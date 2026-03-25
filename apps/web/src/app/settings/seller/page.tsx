'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { apiFetch } from '@/lib/api';

type OnboardingState = 'loading' | 'ready' | 'error';

type SellerProfile = {
  userId: string;
  displayName: string;
  bio: string | null;
  locationText: string | null;
  openingHours: string | null;
  machineType: string | null;
  beans: string[];
  drinkTypes: string[];
  avatarUrl: string | null;
};

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

export default function SellerSettingsPage() {
  const router = useRouter();
  const [state, setState] = useState<OnboardingState>('loading');

  // Avatar
  const [avatarUrl, setAvatarUrl] = useState('');
  const [editingAvatar, setEditingAvatar] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [avatarSaving, setAvatarSaving] = useState(false);
  const [avatarMsg, setAvatarMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile details
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [locationText, setLocationText] = useState('');
  const [openingHours, setOpeningHours] = useState('');
  const [machineType, setMachineType] = useState('');
  const [beans, setBeans] = useState('');
  const [drinkTypes, setDrinkTypes] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function ensureSellerProfile() {
      const res = await apiFetch<SellerProfile>('/sellers/me');
      if (cancelled) return;

      if (res.status === 401) { router.replace('/auth/login'); return; }

      if (res.status === 404) {
        const createRes = await apiFetch<SellerProfile>('/sellers/me', {
          method: 'POST',
          body: JSON.stringify({ displayName: 'My shop' }),
        });
        if (cancelled) return;
        if (createRes.error || createRes.status >= 400) { setState('error'); return; }
        populateFields(createRes.data!);
      } else if (res.error && res.status !== 200) {
        setState('error');
        return;
      } else {
        populateFields(res.data!);
      }

      setState('ready');
    }

    ensureSellerProfile();
    return () => { cancelled = true; };
  }, [router]);

  function populateFields(p: SellerProfile) {
    setAvatarUrl(p.avatarUrl ?? '');
    setUrlInput(p.avatarUrl ?? '');
    setDisplayName(p.displayName ?? '');
    setBio(p.bio ?? '');
    setLocationText(p.locationText ?? '');
    setOpeningHours(p.openingHours ?? '');
    setMachineType(p.machineType ?? '');
    setBeans((p.beans ?? []).join(', '));
    setDrinkTypes((p.drinkTypes ?? []).join(', '));
  }

  async function uploadFile(file: File) {
    setUploading(true);
    setAvatarMsg(null);
    const form = new FormData();
    form.append('file', file);
    form.append('upload_preset', UPLOAD_PRESET);
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      { method: 'POST', body: form }
    );
    const json = await res.json();
    setUploading(false);
    if (!res.ok || !json.secure_url) { setAvatarMsg('Upload failed. Please try again.'); return; }
    setUrlInput(json.secure_url);
    await saveAvatarUrl(json.secure_url);
  }

  async function saveAvatarUrl(url: string) {
    setAvatarSaving(true);
    setAvatarMsg(null);
    const res = await apiFetch<SellerProfile>('/sellers/me', {
      method: 'PATCH',
      body: JSON.stringify({ avatarUrl: url.trim() || null }),
    });
    setAvatarSaving(false);
    if (res.error || res.status >= 400) {
      setAvatarMsg('Failed to save. Please try again.');
    } else {
      const saved = res.data?.avatarUrl ?? url;
      setAvatarUrl(saved);
      setUrlInput(saved);
      setAvatarMsg('Saved!');
      setEditingAvatar(false);
    }
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg(null);
    const res = await apiFetch<SellerProfile>('/sellers/me', {
      method: 'PATCH',
      body: JSON.stringify({
        displayName: displayName.trim() || undefined,
        bio: bio.trim() || null,
        locationText: locationText.trim() || null,
        openingHours: openingHours.trim() || null,
        machineType: machineType.trim() || null,
        beans: beans.split(',').map((b) => b.trim()).filter(Boolean),
        drinkTypes: drinkTypes.split(',').map((d) => d.trim()).filter(Boolean),
      }),
    });
    setProfileSaving(false);
    if (res.error || res.status >= 400) {
      setProfileMsg('Failed to save. Please try again.');
    } else {
      setProfileMsg('Saved!');
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

  const avatarBusy = uploading || avatarSaving;

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

      <main className="container mx-auto px-4 py-8 bg-amber-50/30 min-h-screen max-w-2xl">
        <h1 className="text-2xl font-bold text-amber-950 mb-6">Seller settings</h1>

        {/* Profile image / cover */}
        <div className="bg-white rounded-2xl border border-amber-200/80 p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-amber-950">Profile image / cover</h2>
            {!editingAvatar && (
              <button
                onClick={() => { setEditingAvatar(true); setAvatarMsg(null); }}
                className="text-sm text-amber-800 hover:text-amber-950 font-medium border border-amber-200 rounded-lg px-3 py-1.5 hover:bg-amber-50 transition-colors"
              >
                Edit image
              </button>
            )}
          </div>

          <div className="mb-4 w-full aspect-[4/3] max-w-xs rounded-xl overflow-hidden bg-amber-50 border border-amber-200/80">
            {(editingAvatar ? urlInput : avatarUrl) ? (
              <img src={editingAvatar ? urlInput : avatarUrl} alt="Cover preview" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-amber-300">
                <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                </svg>
              </div>
            )}
          </div>

          {editingAvatar && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-amber-900 mb-2">Upload from computer</p>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(f); }} />
                <button onClick={() => fileInputRef.current?.click()} disabled={avatarBusy}
                  className="flex items-center gap-2 py-2 px-4 rounded-xl text-sm font-medium border border-amber-300 text-amber-900 hover:bg-amber-50 disabled:opacity-50 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {uploading ? 'Uploading…' : 'Choose image'}
                </button>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-amber-100" />
                <span className="text-xs text-stone-400">or paste a URL</span>
                <div className="flex-1 h-px bg-amber-100" />
              </div>
              <input type="url" value={urlInput}
                onChange={(e) => { setUrlInput(e.target.value); setAvatarMsg(null); }}
                placeholder="https://example.com/photo.jpg"
                className="w-full rounded-xl border border-amber-200 px-3 py-2 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-400" />
              <div className="flex items-center gap-3">
                <button onClick={() => saveAvatarUrl(urlInput)} disabled={avatarBusy}
                  className="py-2 px-5 rounded-xl text-sm font-medium bg-amber-900 text-amber-50 hover:bg-amber-800 disabled:opacity-50 transition-colors">
                  {avatarSaving ? 'Saving…' : 'Save'}
                </button>
                <button onClick={() => { setEditingAvatar(false); setUrlInput(avatarUrl); setAvatarMsg(null); }} disabled={avatarBusy}
                  className="py-2 px-4 rounded-xl text-sm font-medium text-stone-500 hover:text-stone-700 transition-colors">
                  Cancel
                </button>
              </div>
              {avatarMsg && (
                <p className={`text-sm ${avatarMsg === 'Saved!' ? 'text-green-700' : 'text-red-600'}`}>{avatarMsg}</p>
              )}
            </div>
          )}
        </div>

        {/* Profile details */}
        <div className="bg-white rounded-2xl border border-amber-200/80 p-6 mb-4">
          <h2 className="text-base font-semibold text-amber-950 mb-4">Profile details</h2>
          <form onSubmit={saveProfile} className="space-y-4">

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Shop name</label>
              <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                className="w-full border border-amber-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-300 focus:border-amber-400 outline-none" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Bio</label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3}
                placeholder="Tell buyers about yourself and your coffee…"
                className="w-full border border-amber-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-300 focus:border-amber-400 outline-none resize-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Location</label>
              <input type="text" value={locationText} onChange={(e) => setLocationText(e.target.value)}
                placeholder="e.g. Tel Aviv, Florentin"
                className="w-full border border-amber-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-300 focus:border-amber-400 outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Opening hours</label>
              <textarea value={openingHours} onChange={(e) => setOpeningHours(e.target.value)} rows={2}
                placeholder="e.g. Sun–Thu 7:00–14:00"
                className="w-full border border-amber-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-300 focus:border-amber-400 outline-none resize-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Machine / equipment</label>
              <input type="text" value={machineType} onChange={(e) => setMachineType(e.target.value)}
                placeholder="e.g. Breville Barista Express"
                className="w-full border border-amber-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-300 focus:border-amber-400 outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Beans in stock</label>
              <input type="text" value={beans} onChange={(e) => setBeans(e.target.value)}
                placeholder="e.g. Ethiopia Yirgacheffe, Colombia Huila"
                className="w-full border border-amber-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-300 focus:border-amber-400 outline-none" />
              <p className="text-xs text-stone-400 mt-1">Separate with commas</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Drinks I make</label>
              <input type="text" value={drinkTypes} onChange={(e) => setDrinkTypes(e.target.value)}
                placeholder="e.g. Espresso, Cappuccino, Pour over"
                className="w-full border border-amber-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-300 focus:border-amber-400 outline-none" />
              <p className="text-xs text-stone-400 mt-1">Separate with commas</p>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button type="submit" disabled={profileSaving}
                className="py-2 px-5 rounded-xl text-sm font-medium bg-amber-900 text-amber-50 hover:bg-amber-800 disabled:opacity-50 transition-colors">
                {profileSaving ? 'Saving…' : 'Save profile'}
              </button>
              {profileMsg && (
                <p className={`text-sm ${profileMsg === 'Saved!' ? 'text-green-700' : 'text-red-600'}`}>{profileMsg}</p>
              )}
            </div>
          </form>
        </div>

        {/* Navigation */}
        <div className="bg-white rounded-2xl border border-amber-200/80 p-6 space-y-4">
          <Link href="/settings/seller/menu" className="block text-amber-800 hover:text-amber-950 font-medium">
            → Manage menu
          </Link>
          <Link href="/settings/seller/media" className="block text-amber-800 hover:text-amber-950 font-medium">
            → Business gallery (photos of your setup)
          </Link>
        </div>
      </main>
    </div>
  );
}
