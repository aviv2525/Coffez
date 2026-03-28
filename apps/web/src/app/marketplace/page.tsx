'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Header } from '@/components/Header';

const SellerMap = dynamic(
  () => import('@/components/SellerMap').then((m) => m.SellerMap),
  { ssr: false, loading: () => <div className="w-full h-full bg-amber-50 rounded-2xl animate-pulse" /> }
);

type CoverMedia = { id: string; type: string; url: string; thumbnailUrl: string | null } | null;
type Seller = {
  userId: string;
  displayName: string;
  bio: string | null;
  categories: string[];
  locationText: string | null;
  avatarUrl: string | null;
  lat: number | null;
  lng: number | null;
  beans?: string[];
  drinkTypes?: string[];
  machineType?: string | null;
  openingHours?: string | null;
  pickupDetails?: string | null;
  isOnline?: boolean;
  coverMedia?: CoverMedia;
  avgRating?: number | null | undefined;
  reviewCount?: number;
};

type ListResult = { data: Seller[]; total: number };

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function SellerCard({
  s,
  distance,
  active,
  onHover,
}: {
  s: Seller;
  distance: number | null;
  active: boolean;
  onHover: (id: string | null) => void;
}) {
  const coverUrl = s.coverMedia?.url ?? s.avatarUrl ?? null;

  return (
    <article
      id={`seller-${s.userId}`}
      onMouseEnter={() => onHover(s.userId)}
      onMouseLeave={() => onHover(null)}
      className={`bg-white rounded-2xl border shadow-sm transition-all overflow-hidden flex flex-col ${
        active ? 'border-amber-500 shadow-amber-200 ring-2 ring-amber-400/30' : 'border-amber-200/80 hover:shadow-md hover:border-amber-300/60'
      }`}
    >
      <div className="aspect-[16/9] bg-amber-50 relative overflow-hidden">
        {coverUrl ? (
          s.coverMedia?.type === 'VIDEO' ? (
            <video src={coverUrl} className="w-full h-full object-cover" muted playsInline preload="metadata" />
          ) : (
            <img src={coverUrl} alt="" className="w-full h-full object-cover" />
          )
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-14 h-14 text-amber-200" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 3H4v10c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4v-3h2c1.11 0 2-.89 2-2V5c0-1.11-.89-2-2-2zm0 5h-2V5h2v3z"/>
            </svg>
          </div>
        )}
        {s.isOnline && (
          <span className="absolute top-2 left-2 inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-white/90 border border-green-200 px-2 py-0.5 rounded-full shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Online
          </span>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-base font-semibold text-stone-900 leading-tight">{s.displayName}</h2>
          <div className="flex flex-col items-end gap-1 shrink-0">
            {s.avgRating && (
              <div className="flex items-center gap-0.5">
                <svg className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-sm font-semibold text-stone-800">{s.avgRating}</span>
                <span className="text-xs text-stone-400">({s.reviewCount})</span>
              </div>
            )}
            {distance != null && (
              <span className="text-xs text-stone-400">{distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`}</span>
            )}
          </div>
        </div>

        {s.locationText && <p className="text-xs text-amber-800/80 mt-1">📍 {s.locationText}</p>}
        {s.bio && <p className="text-sm text-stone-500 mt-1.5 line-clamp-2">{s.bio}</p>}

        <div className="pt-3 flex gap-2 border-t border-stone-100 mt-3">
          <Link
            href={`/seller/${s.userId}`}
            className="flex-1 text-center py-2 px-3 rounded-xl text-sm font-medium bg-amber-900 text-amber-50 hover:bg-amber-800 transition-colors"
          >
            View profile
          </Link>
          <Link
            href={`/seller/${s.userId}#menu`}
            className="flex-1 text-center py-2 px-3 rounded-xl text-sm font-medium border border-amber-300 text-amber-900 hover:bg-amber-50 transition-colors"
          >
            See menu
          </Link>
          {s.lat != null && s.lng != null && (
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              title="Open in Google Maps"
              className="flex items-center justify-center w-10 shrink-0 rounded-xl border border-stone-200 text-stone-500 hover:bg-stone-50 hover:text-stone-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export default function MarketplacePage() {
  const [view, setView] = useState<'list' | 'map'>('list');
  const [search, setSearch] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [maxDistanceKm, setMaxDistanceKm] = useState<number | null>(null);
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [activeSellerId, setActiveSellerId] = useState<string | null>(null);


  const { data, isLoading, error } = useQuery({
    queryKey: ['sellers'],
    queryFn: async () => {
      const res = await apiFetch<ListResult>('/sellers?page=1&limit=100');
      if (res.error || !res.data) throw new Error(res.error || 'Failed');
      return res.data;
    },
  });

  const sellers = useMemo(() => data?.data ?? [], [data]);

  // Compute distance for each seller
  const sellersWithDistance = useMemo(() => {
    return sellers.map((s) => ({
      ...s,
      distance:
        userLocation && s.lat != null && s.lng != null
          ? haversineKm(userLocation.lat, userLocation.lng, s.lat, s.lng)
          : null,
    }));
  }, [sellers, userLocation]);

  // Apply filters
  const filtered = useMemo(() => {
    return sellersWithDistance
      .filter((s) => !search || s.displayName.toLowerCase().includes(search.toLowerCase()) || s.locationText?.toLowerCase().includes(search.toLowerCase()))
      .filter((s) => !onlineOnly || s.isOnline)
      .filter((s) => !minRating || (s.avgRating ?? 0) >= minRating)
      .filter((s) => maxDistanceKm == null || s.distance == null || s.distance <= maxDistanceKm)
      .sort((a, b) => {
        if (a.distance != null && b.distance != null) return a.distance - b.distance;
        return 0;
      });
  }, [sellersWithDistance, search, onlineOnly, minRating, maxDistanceKm]);

  function requestLocation() {
    if (!navigator.geolocation) return;
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationLoading(false);
      },
      () => setLocationLoading(false)
    );
  }

  // Scroll to active card in list
  useEffect(() => {
    if (activeSellerId) {
      const el = document.getElementById(`seller-${activeSellerId}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [activeSellerId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-amber-50/40">
        <Header />
        <div className="flex items-center justify-center py-24">
          <div className="animate-pulse h-8 w-48 bg-amber-100 rounded" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-amber-50/40 flex items-center justify-center">
        <p className="text-amber-900">Error loading sellers. <Link href="/marketplace" className="underline">Try again</Link></p>
      </div>
    );
  }

  const showList = view === 'list';
  const showMap = view === 'map';

  return (
    <div className="min-h-screen bg-amber-50/40 flex flex-col">
      <Header />

      {/* Filters bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-amber-200/60 px-4 py-3">
        <div className="container mx-auto flex flex-wrap items-center gap-3">

          {/* Search */}
          <div className="relative">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search sellers…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1 rounded-lg border border-amber-200 text-sm text-stone-800 placeholder:text-stone-400 outline-none focus:border-amber-400 w-44"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <div className="w-px h-5 bg-stone-200" />

          {/* Rating filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-stone-500">Min rating</span>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4, 5].map((r) => (
                <button
                  key={r}
                  onClick={() => setMinRating(r)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                    minRating === r
                      ? 'bg-amber-900 text-amber-50 border-amber-900'
                      : 'border-amber-200 text-amber-900 hover:bg-amber-50'
                  }`}
                >
                  {r === 0 ? 'All' : `${r}★`}
                </button>
              ))}
            </div>
          </div>

          <div className="w-px h-5 bg-stone-200" />

          {/* Distance filter */}
          <div className="flex items-center gap-2">
            <button
              onClick={userLocation ? undefined : requestLocation}
              disabled={locationLoading}
              className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg border transition-colors ${
                userLocation ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-amber-200 text-amber-900 hover:bg-amber-50'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {locationLoading ? 'Locating…' : userLocation ? 'Location on' : 'Use my location'}
            </button>
            {userLocation && (
              <div className="flex gap-1">
                {[null, 0.5, 1, 2, 5].map((d) => (
                  <button
                    key={d ?? 'all'}
                    onClick={() => setMaxDistanceKm(d)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                      maxDistanceKm === d
                        ? 'bg-amber-900 text-amber-50 border-amber-900'
                        : 'border-amber-200 text-amber-900 hover:bg-amber-50'
                    }`}
                  >
                    {d == null ? 'Any' : d < 1 ? `${d * 1000}m` : `${d}km`}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="w-px h-5 bg-stone-200" />

          {/* Online only */}
          <button
            onClick={() => setOnlineOnly((v) => !v)}
            className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg border transition-colors ${
              onlineOnly ? 'bg-green-700 text-white border-green-700' : 'border-amber-200 text-amber-900 hover:bg-amber-50'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${onlineOnly ? 'bg-green-300 animate-pulse' : 'bg-stone-300'}`} />
            Online now
          </button>

          <div className="ml-auto flex gap-1">
            {(['list', 'map'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                title={v}
                className={`p-1.5 rounded-lg border transition-colors ${
                  view === v ? 'bg-amber-900 text-amber-50 border-amber-900' : 'border-amber-200 text-amber-700 hover:bg-amber-50'
                }`}
              >
                {v === 'list' && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
                {v === 'map' && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="container mx-auto px-4 py-2">
        <p className="text-xs text-stone-400">
          {filtered.length} seller{filtered.length !== 1 ? 's' : ''}
          {filtered.length !== sellers.length && ` of ${sellers.length}`}
        </p>
      </div>

      {/* Main content */}
      <div className="flex-1 container mx-auto px-4 pb-6" style={{ minHeight: 0 }}>
        <div className="flex gap-4">

          {/* List panel */}
          {showList && (
            <div className="w-full space-y-4">
              {filtered.length === 0 && (
                <div className="bg-white rounded-2xl border border-amber-200/80 p-10 text-center">
                  <p className="text-stone-500">No sellers match your filters.</p>
                </div>
              )}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((s) => (
                  <SellerCard
                    key={s.userId}
                    s={s}
                    distance={s.distance}
                    active={activeSellerId === s.userId}
                    onHover={setActiveSellerId}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Map panel */}
          {showMap && (
            <div className="h-[calc(100vh-180px)] w-full rounded-2xl overflow-hidden">
              <SellerMap
                sellers={filtered}
                userLocation={userLocation}
                activeSellerId={activeSellerId}
                onSelectSeller={(id) => {
                  setActiveSellerId(id);
                  const el = document.getElementById(`seller-${id}`);
                  el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
