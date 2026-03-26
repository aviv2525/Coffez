'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { OnlineToggle } from '@/components/OnlineToggle';

type OnboardingState = 'loading' | 'ready' | 'error';
type Section = 'profile' | 'image';


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
  lat: number | null;
  lng: number | null;
  pickupDetails: string | null;
  isOnline: boolean;
};

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

const NAV = [
  {
    key: 'profile' as Section,
    label: 'Profile',
    sub: 'Name, bio, hours, location',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    ),
  },
  {
    key: 'image' as Section,
    label: 'Cover image',
    sub: 'Upload or change photo',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    ),
  },
];

const LINKS = [
  {
    href: '/settings/seller/orders',
    label: 'Incoming orders',
    sub: 'Accept, reject & manage',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    ),
  },
  {
    href: '/settings/seller/menu',
    label: 'Menu',
    sub: 'Drinks & prices',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    ),
  },
  {
    href: '/settings/seller/media',
    label: 'Photo gallery',
    sub: 'Your setup & space',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    ),
  },
];

export default function SellerSettingsPage() {
  const router = useRouter();
  const [state, setState] = useState<OnboardingState>('loading');
  const [activeSection, setActiveSection] = useState<Section>('profile');
  const [isOnline, setIsOnline] = useState(false);

  // Avatar
  const [avatarUrl, setAvatarUrl] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [avatarSaving, setAvatarSaving] = useState(false);
  const [avatarMsg, setAvatarMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [locationText, setLocationText] = useState('');
  const [openingHours, setOpeningHours] = useState('');
  const [machineType, setMachineType] = useState('');
  const [beans, setBeans] = useState('');
  const [drinkTypes, setDrinkTypes] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);

  // Location
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [pickupDetails, setPickupDetails] = useState('');
  const [geoQuery, setGeoQuery] = useState('');
  const [geoSearching, setGeoSearching] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function ensureSellerProfile() {
      const res = await apiFetch<SellerProfile>('/sellers/me');
      if (cancelled) return;
      if (res.status === 401) { router.replace('/auth/login'); return; }
      if (res.status === 404) {
        const createRes = await apiFetch<SellerProfile>('/sellers/me', {
          method: 'POST', body: JSON.stringify({ displayName: 'My shop' }),
        });
        if (cancelled) return;
        if (createRes.error || createRes.status >= 400) { setState('error'); return; }
        populateFields(createRes.data!);
      } else if (res.error && res.status !== 200) {
        setState('error'); return;
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
    setLat(p.lat ?? null);
    setLng(p.lng ?? null);
    setPickupDetails(p.pickupDetails ?? '');
    setIsOnline(p.isOnline ?? false);
  }

  async function uploadFile(file: File) {
    setUploading(true); setAvatarMsg(null);
    const form = new FormData();
    form.append('file', file);
    form.append('upload_preset', UPLOAD_PRESET);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body: form });
    const json = await res.json();
    setUploading(false);
    if (!res.ok || !json.secure_url) { setAvatarMsg('Upload failed. Please try again.'); return; }
    setUrlInput(json.secure_url);
    await saveAvatarUrl(json.secure_url);
  }

  async function saveAvatarUrl(url: string) {
    setAvatarSaving(true); setAvatarMsg(null);
    const res = await apiFetch<SellerProfile>('/sellers/me', {
      method: 'PATCH', body: JSON.stringify({ avatarUrl: url.trim() || null }),
    });
    setAvatarSaving(false);
    if (res.error || res.status >= 400) {
      setAvatarMsg('Failed to save.');
    } else {
      const saved = res.data?.avatarUrl ?? url;
      setAvatarUrl(saved); setUrlInput(saved);
      setAvatarMsg('Saved!');
    }
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileSaving(true); setProfileMsg(null);
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
        lat: lat ?? null, lng: lng ?? null,
        pickupDetails: pickupDetails.trim() || null,
      }),
    });
    setProfileSaving(false);
    if (res.error || res.status >= 400) setProfileMsg('Failed to save.');
    else setProfileMsg('Saved!');
  }

  async function searchLocation() {
    const q = geoQuery.trim(); if (!q) return;
    setGeoSearching(true); setGeoError(null);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      if (!data?.length) { setGeoError('Address not found. Try a more specific address.'); }
      else {
        const { lat: resLat, lon: resLon, display_name } = data[0];
        setLat(parseFloat(resLat)); setLng(parseFloat(resLon));
        if (!locationText.trim()) setLocationText(display_name);
      }
    } catch { setGeoError('Search failed. Please try again.'); }
    finally { setGeoSearching(false); }
  }

  if (state === 'loading') return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-amber-900/80">Loading…</p>
    </div>
  );

  if (state === 'error') return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <p className="text-amber-900">Something went wrong.</p>
    </div>
  );

  const avatarBusy = uploading || avatarSaving;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-20 border-b border-amber-200/60 bg-white/95 backdrop-blur">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/" className="text-lg font-bold text-amber-950">COFFEZ</Link>
          <nav className="flex gap-4 text-sm">
            <Link href="/marketplace" className="text-amber-900/80 hover:text-amber-950">Marketplace</Link>
            <Link href="/orders" className="text-amber-900/80 hover:text-amber-950">Orders</Link>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-xl font-bold text-amber-950">My Shop</h1>
          <OnlineToggle initialValue={isOnline} />
        </div>

        <div className="flex flex-col md:flex-row gap-5">

          {/* ── Sidebar ── */}
          <aside className="md:w-56 shrink-0">
            <div className="md:sticky md:top-20 bg-white rounded-2xl border border-amber-200/80 overflow-hidden">

              {/* Inline sections */}
              <div className="p-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 px-3 py-2">Settings</p>
                {NAV.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setActiveSection(item.key)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                      activeSection === item.key
                        ? 'bg-amber-100 text-amber-950'
                        : 'text-stone-600 hover:bg-amber-50'
                    }`}
                  >
                    <svg className={`w-4 h-4 shrink-0 ${activeSection === item.key ? 'text-amber-800' : 'text-stone-400'}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {item.icon}
                    </svg>
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Divider */}
              <div className="mx-3 border-t border-amber-100" />

              {/* Navigation links */}
              <div className="p-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 px-3 py-2">Manage</p>
                {LINKS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-stone-600 hover:bg-amber-50 hover:text-amber-950 transition-colors group"
                  >
                    <svg className="w-4 h-4 shrink-0 text-stone-400 group-hover:text-amber-700 transition-colors"
                      fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {item.icon}
                    </svg>
                    <span className="text-sm font-medium">{item.label}</span>
                    <svg className="w-3 h-3 ml-auto text-stone-300 group-hover:text-stone-400 transition-colors"
                      fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>

            </div>
          </aside>

          {/* ── Content ── */}
          <div className="flex-1 min-w-0">

            {/* Profile section */}
            {activeSection === 'profile' && (
              <div className="bg-white rounded-2xl border border-amber-200/80 p-6">
                <h2 className="text-base font-semibold text-amber-950 mb-5">Profile details</h2>
                <form onSubmit={saveProfile} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Shop name</label>
                    <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required
                      className="w-full border border-amber-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-300 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Bio</label>
                    <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3}
                      placeholder="Tell buyers about yourself and your coffee…"
                      className="w-full border border-amber-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-300 outline-none resize-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Location</label>
                    <input type="text" value={locationText} onChange={(e) => setLocationText(e.target.value)}
                      placeholder="e.g. Tel Aviv, Florentin"
                      className="w-full border border-amber-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-300 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Map pin</label>
                    {lat !== null && lng !== null ? (
                      <div className="flex items-center gap-2 text-sm text-stone-600 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                        <svg className="w-4 h-4 text-green-600 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/>
                        </svg>
                        <span className="truncate">{lat.toFixed(5)}, {lng.toFixed(5)}</span>
                        <button type="button" onClick={() => { setLat(null); setLng(null); }}
                          className="ml-auto text-xs text-red-500 hover:text-red-700 shrink-0">Remove</button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input type="text" value={geoQuery} onChange={(e) => setGeoQuery(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); searchLocation(); } }}
                          placeholder="Search address…"
                          className="flex-1 border border-amber-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-300 outline-none" />
                        <button type="button" onClick={searchLocation} disabled={geoSearching || !geoQuery.trim()}
                          className="py-2 px-4 rounded-xl text-sm font-medium bg-amber-900 text-amber-50 hover:bg-amber-800 disabled:opacity-50 transition-colors shrink-0">
                          {geoSearching ? '…' : 'Search'}
                        </button>
                      </div>
                    )}
                    {geoError && <p className="text-xs text-red-600 mt-1">{geoError}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Pickup details</label>
                    <input type="text" value={pickupDetails} onChange={(e) => setPickupDetails(e.target.value)}
                      placeholder="e.g. Entrance B, 3rd floor, apt 12"
                      className="w-full border border-amber-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-300 outline-none" />
                    <p className="text-xs text-stone-400 mt-1">Building entrance, floor, apartment</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Opening hours</label>
                    <textarea value={openingHours} onChange={(e) => setOpeningHours(e.target.value)} rows={2}
                      placeholder="e.g. Sun–Thu 7:00–14:00"
                      className="w-full border border-amber-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-300 outline-none resize-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Machine / equipment</label>
                    <input type="text" value={machineType} onChange={(e) => setMachineType(e.target.value)}
                      placeholder="e.g. Breville Barista Express"
                      className="w-full border border-amber-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-300 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Beans in stock</label>
                    <input type="text" value={beans} onChange={(e) => setBeans(e.target.value)}
                      placeholder="e.g. Ethiopia Yirgacheffe, Colombia Huila"
                      className="w-full border border-amber-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-300 outline-none" />
                    <p className="text-xs text-stone-400 mt-1">Separate with commas</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Drinks I make</label>
                    <input type="text" value={drinkTypes} onChange={(e) => setDrinkTypes(e.target.value)}
                      placeholder="e.g. Espresso, Cappuccino, Pour over"
                      className="w-full border border-amber-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-300 outline-none" />
                    <p className="text-xs text-stone-400 mt-1">Separate with commas</p>
                  </div>
                  <div className="flex items-center gap-3 pt-1">
                    <button type="submit" disabled={profileSaving}
                      className="py-2.5 px-6 rounded-xl text-sm font-medium bg-amber-900 text-amber-50 hover:bg-amber-800 disabled:opacity-50 transition-colors">
                      {profileSaving ? 'Saving…' : 'Save profile'}
                    </button>
                    {profileMsg && (
                      <p className={`text-sm ${profileMsg === 'Saved!' ? 'text-green-700' : 'text-red-600'}`}>{profileMsg}</p>
                    )}
                  </div>
                </form>
              </div>
            )}

            {/* Cover image section */}
            {activeSection === 'image' && (
              <div className="bg-white rounded-2xl border border-amber-200/80 p-6">
                <h2 className="text-base font-semibold text-amber-950 mb-5">Cover image</h2>

                <div className="mb-5 w-full aspect-[4/3] max-w-sm rounded-xl overflow-hidden bg-amber-50 border border-amber-200/80">
                  {urlInput ? (
                    <img src={urlInput} alt="Cover preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-amber-200">
                      <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                      </svg>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-stone-700 mb-2">Upload from computer</p>
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
                  <input type="url" value={urlInput} onChange={(e) => { setUrlInput(e.target.value); setAvatarMsg(null); }}
                    placeholder="https://example.com/photo.jpg"
                    className="w-full rounded-xl border border-amber-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                  <div className="flex items-center gap-3">
                    <button onClick={() => saveAvatarUrl(urlInput)} disabled={avatarBusy}
                      className="py-2.5 px-6 rounded-xl text-sm font-medium bg-amber-900 text-amber-50 hover:bg-amber-800 disabled:opacity-50 transition-colors">
                      {avatarSaving ? 'Saving…' : 'Save'}
                    </button>
                    {avatarUrl && (
                      <button onClick={() => { setUrlInput(avatarUrl); setAvatarMsg(null); }}
                        className="py-2 px-4 rounded-xl text-sm font-medium text-stone-500 hover:text-stone-700 transition-colors">
                        Reset
                      </button>
                    )}
                  </div>
                  {avatarMsg && (
                    <p className={`text-sm ${avatarMsg === 'Saved!' ? 'text-green-700' : 'text-red-600'}`}>{avatarMsg}</p>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
