'use client';

import Link from 'next/link';

export default function SellerMenuPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-indigo-600">OrderBridge</Link>
          <Link href="/settings/seller" className="text-gray-600 hover:text-gray-900">← Seller settings</Link>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Manage menu</h1>
        <p className="text-gray-600">Add, edit, and toggle availability of menu items. (Use API or implement form here.)</p>
      </main>
    </div>
  );
}
