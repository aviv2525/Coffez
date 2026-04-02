'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';

export default function BecomeSellerPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [tier, setTier] = useState<'HOME' | 'BUSINESS'>('HOME');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [street, setStreet] = useState('');
  const [applicationNotes, setApplicationNotes] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!agreed) return;
    setSubmitting(true);
    setError(null);

    const res = await apiFetch('/sellers/me', {
      method: 'POST',
      body: JSON.stringify({ displayName: user?.fullName ?? 'My Shop', tier, phone, city, street: street || undefined, applicationNotes: applicationNotes || undefined }),
    });

    setSubmitting(false);
    if (res.error || res.status >= 400) {
      if (res.status === 403) {
        router.replace('/profile');
      } else {
        setError(res.error || 'Something went wrong. Please try again.');
      }
      return;
    }
    router.replace('/profile');
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-amber-50/40 flex items-center justify-center px-4">
        <p className="text-amber-900">
          <Link href="/auth/login" className="underline font-medium">Log in</Link> to apply as a seller.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50/40">
      <header className="border-b border-amber-200/60 bg-white/95 backdrop-blur px-4 py-3 flex items-center gap-3">
        <Link href="/" className="text-lg font-bold text-amber-950">COFFEZ</Link>
        <span className="text-stone-300">/</span>
        <span className="text-sm text-stone-500">Become a seller</span>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-lg">
        <h1 className="text-2xl font-bold text-amber-950 mb-1">Sell your coffee</h1>
        <p className="text-stone-500 text-sm mb-6">Your application will be reviewed within 24–48 hours.</p>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Tier selection */}
          <div className="bg-white rounded-2xl border border-amber-200/80 p-5">
            <p className="text-sm font-semibold text-stone-700 mb-3">What type of seller are you?</p>
            <div className="space-y-3">
              <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${tier === 'HOME' ? 'border-amber-500 bg-amber-50' : 'border-stone-200 hover:border-amber-200'}`}>
                <input type="radio" name="tier" value="HOME" checked={tier === 'HOME'} onChange={() => setTier('HOME')} className="mt-0.5 accent-amber-800" />
                <div>
                  <p className="font-semibold text-stone-800 text-sm">Home seller</p>
                  <p className="text-xs text-stone-500 mt-0.5">You make coffee at home and sell to people around you. You set your own prices (including ₪0) and rely on tips.</p>
                </div>
              </label>
              <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${tier === 'BUSINESS' ? 'border-amber-500 bg-amber-50' : 'border-stone-200 hover:border-amber-200'}`}>
                <input type="radio" name="tier" value="BUSINESS" checked={tier === 'BUSINESS'} onChange={() => setTier('BUSINESS')} className="mt-0.5 accent-amber-800" />
                <div>
                  <p className="font-semibold text-stone-800 text-sm">Business</p>
                  <p className="text-xs text-stone-500 mt-0.5">You operate an existing coffee business and want to receive orders through Coffez with full payment processing.</p>
                </div>
              </label>
            </div>
          </div>

          {/* Contact details */}
          <div className="bg-white rounded-2xl border border-amber-200/80 p-5 space-y-4">
            <p className="text-sm font-semibold text-stone-700">פרטי יצירת קשר</p>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">טלפון <span className="text-red-500">*</span></label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="05X-XXXXXXX"
                className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">עיר <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="תל אביב"
                className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">רחוב <span className="text-stone-400 font-normal">(לא חובה)</span></label>
              <input
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="רחוב הרצל 10"
                className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">הערות <span className="text-stone-400 font-normal">(לא חובה — רצוי להוסיף)</span></label>
              <textarea
                value={applicationNotes}
                onChange={(e) => setApplicationNotes(e.target.value)}
                placeholder="ספר לנו קצת על הקפה שלך, הציוד, שעות פעילות..."
                rows={3}
                className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
              />
            </div>
          </div>

          {/* Pricing info */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-900 space-y-1.5">
            <p className="font-semibold">How pricing works</p>
            {tier === 'HOME' ? (
              <>
                <p>• You sell at <strong>₪0</strong> — income is entirely tip-based (Bit / PayPal)</p>
                <p>• Free to use until you reach <strong>50 completed orders</strong>, then a monthly subscription applies</p>
              </>
            ) : (
              <>
                <p>• You set your own prices with full payment processing</p>
                <p>• A monthly subscription applies after approval</p>
                <p>• We'll contact you to set up your payment account</p>
              </>
            )}
          </div>

          {/* Disclaimer */}
          <div className="bg-white rounded-2xl border border-amber-200/80 p-5">
            <p className="text-sm font-semibold text-stone-700 mb-3">Before you continue</p>
            <div className="text-xs text-stone-500 space-y-2 mb-4">
              <p>• You are solely responsible for the products you sell, including compliance with all applicable health and food safety regulations (Ministry of Health, etc.).</p>
              <p>• Coffez is a marketplace platform only and bears no responsibility for the quality, safety, or legality of the products sold.</p>
              <p>• Food items (beyond beverages) may be subject to additional regulations — ensure you understand your obligations before listing them.</p>
              <p>• By applying, you confirm that you have read and understood these terms.</p>
            </div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 accent-amber-800" />
              <span className="text-sm text-stone-700">I understand and accept full responsibility for my products and their compliance with applicable regulations.</span>
            </label>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={!agreed || submitting}
            className="w-full py-3 rounded-2xl text-sm font-semibold bg-amber-900 text-amber-50 hover:bg-amber-800 disabled:opacity-50 transition-colors"
          >
            {submitting ? 'Submitting…' : 'Submit application'}
          </button>

          <p className="text-xs text-center text-stone-400">
            After submitting, we'll review your application and reach out within 24–48 hours.
          </p>
        </form>
      </main>
    </div>
  );
}
