'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api';

export function OnlineToggle({ initialValue }: { initialValue: boolean }) {
  const [isOnline, setIsOnline] = useState(initialValue);
  const [saving, setSaving] = useState(false);

  async function toggle() {
    setSaving(true);
    const next = !isOnline;
    const res = await apiFetch('/sellers/me/online', {
      method: 'PATCH',
      body: JSON.stringify({ isOnline: next }),
    });
    setSaving(false);
    if (!res.error && res.status < 400) setIsOnline(next);
  }

  return (
    <button
      onClick={toggle}
      disabled={saving}
      className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-sm font-medium border transition-colors disabled:opacity-60 ${
        isOnline
          ? 'bg-green-50 border-green-300 text-green-800 hover:bg-green-100'
          : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
      }`}
    >
      <span className={`w-2 h-2 rounded-full shrink-0 ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-stone-300'}`} />
      {saving ? 'Updating…' : isOnline ? 'Online now' : 'Offline'}
    </button>
  );
}
