'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';

export function BottomNav() {
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();

  // Hide on auth pages and when not authenticated
  if (isLoading || !isAuthenticated) return null;
  if (pathname.startsWith('/auth/')) return null;

  const active = (href: string) =>
    pathname === href || pathname.startsWith(href + '/');

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-amber-200/60 safe-area-bottom">
      <div className="flex items-stretch h-16">

        {/* Marketplace */}
        <Link href="/marketplace" className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors ${active('/marketplace') ? 'text-amber-900' : 'text-stone-400'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active('/marketplace') ? 2.2 : 1.8}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span className="text-[10px] font-medium">Discover</span>
        </Link>

        {/* Orders */}
        <Link href="/orders" className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors ${active('/orders') ? 'text-amber-900' : 'text-stone-400'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active('/orders') ? 2.2 : 1.8}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span className="text-[10px] font-medium">Orders</span>
        </Link>

        {/* Profile */}
        <Link href="/profile" className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors ${active('/profile') ? 'text-amber-900' : 'text-stone-400'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active('/profile') ? 2.2 : 1.8}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-[10px] font-medium">Profile</span>
        </Link>

      </div>
    </nav>
  );
}
