'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch, setAuthToken } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { data, error: err } = await apiFetch<{ user: unknown; accessToken: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setLoading(false);
    if (err || !data?.accessToken) {
      setError(err || 'Login failed');
      return;
    }
    setAuthToken(data.accessToken);
    router.push('/orders');
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Log in to OrderBridge</h1>
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Log in'}
          </button>
          <p className="text-center text-sm text-gray-600">
            <Link href="/auth/register" className="text-indigo-600 hover:underline">
              Create an account
            </Link>
            {' · '}
            <Link href="/auth/forgot-password" className="text-indigo-600 hover:underline">
              Forgot password?
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
