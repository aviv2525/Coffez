'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return setError('Missing reset token');
    setError('');
    setLoading(true);
    const { error: err } = await apiFetch('/auth/password/reset', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword: password }),
    });
    setLoading(false);
    if (err) setError(err);
    else setDone(true);
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md bg-white p-6 rounded-lg shadow text-center">
          <p className="text-green-600 font-medium">Password reset. You can log in now.</p>
          <Link href="/auth/login" className="mt-4 inline-block text-indigo-600 hover:underline">Log in</Link>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md bg-white p-6 rounded-lg shadow text-center">
          <p className="text-red-600">Invalid reset link. Request a new one.</p>
          <Link href="/auth/forgot-password" className="mt-4 inline-block text-indigo-600 hover:underline">Request reset</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Set new password</h1>
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
          {error && <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New password (min 8)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              minLength={8}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Resetting...' : 'Reset password'}
          </button>
          <p className="text-center text-sm">
            <Link href="/auth/login" className="text-indigo-600 hover:underline">Back to login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
