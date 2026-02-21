'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';

type Seller = {
  userId: string;
  displayName: string;
  bio: string | null;
  categories: string[];
  locationText: string | null;
  avatarUrl: string | null;
  user?: { id: string; fullName: string };
};

type ListResult = { data: Seller[]; total: number; page: number; limit: number; totalPages: number };

export default function MarketplacePage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['sellers'],
    queryFn: async () => {
      const res = await apiFetch<ListResult>('/sellers?page=1&limit=50');
      if (res.error || !res.data) throw new Error(res.error || 'Failed to load');
      return res.data;
    },
  });

  if (isLoading) return <div className="container mx-auto px-4 py-8">Loading sellers...</div>;
  if (error) return <div className="container mx-auto px-4 py-8 text-red-600">Error loading marketplace.</div>;

  const sellers = data?.data ?? [];

  return (
    <div className="min-h-screen">
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-indigo-600">OrderBridge</Link>
          <nav className="flex gap-4">
            <Link href="/marketplace" className="text-gray-600 hover:text-gray-900">Marketplace</Link>
            <Link href="/orders" className="text-gray-600 hover:text-gray-900">Orders</Link>
            <Link href="/auth/login" className="text-gray-600 hover:text-gray-900">Log in</Link>
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Sellers</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sellers.map((s) => (
            <Link
              key={s.userId}
              href={`/seller/${s.userId}`}
              className="block p-4 bg-white rounded-lg border hover:shadow-md"
            >
              <div className="font-semibold">{s.displayName}</div>
              {s.locationText && <div className="text-sm text-gray-500">{s.locationText}</div>}
              {s.categories?.length > 0 && (
                <div className="text-sm text-indigo-600 mt-1">{s.categories.join(', ')}</div>
              )}
              {s.bio && <p className="text-sm text-gray-600 mt-2 line-clamp-2">{s.bio}</p>}
            </Link>
          ))}
        </div>
        {sellers.length === 0 && (
          <p className="text-gray-500">No sellers yet.</p>
        )}
      </main>
    </div>
  );
}
