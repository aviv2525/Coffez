'use client';

import { useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: err } = await apiFetch('/auth/password/reset-request', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    if (err) setError(err);
    else setSent(true);
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md bg-white p-6 rounded-lg shadow text-center">
          <p className="text-gray-700">If an account exists for that email, we sent a reset link.</p>
          <Link href="/auth/login" className="mt-4 inline-block text-indigo-600 hover:underline">Back to login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Reset password</h1>
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
          {error && <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</div>}
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
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send reset link'}
          </button>
          <p className="text-center text-sm">
            <Link href="/auth/login" className="text-indigo-600 hover:underline">Back to login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
