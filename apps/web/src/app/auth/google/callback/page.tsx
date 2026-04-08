'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { apiFetch, setAuthToken } from '@/lib/api';

export default function GoogleCallbackPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();

  useEffect(() => {
    async function complete() {
      try {
        // Cookie was set by the API. Exchange it for an access token then load user.
        const { data } = await apiFetch<{ accessToken: string }>('/auth/refresh', {
          method: 'POST',
        });
        if (!data?.accessToken) throw new Error('No token');
        setAuthToken(data.accessToken);
        await refreshUser();
        router.replace('/profile');
      } catch {
        router.replace('/auth/login');
      }
    }
    complete();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-amber-50/50">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-amber-900 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-amber-900 font-medium">Signing you in…</p>
      </div>
    </div>
  );
}
