'use client';

import Link from 'next/link';

export default function SellerSettingsPage() {
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
