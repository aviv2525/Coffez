'use client';

import Link from 'next/link';

export default function SellerSettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-indigo-600">OrderBridge</Link>
          <nav className="flex gap-4">
            <Link href="/marketplace" className="text-gray-600 hover:text-gray-900">Marketplace</Link>
            <Link href="/orders" className="text-gray-600 hover:text-gray-900">Orders</Link>
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Seller settings</h1>
        <div className="bg-white rounded-lg border p-6 space-y-4">
          <Link href="/settings/seller/menu" className="block text-indigo-600 hover:underline font-medium">
            → Manage menu
          </Link>
          <Link href="/settings/seller/media" className="block text-indigo-600 hover:underline font-medium">
            → Manage media gallery
          </Link>
        </div>
      </main>
    </div>
  );
}
