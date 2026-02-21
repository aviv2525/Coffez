import { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto';
import { OrderStatus } from '@prisma/client';
export declare class OrdersController {
    private readonly orders;
    constructor(orders: OrdersService);
    create(user: CurrentUserPayload, dto: CreateOrderDto): Promise<{
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
    findAllOrders(page?: number, limit?: number, status?: OrderStatus): Promise<{
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
    findMyOrders(user: CurrentUserPayload, page?: number, limit?: number, status?: OrderStatus): Promise<{
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
    findIncomingOrders(user: CurrentUserPayload, page?: number, limit?: number, status?: OrderStatus): Promise<{
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
    updateStatus(user: CurrentUserPayload, orderId: string, dto: UpdateOrderStatusDto): Promise<{
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
    cancel(user: CurrentUserPayload, orderId: string): Promise<{
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
}
