import Link from 'next/link';
import { Header } from '@/components/Header';
import { SellCTA } from '@/components/SellCTA';
import { CoffeeLogo } from '@/components/CoffeeLogo';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center px-5 bg-amber-50/40">
        <div className="text-center max-w-md w-full py-12">

          {/* Logo mark */}
          <div className="w-16 h-16 rounded-2xl bg-amber-900 flex items-center justify-center mx-auto mb-6">
            <CoffeeLogo className="w-9 h-9 text-amber-50" />
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
      <footer className="text-center py-4 text-xs text-stone-400 space-x-4">
        <Link href="/privacy" className="hover:text-stone-600">Privacy Policy</Link>
        <Link href="/terms" className="hover:text-stone-600">Terms of Service</Link>
      </footer>
    </div>
  );
}
