'use client';

import Link from 'next/link';
import { useAuth } from './AuthProvider';

export function Header() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="border-b border-amber-200/60 bg-white">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-amber-950">
          COFFEZ
        </Link>
        <nav className="flex gap-4 items-center">
          <Link href="/marketplace" className="text-amber-900/80 hover:text-amber-950">
            Marketplace
          </Link>
          {isAuthenticated && (
            <>
              <Link href="/orders" className="text-amber-900/80 hover:text-amber-950">
                Orders
              </Link>
              <Link href="/settings/seller" className="text-amber-900/80 hover:text-amber-950">
                My Shop
              </Link>
            </>
          )}
          {isLoading ? (
            <div className="text-amber-900/60">Loading...</div>
          ) : isAuthenticated && user ? (
            <>
              <span className="text-amber-900">שלום {user.fullName}</span>
              <button
                onClick={handleLogout}
                className="text-amber-900/80 hover:text-amber-950 underline"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-amber-900/80 hover:text-amber-950">
                Log in
              </Link>
              <Link
                href="/auth/register"
                className="bg-amber-900 text-amber-50 px-4 py-2 rounded-xl hover:bg-amber-800 font-medium"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}