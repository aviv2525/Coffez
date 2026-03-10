'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';

type MenuItem = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  isAvailable: boolean;
};

type MediaItem = {
  id: string;
  type: string;
  url: string;
  thumbnailUrl: string | null;
  title: string | null;
  caption: string | null;
};

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
  coverMedia?: { id: string; type: string; url: string; thumbnailUrl: string | null } | null;
  media?: MediaItem[];
};

export default function SellerPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: seller, isLoading: loadingSeller } = useQuery({
    queryKey: ['seller', id],
    queryFn: async () => {
      const res = await apiFetch<Seller>(`/sellers/${id}`);
      if (res.error || !res.data) throw new Error(res.error || 'Not found');
      return res.data;
    },
    enabled: !!id,
  });

  const { data: menu = [], isLoading: loadingMenu } = useQuery({
    queryKey: ['seller-menu', id],
    queryFn: async () => {
      const res = await apiFetch<MenuItem[]>(`/sellers/${id}/menu`);
      if (res.error) return [];
      return res.data ?? [];
    },
    enabled: !!id,
  });

  const media = seller?.media ?? [];

  if (loadingSeller || !seller) {
    return (
      <div className="min-h-screen bg-amber-50/40 flex items-center justify-center">
        <div className="text-center">
          {loadingSeller ? (
            <div className="animate-pulse h-10 w-48 bg-amber-200/50 rounded" />
          ) : (
            <p className="text-amber-900">Seller not found.</p>
          )}
        </div>
      </div>
    );
  }

  const heroUrl = media[0]?.url ?? seller.coverMedia?.url ?? seller.avatarUrl ?? null;
  const hasBeans = (seller.beans ?? []).length > 0;
  const hasDrinks = (seller.drinkTypes ?? []).length > 0;

  return (
    <div className="min-h-screen bg-amber-50/40">
      <header className="border-b border-amber-200/60 bg-white/90 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-amber-950">COFFEZ</Link>
          <Link href="/marketplace" className="text-amber-900/80 hover:text-amber-950">← All sellers</Link>
        </div>
      </header>

      <main>
        {/* Trust: their space — hero */}
        <section className="relative bg-amber-100/50">
          <div className="aspect-[21/9] max-h-[280px] w-full overflow-hidden">
            {heroUrl ? (
              media[0]?.type === 'VIDEO' ? (
                <video
                  src={heroUrl}
                  className="w-full h-full object-cover"
                  controls
                  playsInline
                />
              ) : (
                <img
                  src={heroUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              )
            ) : (
              <div className="w-full h-full flex items-center justify-center text-amber-300">
                <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M2 21h18v-2H2v2zm0-4h18v-2H2v2zm0-6h18V9H2v2zm0-6v2h18V5H2z"/>
                  <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" opacity={0.5}/>
                </svg>
              </div>
            )}
          </div>
        </section>

        <div className="container mx-auto px-4 -mt-6 relative z-10 pb-12">
          {/* Name + location + short intro */}
          <div className="bg-white rounded-2xl border border-amber-200/80 shadow-lg p-6 md:p-8 mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-amber-950">{seller.displayName}</h1>
            {seller.locationText && (
              <p className="text-amber-800/90 mt-1">📍 {seller.locationText}</p>
            )}
            {seller.bio && (
              <p className="mt-4 text-stone-700 leading-relaxed">{seller.bio}</p>
            )}

            {/* What they offer — beans, drinks, equipment, when open */}
            <div className="mt-6 pt-6 border-t border-amber-100 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {hasBeans && (
                <div>
                  <h3 className="text-[10px] font-semibold uppercase tracking-wider text-amber-700">Beans in stock</h3>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {seller.beans!.map((b) => (
                      <span key={b} className="inline-flex px-2.5 py-1 rounded-lg text-sm font-medium bg-amber-100 text-amber-900 border border-amber-200/80">
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {hasDrinks && (
                <div>
                  <h3 className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">Drinks they make</h3>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {seller.drinkTypes!.map((d) => (
                      <span key={d} className="inline-flex px-2.5 py-1 rounded-lg text-sm bg-stone-100 text-stone-700 border border-stone-200/80">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {seller.machineType && (
                <div>
                  <h3 className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">Equipment</h3>
                  <p className="mt-2 text-stone-700">{seller.machineType}</p>
                </div>
              )}
              {seller.openingHours && (
                <div>
                  <h3 className="text-[10px] font-semibold uppercase tracking-wider text-amber-700">When they’re open</h3>
                  <p className="mt-2 text-stone-700 whitespace-pre-line">{seller.openingHours}</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/seller/${id}#menu`}
                className="inline-flex items-center justify-center py-3 px-5 rounded-xl font-medium bg-amber-900 text-amber-50 hover:bg-amber-800 transition-colors"
              >
                View menu & order
              </Link>
              <Link
                href="/marketplace"
                className="inline-flex items-center justify-center py-3 px-5 rounded-xl font-medium border border-amber-300 text-amber-900 hover:bg-amber-50 transition-colors"
              >
                Back to marketplace
              </Link>
            </div>
          </div>

          {/* Their setup — gallery for trust */}
          {media.length > 0 && (
            <section className="mb-10">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-500 mb-4">Their setup</h2>
              <p className="text-sm text-stone-600 mb-4">Photos and videos of their coffee space.</p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {media.map((m) => (
                  <div key={m.id} className="rounded-xl overflow-hidden bg-amber-50 aspect-square border border-amber-200/80">
                    {m.type === 'IMAGE' ? (
                      <img src={m.url} alt={m.title ?? ''} className="w-full h-full object-cover" />
                    ) : (
                      <video src={m.url} controls className="w-full h-full object-cover" />
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Menu */}
          <section id="menu" className="scroll-mt-6">
            <h2 className="text-lg font-semibold text-amber-950 mb-1">Menu</h2>
            <p className="text-sm text-stone-600 mb-4">Choose a drink and place your order.</p>
            {loadingMenu ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-36 bg-amber-100/50 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {menu.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl border border-amber-200/80 p-5 shadow-sm hover:shadow transition-shadow flex flex-col"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-semibold text-amber-950">{item.title}</h3>
                      <span className="text-amber-800 font-semibold whitespace-nowrap">₪{item.price}</span>
                    </div>
                    {item.description && (
                      <p className="text-sm text-stone-600 mt-1 line-clamp-2">{item.description}</p>
                    )}
                    <div className="mt-4 flex-1 flex items-end">
                      {item.isAvailable ? (
                        <Link
                          href={`/seller/${id}/order?item=${item.id}`}
                          className="w-full text-center py-2.5 rounded-lg text-sm font-medium bg-amber-900 text-amber-50 hover:bg-amber-800 transition-colors"
                        >
                          Order
                        </Link>
                      ) : (
                        <span className="text-stone-400 text-sm">Unavailable</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {menu.length === 0 && !loadingMenu && (
              <div className="bg-white rounded-xl border border-amber-200/80 p-8 text-center text-stone-500">
                No menu items yet.
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
