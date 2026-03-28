'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

type MenuItem = {
  id: string;
  title: string;
  category: string;
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
  lat?: number | null;
  lng?: number | null;
  pickupDetails?: string | null;
  isOnline?: boolean;
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
      {Array.from({ length: max }).map((_, idx) => (
        <svg key={idx} className={`w-4 h-4 ${idx < rating ? 'text-amber-400' : 'text-stone-200'}`} fill="currentColor" viewBox="0 0 20 20">
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
          className="focus:outline-none p-1"
        >
          <svg className={`w-8 h-8 transition-colors ${(hovered || value) >= star ? 'text-amber-400' : 'text-stone-200'}`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </span>
  );
}

function Lightbox({ items, index, onClose, onPrev, onNext }: {
  items: MediaItem[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const item = items[index];

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    }
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose, onPrev, onNext]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close */}
      <button
        className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
        onClick={onClose}
        aria-label="Close"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Counter */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
        {index + 1} / {items.length}
      </div>

      {/* Prev */}
      {items.length > 1 && (
        <button
          className="absolute left-2 md:left-6 z-10 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          aria-label="Previous"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Image */}
      <div className="max-w-[90vw] max-h-[85vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
        {item.type === 'VIDEO' ? (
          <video src={item.url} controls autoPlay className="max-w-full max-h-[85vh] rounded-xl" />
        ) : (
          <img src={item.url} alt={item.title ?? ''} className="max-w-full max-h-[85vh] object-contain rounded-xl" />
        )}
      </div>

      {/* Next */}
      {items.length > 1 && (
        <button
          className="absolute right-2 md:right-6 z-10 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          aria-label="Next"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </div>
  );
}

export default function SellerPage() {
  const params = useParams();
  const id = params.id as string;

  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

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
        {loadingSeller ? (
          <div className="animate-pulse h-10 w-48 bg-amber-200/50 rounded" />
        ) : (
          <p className="text-amber-900">Seller not found.</p>
        )}
      </div>
    );
  }

  const heroUrl = media[0]?.url ?? seller.coverMedia?.url ?? seller.avatarUrl ?? null;
  const hasBeans = (seller.beans ?? []).length > 0;
  const hasDrinks = (seller.drinkTypes ?? []).length > 0;
  // Only IMAGE items are clickable in lightbox
  const imageMedia = media.filter((m) => m.type === 'IMAGE');

  return (
    <div className="min-h-screen bg-amber-50/40">
      {/* Sticky header */}
      <header className="sticky top-0 z-30 border-b border-amber-200/60 bg-white/95 backdrop-blur">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/" className="text-lg font-bold text-amber-950">COFFEZ</Link>
          <Link href="/marketplace" className="text-sm text-amber-900/80 hover:text-amber-950 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            All sellers
          </Link>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="bg-amber-100/50">
          <div className="aspect-[16/7] md:aspect-[21/9] max-h-[320px] w-full overflow-hidden">
            {heroUrl ? (
              media[0]?.type === 'VIDEO' ? (
                <video src={heroUrl} className="w-full h-full object-cover" controls playsInline />
              ) : (
                <img src={heroUrl} alt="" className="w-full h-full object-cover" />
              )
            ) : (
              <div className="w-full h-full flex items-center justify-center text-amber-200">
                <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
              </div>
            )}
          </div>
        </section>

        <div className="container mx-auto px-4 -mt-5 relative z-10 pb-16">

          {/* Profile card */}
          <div className="bg-white rounded-2xl border border-amber-200/80 shadow-lg p-5 md:p-8 mb-6">

            {/* Name + rating row */}
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl md:text-3xl font-bold text-amber-950">{seller.displayName}</h1>
                  {seller.isOnline && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      Online now
                    </span>
                  )}
                </div>
                {seller.locationText && (
                  <p className="text-amber-800/90 mt-1 text-sm md:text-base">📍 {seller.locationText}</p>
                )}
              </div>
              {reviewsData && reviewsData.total > 0 && (
                <a href="#reviews" className="flex items-center gap-2 bg-amber-50 rounded-xl px-3 py-2 border border-amber-200/80 hover:bg-amber-100 transition-colors">
                  <Stars rating={Math.round(reviewsData.avgRating ?? 0)} />
                  <span className="font-semibold text-amber-950 text-sm">{reviewsData.avgRating}</span>
                  <span className="text-xs text-stone-500">({reviewsData.total})</span>
                </a>
              )}
            </div>

            {seller.bio && <p className="mt-4 text-stone-700 leading-relaxed text-sm md:text-base">{seller.bio}</p>}

            {/* Info grid */}
            <div className="mt-5 pt-5 border-t border-amber-100 grid grid-cols-2 md:grid-cols-4 gap-4">
              {hasBeans && (
                <div className="col-span-2 md:col-span-1">
                  <h3 className="text-[10px] font-semibold uppercase tracking-wider text-amber-700">Beans in stock</h3>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {seller.beans!.map((b) => (
                      <span key={b} className="inline-flex px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-100 text-amber-900 border border-amber-200/80">{b}</span>
                    ))}
                  </div>
                </div>
              )}
              {hasDrinks && (
                <div className="col-span-2 md:col-span-1">
                  <h3 className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">Drinks they make</h3>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {seller.drinkTypes!.map((d) => (
                      <span key={d} className="inline-flex px-2.5 py-1 rounded-lg text-xs bg-stone-100 text-stone-700 border border-stone-200/80">{d}</span>
                    ))}
                  </div>
                </div>
              )}
              {seller.machineType && (
                <div>
                  <h3 className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">Equipment</h3>
                  <p className="mt-2 text-stone-700 text-sm">{seller.machineType}</p>
                </div>
              )}
              {seller.openingHours && (
                <div>
                  <h3 className="text-[10px] font-semibold uppercase tracking-wider text-amber-700">Hours</h3>
                  <p className="mt-2 text-stone-700 text-sm whitespace-pre-line">{seller.openingHours}</p>
                </div>
              )}
              {seller.pickupDetails && (
                <div className="col-span-2 md:col-span-1">
                  <h3 className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">Pickup</h3>
                  <p className="mt-2 text-stone-700 text-sm">{seller.pickupDetails}</p>
                </div>
              )}
            </div>

            {/* CTA buttons */}
            <div className="mt-5 flex flex-col sm:flex-row gap-3">
              <a href="#menu"
                className="flex-1 text-center py-3 px-5 rounded-xl font-medium bg-amber-900 text-amber-50 hover:bg-amber-800 transition-colors text-sm md:text-base">
                View menu & order
              </a>
              <Link href="/marketplace"
                className="flex-1 text-center py-3 px-5 rounded-xl font-medium border border-amber-300 text-amber-900 hover:bg-amber-50 transition-colors text-sm md:text-base">
                Back to marketplace
              </Link>
            </div>
          </div>

          {/* Gallery */}
          {media.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-3">Their setup</h2>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-2 md:gap-3">
                {media.map((m, i) => {
                  const imgIndex = imageMedia.indexOf(m);
                  return (
                    <div
                      key={m.id}
                      className={`rounded-xl overflow-hidden bg-amber-50 aspect-square border border-amber-200/80 ${m.type === 'IMAGE' ? 'cursor-pointer hover:opacity-90 active:opacity-75 transition-opacity' : ''}`}
                      onClick={() => { if (m.type === 'IMAGE' && imgIndex !== -1) setLightboxIndex(imgIndex); }}
                    >
                      {m.type === 'IMAGE' ? (
                        <img src={m.url} alt={m.title ?? ''} className="w-full h-full object-cover" />
                      ) : (
                        <video src={m.url} controls className="w-full h-full object-cover" />
                      )}
                    </div>
                  );
                })}
              </div>
              {imageMedia.length > 0 && (
                <p className="text-xs text-stone-400 mt-2">Tap a photo to enlarge</p>
              )}
            </section>
          )}

          {/* Location map */}
          {seller.lat != null && seller.lng != null && (
            <section className="mb-8">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-3">Location</h2>
              <div className="bg-white rounded-2xl border border-amber-200/80 overflow-hidden">
                <iframe
                  title="Seller location"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${seller.lng - 0.005},${seller.lat - 0.005},${seller.lng + 0.005},${seller.lat + 0.005}&layer=mapnik&marker=${seller.lat},${seller.lng}`}
                  className="w-full h-56 md:h-72 border-0"
                  loading="lazy"
                />
                <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-3">
                  {seller.locationText && (
                    <p className="text-sm text-stone-700 flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-amber-700 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/>
                      </svg>
                      {seller.locationText}
                    </p>
                  )}
                  <a
                    href={`https://www.google.com/maps?q=${seller.lat},${seller.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-amber-800 hover:text-amber-950 flex items-center gap-1"
                  >
                    Open in Google Maps →
                  </a>
                </div>
              </div>
            </section>
          )}

          {/* Menu */}
          <section id="menu" className="scroll-mt-20 mb-8">
            <h2 className="text-lg font-semibold text-amber-950 mb-1">Menu</h2>
            <p className="text-sm text-stone-500 mb-4">Choose a drink and place your order.</p>
            {loadingMenu ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {[1, 2].map((i) => <div key={i} className="h-36 bg-amber-100/50 rounded-xl animate-pulse" />)}
              </div>
            ) : menu.length === 0 ? (
              <div className="bg-white rounded-xl border border-amber-200/80 p-8 text-center text-stone-500 text-sm">
                No menu items yet.
              </div>
            ) : (() => {
              const grouped = menu.reduce<Record<string, MenuItem[]>>((acc, item) => {
                const cat = item.category || 'General';
                if (!acc[cat]) acc[cat] = [];
                acc[cat].push(item);
                return acc;
              }, {});
              const categories = Object.keys(grouped);
              return (
                <div className="space-y-6">
                  {categories.map((cat) => (
                    <div key={cat}>
                      <h3 className="text-sm font-semibold text-amber-800 uppercase tracking-wider mb-3">{cat}</h3>
                      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory">
                        {grouped[cat].map((item) => (
                          <div key={item.id} className="bg-white rounded-xl border border-amber-200/80 shadow-sm flex flex-col overflow-hidden shrink-0 w-52 snap-start">
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt={item.title} className="w-full h-32 object-cover" />
                            ) : (
                              <div className="w-full h-32 bg-amber-50 flex items-center justify-center text-amber-200 border-b border-amber-100">
                                <svg className="w-9 h-9" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M7 3a4 4 0 0 0-4 4v2a4 4 0 0 0 4 4h2v2a4 4 0 0 0 4 4h6a4 4 0 0 0 4-4v-1a3 3 0 0 0-3-3h-1V7a4 4 0 0 0-4-4H7zm0 2h8a2 2 0 0 1 2 2v6h1a1 1 0 0 1 1 1v1a2 2 0 0 1-2 2h-6a2 2 0 0 1-2-2v-2H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" />
                                </svg>
                              </div>
                            )}
                            <div className="p-3 flex flex-col flex-1">
                              <div className="flex justify-between items-start gap-1">
                                <h4 className="font-semibold text-amber-950 text-sm leading-tight">{item.title}</h4>
                                <span className="text-amber-800 font-semibold text-sm whitespace-nowrap">₪{item.price}</span>
                              </div>
                              {item.description && <p className="text-xs text-stone-500 mt-1 line-clamp-2">{item.description}</p>}
                              <div className="mt-2 flex-1 flex items-end">
                                {item.isAvailable ? (
                                  <Link href={`/seller/${id}/order?item=${item.id}`}
                                    className="w-full text-center py-2 rounded-lg text-sm font-medium bg-amber-900 text-amber-50 hover:bg-amber-800 transition-colors active:scale-95">
                                    Order
                                  </Link>
                                ) : (
                                  <span className="text-stone-400 text-xs">Unavailable</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </section>

          {/* Reviews */}
          <section id="reviews" className="scroll-mt-20">
            <h2 className="text-lg font-semibold text-amber-950 mb-1">Reviews</h2>
            {reviewsData && reviewsData.total > 0 && (
              <p className="text-sm text-stone-500 mb-4">
                {reviewsData.avgRating} out of 5 · {reviewsData.total} review{reviewsData.total !== 1 ? 's' : ''}
              </p>
            )}

            {!isSeller && (
              <div className="bg-white rounded-2xl border border-amber-200/80 p-5 mb-5">
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
                          className="py-2.5 px-6 rounded-xl text-sm font-medium bg-amber-900 text-amber-50 hover:bg-amber-800 disabled:opacity-50 transition-colors active:scale-95">
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

            {reviews.length === 0 ? (
              <div className="bg-white rounded-xl border border-amber-200/80 p-8 text-center text-stone-500 text-sm">
                No reviews yet. Be the first!
              </div>
            ) : (
              <div className="space-y-3">
                {reviews.map((r) => (
                  <div key={r.id} className="bg-white rounded-xl border border-amber-200/80 p-4">
                    <div className="flex items-center justify-between mb-1.5">
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

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          items={imageMedia}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onPrev={() => setLightboxIndex((i) => (i! - 1 + imageMedia.length) % imageMedia.length)}
          onNext={() => setLightboxIndex((i) => (i! + 1) % imageMedia.length)}
        />
      )}
    </div>
  );
}
