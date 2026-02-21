'use client';

import { useEffect, useState } from 'react';
import { hasPendingOrders, syncPendingOrders } from '@/lib/offline-sync';

export function OfflineBanner() {
  const [online, setOnline] = useState(true);
  const [pending, setPending] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    setOnline(typeof navigator !== 'undefined' && navigator.onLine);
    const handleOnline = () => {
      setOnline(true);
      setSyncing(true);
      syncPendingOrders().then(({ synced }) => {
        setSyncing(false);
        if (synced > 0) window.location.reload();
      });
    };
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    hasPendingOrders().then(setPending);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!online) return;
    const interval = setInterval(() => hasPendingOrders().then(setPending), 5000);
    return () => clearInterval(interval);
  }, [online]);

  if (online && !pending && !syncing) return null;

  return (
    <div className="bg-amber-500 text-white text-center py-2 px-4 text-sm">
      {!online && 'You are offline. Orders will sync when you’re back online.'}
      {online && pending && !syncing && 'You have pending orders waiting to sync.'}
      {online && syncing && 'Syncing pending orders...'}
    </div>
  );
}
