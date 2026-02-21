import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PushService } from '../push/push.service';
import type { CreateOrderInput } from '@orderbridge/shared';
import { OrderStatus as PrismaOrderStatus } from '@prisma/client';
export declare class OrdersService {
    private readonly prisma;
    private readonly notifications;
    private readonly push;
    constructor(prisma: PrismaService, notifications: NotificationsService, push: PushService);
    create(buyerId: string, input: CreateOrderInput): Promise<{
        id: any;
        buyerId: any;
        sellerId: any;
        menuItemId: any;
        status: any;
        note: any;
        scheduledFor: any;
        createdAt: any;
        updatedAt: any;
        menuItem: any;
        buyer: any;
        seller: any;
    }>;
    findMyOrders(userId: string, page?: number, limit?: number, status?: PrismaOrderStatus): Promise<{
        data: {
            id: any;
            buyerId: any;
            sellerId: any;
            menuItemId: any;
            status: any;
            note: any;
            scheduledFor: any;
            createdAt: any;
            updatedAt: any;
            menuItem: any;
            buyer: any;
            seller: any;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findIncomingOrders(sellerId: string, page?: number, limit?: number, status?: PrismaOrderStatus): Promise<{
        data: {
            id: any;
            buyerId: any;
            sellerId: any;
            menuItemId: any;
            status: any;
            note: any;
            scheduledFor: any;
            createdAt: any;
            updatedAt: any;
            menuItem: any;
            buyer: any;
            seller: any;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findAllOrders(page?: number, limit?: number, status?: PrismaOrderStatus): Promise<{
        data: {
            id: any;
            buyerId: any;
            sellerId: any;
            menuItemId: any;
            status: any;
            note: any;
            scheduledFor: any;
            createdAt: any;
            updatedAt: any;
            menuItem: any;
            buyer: any;
            seller: any;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    updateStatus(orderId: string, userId: string, userRole: string, status: PrismaOrderStatus): Promise<{
        id: any;
        buyerId: any;
        sellerId: any;
        menuItemId: any;
        status: any;
        note: any;
        scheduledFor: any;
        createdAt: any;
        updatedAt: any;
        menuItem: any;
        buyer: any;
        seller: any;
    }>;
    cancel(orderId: string, userId: string, userRole: string): Promise<{
        id: any;
        buyerId: any;
        sellerId: any;
        menuItemId: any;
        status: any;
        note: any;
        scheduledFor: any;
        createdAt: any;
        updatedAt: any;
        menuItem: any;
        buyer: any;
        seller: any;
    }>;
    private toOrderResponse;
}
