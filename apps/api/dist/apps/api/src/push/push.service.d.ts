import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
export declare class PushService {
    private readonly config;
    private readonly prisma;
    private vapidPublic;
    constructor(config: ConfigService, prisma: PrismaService);
    getPublicKey(): string | null;
    subscribe(userId: string, subscription: {
        endpoint: string;
        keys: {
            p256dh: string;
            auth: string;
        };
    }): Promise<{
        success: boolean;
    }>;
    unsubscribe(userId: string, endpoint: string): Promise<{
        success: boolean;
    }>;
    notifySellerNewOrder(sellerId: string, orderId: string, buyerName: string): Promise<void>;
    notifyBuyerOrderStatus(buyerId: string, orderId: string, status: string): Promise<void>;
    private sendToSubs;
}
