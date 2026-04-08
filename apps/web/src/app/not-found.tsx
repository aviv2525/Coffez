import Link from 'next/link';
import { CoffeeLogo } from '@/components/CoffeeLogo';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-amber-50/40 flex flex-col items-center justify-center px-5">
      <div className="text-center max-w-sm w-full">

        <div className="w-16 h-16 rounded-2xl bg-amber-900 flex items-center justify-center mx-auto mb-6">
          <CoffeeLogo className="w-9 h-9 text-amber-50" />
        </div>

        <p className="text-5xl font-bold text-amber-900 mb-3">404</p>
        <h1 className="text-xl font-semibold text-amber-950 mb-2">Page not found</h1>
        <p className="text-stone-500 text-sm mb-8">Looks like this cup is empty — the page you're looking for doesn't exist.</p>

        <Link
          href="/marketplace"
          className="inline-block px-6 py-2.5 rounded-xl bg-amber-900 text-amber-50 text-sm font-medium hover:bg-amber-800 transition-colors"
        >
          Back to marketplace
        </Link>
      </div>
    </div>
  );
}
