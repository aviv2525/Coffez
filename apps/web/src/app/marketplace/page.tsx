'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { Header } from '@/components/Header';

type CoverMedia = { id: string; type: string; url: string; thumbnailUrl: string | null } | null;
type Seller = {
  userId: string;
  displayName: string;
  bio: string | null;
  categories: string[];
  locationText: string | null;
  avatarUrl: string | null;
  beans?: string[];
  drinkTypes?: string[];
  machineType?: string | null;
  openingHours?: string | null;
  pickupDetails?: string | null;
  coverMedia?: CoverMedia;
  avgRating?: number | null;
  reviewCount?: number;
  user?: { id: string; fullName: string };
};

type ListResult = { data: Seller[]; total: number; page: number; limit: number; totalPages: number };

function SellerCard({ s }: { s: Seller }) {
  const coverUrl = s.coverMedia?.url ?? s.avatarUrl ?? null;
  const hasBeans = (s.beans ?? []).length > 0;
  const hasDrinks = (s.drinkTypes ?? []).length > 0;
  const hasHours = !!s.openingHours?.trim();

  return (
    <article className="bg-white rounded-2xl border border-amber-200/80 shadow-sm hover:shadow-md hover:border-amber-300/60 transition-all overflow-hidden flex flex-col">
      {/* Trust: their space / setup preview */}
      <div className="aspect-[4/3] bg-amber-50 relative overflow-hidden">
        {coverUrl ? (
          s.coverMedia?.type === 'VIDEO' ? (
            <video
              src={coverUrl}
              className="w-full h-full object-cover"
              muted
              playsInline
              preload="metadata"
            />
          ) : (
            <img
              src={coverUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          )
        ) : (
          <div className="w-full h-full flex items-center justify-center text-amber-300">
            <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path d="M2 21h18v-2H2v2zm0-4h18v-2H2v2zm0-6h18V9H2v2zm0-6v2h18V5H2z"/>
              <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" opacity={0.5}/>
            </svg>
          </div>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-lg font-semibold text-stone-900">{s.displayName}</h2>
          {s.avgRating && (
            <div className="flex items-center gap-1 shrink-0">
              <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-sm font-semibold text-stone-800">{s.avgRating}</span>
              <span className="text-xs text-stone-400">({s.reviewCount})</span>
            </div>
          )}
        </div>
        {s.locationText && (
          <p className="text-sm text-amber-800/80 mt-0.5">📍 {s.locationText}</p>
        )}
        {s.pickupDetails && (
          <p className="text-xs text-stone-500 mt-0.5">🚪 {s.pickupDetails}</p>
        )}
        {s.bio && (
          <p className="text-sm text-stone-600 mt-2 line-clamp-2">{s.bio}</p>
        )}

        {/* Beans in stock — what you can get */}
        {hasBeans && (
          <div className="mt-3">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-700/90">Beans in stock</span>
            <div className="mt-1 flex flex-wrap gap-1">
              {(s.beans ?? []).slice(0, 4).map((b) => (
                <span key={b} className="inline-flex px-2 py-0.5 rounded-md text-xs font-medium bg-amber-100 text-amber-900 border border-amber-200/80">
                  {b}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Drinks they make */}
        {hasDrinks && (
          <div className="mt-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">Drinks they make</span>
            <div className="mt-1 flex flex-wrap gap-1">
              {(s.drinkTypes ?? []).slice(0, 4).map((d) => (
                <span key={d} className="inline-flex px-2 py-0.5 rounded-md text-xs bg-stone-100 text-stone-700 border border-stone-200/80">
                  {d}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Equipment */}
        {s.machineType && (
          <p className="text-xs text-stone-500 mt-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Equipment</span>
            <span className="block mt-0.5 text-stone-600">{s.machineType}</span>
          </p>
        )}

        {/* When they're available */}
        {hasHours && (
          <p className="text-xs text-stone-600 mt-2 pt-2 border-t border-amber-100">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-800/80">Open</span>
            <span className="block mt-0.5">{s.openingHours}</span>
          </p>
        )}

        <div className="mt-4 flex gap-2 pt-3 border-t border-stone-100">
          <Link
            href={`/seller/${s.userId}`}
            className="flex-1 text-center py-2.5 px-3 rounded-xl text-sm font-medium bg-amber-900 text-amber-50 hover:bg-amber-800 transition-colors"
          >
            View profile
          </Link>
          <Link
            href={`/seller/${s.userId}#menu`}
            className="flex-1 text-center py-2.5 px-3 rounded-xl text-sm font-medium border border-amber-300 text-amber-900 hover:bg-amber-50 transition-colors"
          >
            See menu
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function MarketplacePage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['sellers'],
    queryFn: async () => {
      const res = await apiFetch<ListResult>('/sellers?page=1&limit=50');
      if (res.error || !res.data) throw new Error(res.error || 'Failed to load');
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-amber-50/40">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-amber-200/50 rounded w-56" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-96 bg-amber-100/50 rounded-2xl" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-amber-50/40 flex items-center justify-center">
        <div className="text-center">
          <p className="text-amber-900">Error loading sellers.</p>
          <Link href="/marketplace" className="mt-2 inline-block text-amber-800 hover:underline">Try again</Link>
        </div>
      </div>
    );
  }

  const sellers = data?.data ?? [];

  return (
    <div className="min-h-screen bg-amber-50/40">
      <Header />
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-amber-950">Home coffee sellers</h1>
          <p className="text-amber-900/80 mt-1">
            See who has which beans, what they brew, and when they’re open. Pick a seller to view their menu and order.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sellers.map((s) => (
            <SellerCard key={s.userId} s={s} />
          ))}
        </div>
        {sellers.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-amber-200/80">
            <p className="text-amber-900/80">No home coffee sellers yet. Check back soon.</p>
          </div>
        )}
      </main>
    </div>
  );
}
