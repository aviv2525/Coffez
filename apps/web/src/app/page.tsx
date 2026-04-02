import Link from 'next/link';
import { Header } from '@/components/Header';
import { SellCTA } from '@/components/SellCTA';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center px-5 bg-amber-50/40">
        <div className="text-center max-w-md w-full py-12">

          {/* Logo mark */}
          <div className="w-16 h-16 rounded-2xl bg-amber-900 flex items-center justify-center mx-auto mb-6">
            <svg className="w-9 h-9 text-amber-50" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 3a4 4 0 0 0-4 4v2a4 4 0 0 0 4 4h2v2a4 4 0 0 0 4 4h6a4 4 0 0 0 4-4v-1a3 3 0 0 0-3-3h-1V7a4 4 0 0 0-4-4H7zm0 2h8a2 2 0 0 1 2 2v6h1a1 1 0 0 1 1 1v1a2 2 0 0 1-2 2h-6a2 2 0 0 1-2-2v-2H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" />
            </svg>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-amber-950 mb-3 leading-tight">
            Homemade coffee,<br className="md:hidden" /> from local sellers
          </h1>
          <p className="text-base text-amber-900/70 mb-8 leading-relaxed">
            Discover home baristas near you. See their menu, beans, and hours — and order fresh specialty coffee.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs mx-auto">
            <Link
              href="/marketplace"
              className="flex-1 text-center bg-amber-900 text-amber-50 px-6 py-3.5 rounded-2xl hover:bg-amber-800 font-semibold text-base transition-colors active:scale-95"
            >
              Find coffee
            </Link>
            <SellCTA />
          </div>

        </div>
      </main>
    </div>
  );
}
