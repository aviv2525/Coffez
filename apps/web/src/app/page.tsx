import Link from 'next/link';
import { Header } from '@/components/Header';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 bg-amber-50/40">
        <div className="text-center max-w-2xl">
          <h1 className="text-4xl font-bold text-amber-950 mb-4">
            Homemade specialty coffee, from local sellers
          </h1>
          <p className="text-lg text-amber-900/80 mb-8">
            See who has which beans, what they brew, and when they’re open. Order espresso, pour-over, and more — fresh from their home.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/marketplace"
              className="bg-amber-900 text-amber-50 px-6 py-3 rounded-xl hover:bg-amber-800 font-medium"
            >
              Browse coffee sellers
            </Link>
            <Link
              href="/settings/seller"
              className="border border-amber-300 text-amber-900 px-6 py-3 rounded-xl hover:bg-amber-50 font-medium"
            >
              Sell your coffee
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
