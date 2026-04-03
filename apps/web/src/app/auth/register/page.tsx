'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch, setAuthToken } from '@/lib/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { data, error: err } = await apiFetch<{ user: unknown; accessToken: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, fullName }),
    });
    setLoading(false);
    if (err || !data?.accessToken) {
      setError(err || 'Registration failed');
      return;
    }
    setAuthToken(data.accessToken);
    router.push('/marketplace');
    router.refresh();
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-amber-50/50 px-4">
      <Link href="/" className="absolute top-4 left-4 text-lg font-bold text-amber-950 hover:text-amber-800">
        COFFEZ
      </Link>
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-amber-950 mb-2">Create your account</h1>
        <p className="text-center text-amber-900/80 text-sm mb-6">Join COFFEZ — sell or order homemade coffee</p>
        <a
          href={`${API_BASE}/auth/google`}
          className="flex items-center justify-center gap-3 w-full bg-white border border-stone-300 text-stone-700 py-2.5 rounded-xl font-medium hover:bg-stone-50 transition-colors mb-3 shadow-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </a>

        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1 h-px bg-amber-100" />
          <span className="text-xs text-stone-400">or sign up with email</span>
          <div className="flex-1 h-px bg-amber-100" />
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-amber-200/80 space-y-4">
          {error && (
            <div className="text-red-700 text-sm bg-red-50 p-3 rounded-xl border border-red-200">{error}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Full name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full border border-amber-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-300 focus:border-amber-400 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-amber-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-300 focus:border-amber-400 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Password (min 8)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-amber-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-300 focus:border-amber-400 outline-none"
              minLength={8}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-900 text-amber-50 py-2.5 rounded-xl font-medium hover:bg-amber-800 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Creating account...' : 'Sign up'}
          </button>
          <p className="text-center text-sm text-stone-600">
            <Link href="/auth/login" className="text-amber-800 hover:text-amber-950 font-medium">
              Already have an account? Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
