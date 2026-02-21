'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import { apiFetch } from '@/lib/api';

type Order = {
  id: string;
  status: string;
  note: string | null;
  menuItem?: { title: string; price: number };
  seller?: { displayName: string };
  buyer?: { fullName: string };
  createdAt: string;
};

type Tab = 'my' | 'incoming';

export default function OrdersPage() {
  const [tab, setTab] = useState<Tab>('my');

  const { data: myData, isLoading: loadingMy } = useQuery({
    queryKey: ['orders-my'],
    queryFn: async () => {
      const res = await apiFetch<{ data: Order[] }>('/orders/my');
      if (res.error) throw new Error(res.error);
      return res.data!;
    },
    enabled: tab === 'my',
  });

  const { data: incomingData, isLoading: loadingIncoming } = useQuery({
    queryKey: ['orders-incoming'],
    queryFn: async () => {
      const res = await apiFetch<{ data: Order[] }>('/orders/incoming');
      if (res.error) throw new Error(res.error);
      return res.data!;
    },
    enabled: tab === 'incoming',
  });

  const myOrders = myData?.data ?? [];
  const incomingOrders = incomingData?.data ?? [];
  const isLoading = tab === 'my' ? loadingMy : loadingIncoming;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-indigo-600">OrderBridge</Link>
          <nav className="flex gap-4">
            <Link href="/marketplace" className="text-gray-600 hover:text-gray-900">Marketplace</Link>
            <Link href="/orders" className="text-indigo-600 font-medium">Orders</Link>
            <Link href="/settings/seller" className="text-gray-600 hover:text-gray-900">Seller</Link>
            <Link href="/auth/login" className="text-gray-600 hover:text-gray-900">Log in</Link>
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Orders</h1>
        <div className="flex gap-2 border-b mb-6">
          <button
            onClick={() => setTab('my')}
            className={`px-4 py-2 ${tab === 'my' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-600'}`}
          >
            My Orders
          </button>
          <button
            onClick={() => setTab('incoming')}
            className={`px-4 py-2 ${tab === 'incoming' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-600'}`}
          >
            Incoming
          </button>
        </div>
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <div className="space-y-4">
            {(tab === 'my' ? myOrders : incomingOrders).map((o) => (
              <div key={o.id} className="bg-white p-4 rounded-lg border flex justify-between items-start">
                <div>
                  <span className="font-medium">{o.menuItem?.title ?? 'Order'}</span>
                  <span className="ml-2 text-sm text-gray-500">#{o.id.slice(0, 8)}</span>
                  <div className="text-sm text-gray-600 mt-1">
                    {tab === 'my' ? `Seller: ${o.seller?.displayName ?? '-'}` : `From: ${o.buyer?.fullName ?? '-'}`}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Status: <span className="font-medium">{o.status}</span>
                  </div>
                </div>
                <div className="text-sm text-gray-500">{new Date(o.createdAt).toLocaleDateString()}</div>
              </div>
            ))}
            {(tab === 'my' ? myOrders : incomingOrders).length === 0 && (
              <p className="text-gray-500">No orders.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
