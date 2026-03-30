'use client';

import { useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { apiFetch } from '@/lib/api';

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const output = new Uint8Array(buffer);
  for (let i = 0; i < rawData.length; i++) {
    output[i] = rawData.charCodeAt(i);
  }
  return buffer;
}

export function PWAProvider() {
  const { isAuthenticated, user } = useAuth();

  // Register service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => console.log('[SW] registered, scope:', reg.scope))
        .catch((err) => console.error('[SW] registration failed:', err));
    }
  }, []);

  // Subscribe to push when user logs in
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return;

    async function subscribeToPush() {
      try {
        // Don't ask again if already denied
        if (Notification.permission === 'denied') return;

        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return;

        const reg = await navigator.serviceWorker.ready;

        // Check if already subscribed
        const existing = await reg.pushManager.getSubscription();
        if (existing) return;

        // Fetch VAPID public key from backend
        const { data: vapidData } = await apiFetch<{ publicKey: string }>('/push/vapid-public');
        if (!vapidData?.publicKey) return;

        const subscription = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidData.publicKey),
        });

        const sub = subscription.toJSON();
        if (!sub.endpoint || !sub.keys?.p256dh || !sub.keys?.auth) return;

        await apiFetch('/push/subscribe', {
          method: 'POST',
          body: JSON.stringify({
            subscription: {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth },
            },
          }),
        });

        console.log('[Push] subscribed successfully');
      } catch (err) {
        console.error('[Push] subscribe failed:', err);
      }
    }

    subscribeToPush();
  }, [isAuthenticated, user]);

  return null;
}
