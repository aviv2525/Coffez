import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as webPush from 'web-push';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PushService {
  private vapidPublic: string | null = null;
  private batchTimers = new Map<string, ReturnType<typeof setTimeout>>();
  private batchCounts = new Map<string, number>();

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const get = (k: string) => this.config?.get?.(k) ?? process.env[k];
    const publicKey = get('VAPID_PUBLIC_KEY');
    const privateKey = get('VAPID_PRIVATE_KEY');
    if (publicKey && privateKey) {
      webPush.setVapidDetails('mailto:orderbridge@example.com', publicKey, privateKey);
      this.vapidPublic = publicKey;
    }
  }

  getPublicKey() {
    return this.vapidPublic;
  }

  async subscribe(userId: string, subscription: { endpoint: string; keys: { p256dh: string; auth: string } }) {
    await this.prisma.pushSubscription.upsert({
      where: {
        userId_endpoint: { userId, endpoint: subscription.endpoint },
      },
      create: {
        userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
      update: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
    });
    return { success: true };
  }

  async unsubscribe(userId: string, endpoint: string) {
    await this.prisma.pushSubscription.deleteMany({
      where: { userId, endpoint },
    });
    return { success: true };
  }

  async notifySellerNewOrder(sellerId: string, orderId: string, buyerName: string) {
    const batchKey = `new-order:${sellerId}`;
    const count = (this.batchCounts.get(batchKey) ?? 0) + 1;
    this.batchCounts.set(batchKey, count);

    const existing = this.batchTimers.get(batchKey);
    if (existing) clearTimeout(existing);

    const timer = setTimeout(async () => {
      this.batchTimers.delete(batchKey);
      const finalCount = this.batchCounts.get(batchKey) ?? 1;
      this.batchCounts.delete(batchKey);

      const subs = await this.prisma.pushSubscription.findMany({ where: { userId: sellerId } });
      const payload = JSON.stringify(
        finalCount === 1
          ? { title: 'New order', body: `${buyerName} placed an order`, url: '/orders', tag: 'new-order' }
          : { title: `${finalCount} new orders`, body: 'You have new orders waiting', url: '/orders', tag: 'new-order' },
      );
      await this.sendToSubs(subs, payload);
    }, 5000);

    this.batchTimers.set(batchKey, timer);
  }

  async notifyBuyerOrderStatus(buyerId: string, orderId: string, status: string) {
    const subs = await this.prisma.pushSubscription.findMany({ where: { userId: buyerId } });
    const payload = JSON.stringify({
      title: 'Order update',
      body: `Your order status: ${status}`,
      url: `/orders`,
      tag: `order-${orderId}`,
    });
    await this.sendToSubs(subs, payload);
  }

  private async sendToSubs(
    subs: { endpoint: string; p256dh: string; auth: string }[],
    payload: string,
  ) {
    const privateKey = this.config?.get?.('VAPID_PRIVATE_KEY') ?? process.env.VAPID_PRIVATE_KEY;
    if (!privateKey) return;
    for (const sub of subs) {
      try {
        await webPush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          payload,
          { TTL: 86400 },
        );
      } catch {
        // remove invalid subscription
        await this.prisma.pushSubscription.deleteMany({
          where: { endpoint: sub.endpoint },
        }).catch(() => {});
      }
    }
  }
}
