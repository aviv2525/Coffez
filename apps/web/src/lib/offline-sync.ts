import { db } from './db';
import { apiFetch } from './api';

export async function addPendingOrder(order: {
  sellerId: string;
  menuItemId: string;
  note?: string | null;
  scheduledFor?: string | null;
}) {
  return db.pendingOrders.add({
    ...order,
    createdAt: Date.now(),
    synced: false,
  });
}

export async function getPendingOrders() {
  return db.pendingOrders.where('synced').equals(0).toArray();
}

export async function syncPendingOrders(): Promise<{ synced: number; failed: number }> {
  const pending = await getPendingOrders();
  let synced = 0;
  let failed = 0;
  for (const row of pending) {
    const { data, error } = await apiFetch<{ id: string }>('/orders', {
      method: 'POST',
      body: JSON.stringify({
        sellerId: row.sellerId,
        menuItemId: row.menuItemId,
        note: row.note,
        scheduledFor: row.scheduledFor,
      }),
    });
    if (!error && data?.id && row.id) {
      await db.pendingOrders.update(row.id, { synced: true, serverOrderId: data.id });
      synced++;
    } else {
      failed++;
    }
  }
  return { synced, failed };
}

export async function hasPendingOrders(): Promise<boolean> {
  const count = await db.pendingOrders.where('synced').equals(0).count();
  return count > 0;
}
