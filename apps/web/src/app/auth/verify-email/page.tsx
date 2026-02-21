'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }
    apiFetch('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    }).then(({ error }) => {
      setStatus(error ? 'error' : 'success');
    });
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow text-center">
        {status === 'loading' && <p>Verifying your email...</p>}
        {status === 'success' && (
          <>
            <p className="text-green-600 font-medium">Email verified successfully.</p>
            <Link href="/auth/login" className="mt-4 inline-block text-indigo-600 hover:underline">Log in</Link>
          </>
        )}
        {status === 'error' && (
          <>
            <p className="text-red-600">Invalid or expired link.</p>
            <Link href="/auth/login" className="mt-4 inline-block text-indigo-600 hover:underline">Back to login</Link>
          </>
        )}
      </div>
    </div>
  );
}
