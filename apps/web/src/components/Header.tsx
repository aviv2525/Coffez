'use client';

import Link from 'next/link';
import { useAuth } from './AuthProvider';

export function Header() {
  const { user, isAuthenticated, isLoading } = useAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-amber-200/60 bg-white/95 backdrop-blur">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-amber-950">
          COFFEZ
        </Link>

        {/* Desktop nav — hidden on mobile (BottomNav handles mobile) */}
        <nav className="hidden md:flex gap-4 items-center">
          <Link href="/marketplace" className="text-amber-900/80 hover:text-amber-950 text-sm">
            Marketplace
          </Link>
          {isLoading ? null : isAuthenticated && user ? (
            <>
              <Link href="/orders" className="text-amber-900/80 hover:text-amber-950 text-sm">
                Orders
              </Link>
              <Link href="/profile" className="text-amber-900 hover:text-amber-950 font-medium text-sm">
                {user.fullName}
              </Link>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-amber-900/80 hover:text-amber-950 text-sm">
                Log in
              </Link>
              <Link
                href="/auth/register"
                className="bg-amber-900 text-amber-50 px-4 py-2 rounded-xl hover:bg-amber-800 font-medium text-sm"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>

        {/* Mobile — show login/signup only when not authenticated */}
        {!isLoading && !isAuthenticated && (
          <div className="flex md:hidden gap-2 items-center">
            <Link href="/auth/login" className="text-amber-900/80 text-sm font-medium">
              Log in
            </Link>
            <Link
              href="/auth/register"
              className="bg-amber-900 text-amber-50 px-3 py-1.5 rounded-xl hover:bg-amber-800 font-medium text-sm"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
