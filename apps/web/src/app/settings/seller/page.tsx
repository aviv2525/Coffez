'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

type OnboardingState = 'loading' | 'ready' | 'error';

export default function SellerSettingsPage() {
  const router = useRouter();
  const [state, setState] = useState<OnboardingState>('loading');

  useEffect(() => {
    let cancelled = false;

    async function ensureSellerProfile() {
      const res = await apiFetch<unknown>('/sellers/me');
      if (cancelled) return;

      if (res.status === 401) {
        router.replace('/auth/login');
        return;
      }

      if (res.status === 404) {
        const createRes = await apiFetch<unknown>('/sellers/me', {
          method: 'POST',
          body: JSON.stringify({ displayName: 'My shop' }),
        });
        if (cancelled) return;
        if (createRes.error || createRes.status >= 400) {
          setState('error');
          return;
        }
      } else if (res.error && res.status !== 200) {
        setState('error');
        return;
      }

      setState('ready');
    }

    ensureSellerProfile();
    return () => {
      cancelled = true;
    };
  }, [router]);

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
