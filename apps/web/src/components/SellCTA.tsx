'use client';

import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

export function SellCTA() {
  const { user } = useAuth();

  const { data: sellerProfile } = useQuery({
    queryKey: ['seller-profile-me'],
    queryFn: async () => {
      const res = await apiFetch('/sellers/me');
      if (res.status === 404 || res.error) return null;
      return res.data ?? null;
    },
    enabled: !!user,
    staleTime: 30 * 1000,
  });

  // Hide if user already has any seller profile (pending, approved, rejected)
  if (user && sellerProfile) return null;

  return (
    <Link
      href="/become-seller"
      className="flex-1 text-center border border-amber-300 text-amber-900 px-6 py-3.5 rounded-2xl hover:bg-amber-100 font-semibold text-base transition-colors active:scale-95"
    >
      Sell yours
    </Link>
  );
}
