'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';

type MenuItem = { id: string; title: string; description: string | null; price: number; imageUrl: string | null; isAvailable: boolean };
type Seller = { userId: string; displayName: string; bio: string | null; categories: string[]; locationText: string | null; avatarUrl: string | null };
type Media = { id: string; type: string; url: string; thumbnailUrl: string | null; title: string | null; caption: string | null };

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

  const { data: media = [] } = useQuery({
    queryKey: ['seller-media', id],
    queryFn: async () => {
      const res = await apiFetch<Media[]>(`/sellers/${id}/media`);
      if (res.error) return [];
      return res.data ?? [];
    },
    enabled: !!id,
  });

  if (loadingSeller || !seller) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {loadingSeller ? 'Loading...' : 'Seller not found.'}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-indigo-600">OrderBridge</Link>
          <Link href="/marketplace" className="text-gray-600 hover:text-gray-900">Marketplace</Link>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h1 className="text-2xl font-bold">{seller.displayName}</h1>
          {seller.locationText && <p className="text-gray-500">{seller.locationText}</p>}
          {seller.categories?.length > 0 && (
            <p className="text-indigo-600 text-sm mt-1">{seller.categories.join(', ')}</p>
          )}
          {seller.bio && <p className="mt-4 text-gray-700">{seller.bio}</p>}
        </div>

        {media.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Gallery</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {media.map((m) => (
                <div key={m.id} className="rounded-lg overflow-hidden bg-gray-100 aspect-square">
                  {m.type === 'IMAGE' ? (
                    <img src={m.url} alt={m.title || ''} className="w-full h-full object-cover" />
                  ) : (
                    <video src={m.url} controls className="w-full h-full object-cover" />
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-lg font-semibold mb-4">Menu</h2>
          {loadingMenu ? (
            <p>Loading menu...</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {menu.map((item) => (
                <div key={item.id} className="bg-white rounded-lg border p-4">
                  <div className="font-semibold">{item.title}</div>
                  {item.description && <p className="text-sm text-gray-600">{item.description}</p>}
                  <p className="text-indigo-600 font-medium mt-1">₪{item.price}</p>
                  {item.isAvailable ? (
                    <Link
                      href={`/seller/${id}/order?item=${item.id}`}
                      className="inline-block mt-2 text-sm text-indigo-600 hover:underline"
                    >
                      Order →
                    </Link>
                  ) : (
                    <span className="text-gray-400 text-sm">Unavailable</span>
                  )}
                </div>
              ))}
            </div>
          )}
          {menu.length === 0 && !loadingMenu && <p className="text-gray-500">No menu items.</p>}
        </section>
      </main>
    </div>
  );
}
