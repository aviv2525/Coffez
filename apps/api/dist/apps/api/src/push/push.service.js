"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PushService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const webPush = require("web-push");
const prisma_service_1 = require("../prisma/prisma.service");
let PushService = class PushService {
    constructor(config, prisma) {
        this.config = config;
        this.prisma = prisma;
        this.vapidPublic = null;
        const get = (k) => this.config?.get?.(k) ?? process.env[k];
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
    async subscribe(userId, subscription) {
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
    async unsubscribe(userId, endpoint) {
        await this.prisma.pushSubscription.deleteMany({
            where: { userId, endpoint },
        });
        return { success: true };
    }
    async notifySellerNewOrder(sellerId, orderId, buyerName) {
        const subs = await this.prisma.pushSubscription.findMany({ where: { userId: sellerId } });
        const payload = JSON.stringify({
            title: 'New order',
            body: `${buyerName} placed an order`,
            url: `/orders`,
            tag: `order-${orderId}`,
        });
        await this.sendToSubs(subs, payload);
    }
    async notifyBuyerOrderStatus(buyerId, orderId, status) {
        const subs = await this.prisma.pushSubscription.findMany({ where: { userId: buyerId } });
        const payload = JSON.stringify({
            title: 'Order update',
            body: `Your order status: ${status}`,
            url: `/orders`,
            tag: `order-${orderId}`,
        });
        await this.sendToSubs(subs, payload);
    }
    async sendToSubs(subs, payload) {
        const privateKey = this.config?.get?.('VAPID_PRIVATE_KEY') ?? process.env.VAPID_PRIVATE_KEY;
        if (!privateKey)
            return;
        for (const sub of subs) {
            try {
                await webPush.sendNotification({
                    endpoint: sub.endpoint,
                    keys: { p256dh: sub.p256dh, auth: sub.auth },
                }, payload, { TTL: 86400 });
            }
            catch {
                await this.prisma.pushSubscription.deleteMany({
                    where: { endpoint: sub.endpoint },
                }).catch(() => { });
            }
        }
    }
};
exports.PushService = PushService;
exports.PushService = PushService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prisma_service_1.PrismaService])
], PushService);
//# sourceMappingURL=push.service.js.map