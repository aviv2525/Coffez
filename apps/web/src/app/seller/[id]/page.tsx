'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
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

type Review = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  buyerId: string;
  buyerName: string;
};

type ReviewsData = {
  reviews: Review[];
  avgRating: number | null;
  total: number;
};

type CurrentUser = { id: string; fullName: string };

function Stars({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <svg key={i} className={`w-4 h-4 ${i < rating ? 'text-amber-400' : 'text-stone-200'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <span className="inline-flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="focus:outline-none"
        >
          <svg className={`w-7 h-7 transition-colors ${(hovered || value) >= star ? 'text-amber-400' : 'text-stone-200'}`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </span>
  );
}

export default function SellerPage() {
  const params = useParams();
  const id = params.id as string;

  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState<string | null>(null);

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

  const { data: reviewsData, refetch: refetchReviews } = useQuery({
    queryKey: ['seller-reviews', id],
    queryFn: async () => {
      const res = await apiFetch<ReviewsData>(`/sellers/${id}/reviews`);
      return res.data ?? { reviews: [], avgRating: null, total: 0 };
    },
    enabled: !!id,
  });

  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const res = await apiFetch<CurrentUser>('/users/me');
      if (res.status === 401 || res.error) return null;
      return res.data ?? null;
    },
    retry: false,
  });

  const media = seller?.media ?? [];
  const reviews = reviewsData?.reviews ?? [];
  const myExistingReview = currentUser ? reviews.find((r) => r.buyerId === currentUser.id) : null;
  const isSeller = currentUser?.id === seller?.userId;
  const isLoggedIn = currentUser !== null && currentUser !== undefined;

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!myRating) return;
    setSubmitting(true);
    setSubmitMsg(null);
    const res = await apiFetch(`/sellers/${id}/reviews`, {
      method: 'POST',
      body: JSON.stringify({ rating: myRating, comment: myComment.trim() || undefined }),
    });
    setSubmitting(false);
    if (res.error || res.status >= 400) {
      setSubmitMsg(res.error === 'You can only review sellers you have ordered from'
        ? 'You need to place an order first before leaving a review.'
        : res.error || 'Failed to submit. Please try again.');
    } else {
      setSubmitMsg('Review submitted!');
      refetchReviews();
    }
  }

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
        {/* Hero */}
        <section className="relative bg-amber-100/50">
          <div className="aspect-[21/9] max-h-[280px] w-full overflow-hidden">
            {heroUrl ? (
              media[0]?.type === 'VIDEO' ? (
                <video src={heroUrl} className="w-full h-full object-cover" controls playsInline />
              ) : (
                <img src={heroUrl} alt="" className="w-full h-full object-cover" />
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
          {/* Profile card */}
          <div className="bg-white rounded-2xl border border-amber-200/80 shadow-lg p-6 md:p-8 mb-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-amber-950">{seller.displayName}</h1>
                {seller.locationText && (
                  <p className="text-amber-800/90 mt-1">📍 {seller.locationText}</p>
                )}
              </div>
              {reviewsData && reviewsData.total > 0 && (
                <div className="flex items-center gap-2 bg-amber-50 rounded-xl px-4 py-2 border border-amber-200/80">
                  <Stars rating={Math.round(reviewsData.avgRating ?? 0)} />
                  <span className="font-semibold text-amber-950">{reviewsData.avgRating}</span>
                  <span className="text-sm text-stone-500">({reviewsData.total})</span>
                </div>
              )}
            </div>

            {seller.bio && <p className="mt-4 text-stone-700 leading-relaxed">{seller.bio}</p>}

            <div className="mt-6 pt-6 border-t border-amber-100 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {hasBeans && (
                <div>
                  <h3 className="text-[10px] font-semibold uppercase tracking-wider text-amber-700">Beans in stock</h3>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {seller.beans!.map((b) => (
                      <span key={b} className="inline-flex px-2.5 py-1 rounded-lg text-sm font-medium bg-amber-100 text-amber-900 border border-amber-200/80">{b}</span>
                    ))}
                  </div>
                </div>
              )}
              {hasDrinks && (
                <div>
                  <h3 className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">Drinks they make</h3>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {seller.drinkTypes!.map((d) => (
                      <span key={d} className="inline-flex px-2.5 py-1 rounded-lg text-sm bg-stone-100 text-stone-700 border border-stone-200/80">{d}</span>
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
                  <h3 className="text-[10px] font-semibold uppercase tracking-wider text-amber-700">When they're open</h3>
                  <p className="mt-2 text-stone-700 whitespace-pre-line">{seller.openingHours}</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={`/seller/${id}#menu`}
                className="inline-flex items-center justify-center py-3 px-5 rounded-xl font-medium bg-amber-900 text-amber-50 hover:bg-amber-800 transition-colors">
                View menu & order
              </Link>
              <Link href="/marketplace"
                className="inline-flex items-center justify-center py-3 px-5 rounded-xl font-medium border border-amber-300 text-amber-900 hover:bg-amber-50 transition-colors">
                Back to marketplace
              </Link>
            </div>
          </div>

          {/* Gallery */}
          {media.length > 0 && (
            <section className="mb-10">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-500 mb-4">Their setup</h2>
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
          <section id="menu" className="scroll-mt-6 mb-10">
            <h2 className="text-lg font-semibold text-amber-950 mb-1">Menu</h2>
            <p className="text-sm text-stone-600 mb-4">Choose a drink and place your order.</p>
            {loadingMenu ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => <div key={i} className="h-36 bg-amber-100/50 rounded-xl animate-pulse" />)}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {menu.map((item) => (
                  <div key={item.id} className="bg-white rounded-xl border border-amber-200/80 p-5 shadow-sm hover:shadow transition-shadow flex flex-col">
                    {item.imageUrl ? (
                      <div className="mb-4 overflow-hidden rounded-xl">
                        <img src={item.imageUrl} alt={item.title} className="w-full h-32 object-cover" />
                      </div>
                    ) : (
                      <div className="mb-4 h-32 rounded-xl border border-amber-200/80 bg-amber-50 flex items-center justify-center text-amber-300">
                        <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M7 3a4 4 0 0 0-4 4v2a4 4 0 0 0 4 4h2v2a4 4 0 0 0 4 4h6a4 4 0 0 0 4-4v-1a3 3 0 0 0-3-3h-1V7a4 4 0 0 0-4-4H7zm0 2h8a2 2 0 0 1 2 2v6h1a1 1 0 0 1 1 1v1a2 2 0 0 1-2 2h-6a2 2 0 0 1-2-2v-2H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" />
                        </svg>
                      </div>
                    )}
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-semibold text-amber-950">{item.title}</h3>
                      <span className="text-amber-800 font-semibold whitespace-nowrap">₪{item.price}</span>
                    </div>
                    {item.description && <p className="text-sm text-stone-600 mt-1 line-clamp-2">{item.description}</p>}
                    <div className="mt-4 flex-1 flex items-end">
                      {item.isAvailable ? (
                        <Link href={`/seller/${id}/order?item=${item.id}`}
                          className="w-full text-center py-2.5 rounded-lg text-sm font-medium bg-amber-900 text-amber-50 hover:bg-amber-800 transition-colors">
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

          {/* Reviews */}
          <section id="reviews">
            <h2 className="text-lg font-semibold text-amber-950 mb-1">Reviews</h2>
            {reviewsData && reviewsData.total > 0 && (
              <p className="text-sm text-stone-500 mb-4">
                {reviewsData.avgRating} out of 5 · {reviewsData.total} review{reviewsData.total !== 1 ? 's' : ''}
              </p>
            )}

            {/* Review form */}
            {!isSeller && (
              <div className="bg-white rounded-2xl border border-amber-200/80 p-6 mb-6">
                {!isLoggedIn ? (
                  <p className="text-sm text-stone-500">
                    <Link href="/auth/login" className="text-amber-800 hover:underline font-medium">Log in</Link> to leave a review.
                  </p>
                ) : (
                  <>
                    <h3 className="text-sm font-semibold text-amber-950 mb-3">
                      {myExistingReview ? 'Update your review' : 'Leave a review'}
                    </h3>
                    <form onSubmit={submitReview} className="space-y-3">
                      <StarPicker
                        value={myRating || myExistingReview?.rating || 0}
                        onChange={(v) => { setMyRating(v); setSubmitMsg(null); }}
                      />
                      <textarea
                        value={myComment || (myExistingReview?.comment ?? '')}
                        onChange={(e) => { setMyComment(e.target.value); setSubmitMsg(null); }}
                        placeholder="Share your experience (optional)"
                        rows={3}
                        className="w-full border border-amber-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-300 outline-none resize-none"
                      />
                      <div className="flex items-center gap-3">
                        <button type="submit" disabled={submitting || !myRating}
                          className="py-2 px-5 rounded-xl text-sm font-medium bg-amber-900 text-amber-50 hover:bg-amber-800 disabled:opacity-50 transition-colors">
                          {submitting ? 'Submitting…' : myExistingReview ? 'Update' : 'Submit'}
                        </button>
                        {submitMsg && (
                          <p className={`text-sm ${submitMsg === 'Review submitted!' ? 'text-green-700' : 'text-red-600'}`}>
                            {submitMsg}
                          </p>
                        )}
                      </div>
                    </form>
                  </>
                )}
              </div>
            )}

            {/* Reviews list */}
            {reviews.length === 0 ? (
              <div className="bg-white rounded-xl border border-amber-200/80 p-8 text-center text-stone-500 text-sm">
                No reviews yet. Be the first!
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((r) => (
                  <div key={r.id} className="bg-white rounded-xl border border-amber-200/80 p-5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Stars rating={r.rating} />
                        <span className="text-sm font-medium text-stone-800">{r.buyerName}</span>
                      </div>
                      <span className="text-xs text-stone-400">
                        {new Date(r.createdAt).toLocaleDateString('he-IL')}
                      </span>
                    </div>
                    {r.comment && <p className="text-sm text-stone-600">{r.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
