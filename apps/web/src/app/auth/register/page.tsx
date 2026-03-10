'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch, setAuthToken } from '@/lib/api';

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
    router.push('/orders');
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
