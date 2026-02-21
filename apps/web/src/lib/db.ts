import Dexie, { type Table } from 'dexie';

export interface PendingOrder {
  id?: number;
  sellerId: string;
  menuItemId: string;
  note?: string | null;
  scheduledFor?: string | null;
  createdAt: number;
  synced: boolean;
  serverOrderId?: string;
}

export class OrderBridgeDB extends Dexie {
  pendingOrders!: Table<PendingOrder, number>;

  constructor() {
    super('OrderBridgeDB');
    this.version(1).stores({
      pendingOrders: '++id, createdAt, synced',
    });
  }
}

export const db = new OrderBridgeDB();
