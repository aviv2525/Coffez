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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
const push_service_1 = require("../push/push.service");
let OrdersService = class OrdersService {
    constructor(prisma, notifications, push) {
        this.prisma = prisma;
        this.notifications = notifications;
        this.push = push;
    }
    async create(buyerId, input) {
        const menuItem = await this.prisma.menuItem.findUnique({
            where: { id: input.menuItemId },
            include: { seller: { include: { user: true } } },
        });
        if (!menuItem)
            throw new common_1.NotFoundException('Menu item not found');
        if (menuItem.sellerId !== input.sellerId)
            throw new common_1.BadRequestException('Menu item does not belong to this seller');
        if (!menuItem.isAvailable)
            throw new common_1.BadRequestException('Menu item is not available');
        const sellerUser = await this.prisma.user.findUnique({
            where: { id: menuItem.sellerId },
        });
        const buyer = await this.prisma.user.findUnique({
            where: { id: buyerId },
        });
        if (!sellerUser || !buyer)
            throw new common_1.NotFoundException('User not found');
        const scheduledFor = input.scheduledFor ? new Date(input.scheduledFor) : null;
        const order = await this.prisma.order.create({
            data: {
                buyerId,
                sellerId: input.sellerId,
                menuItemId: input.menuItemId,
                status: 'PENDING',
                note: input.note ?? null,
                scheduledFor,
            },
            include: {
                menuItem: true,
                buyer: { select: { id: true, fullName: true, email: true } },
                seller: { include: { user: { select: { email: true } } } },
            },
        });
        await this.notifications.sendOrderCreatedEmail(sellerUser.email, menuItem.seller.displayName ?? sellerUser.fullName, order.id, buyer.fullName);
        await this.push.notifySellerNewOrder(input.sellerId, order.id, buyer.fullName);
        return this.toOrderResponse(order);
    }
    async findMyOrders(userId, page = 1, limit = 20, status) {
        const skip = (page - 1) * limit;
        const where = { buyerId: userId, ...(status && { status }) };
        const [data, total] = await Promise.all([
            this.prisma.order.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: { menuItem: true, seller: true },
            }),
            this.prisma.order.count({ where }),
        ]);
        return {
            data: data.map((o) => this.toOrderResponse(o)),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findIncomingOrders(sellerId, page = 1, limit = 20, status) {
        await this.prisma.sellerProfile.findUniqueOrThrow({ where: { userId: sellerId } });
        const skip = (page - 1) * limit;
        const where = { sellerId, ...(status && { status }) };
        const [data, total] = await Promise.all([
            this.prisma.order.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: { menuItem: true, buyer: { select: { id: true, fullName: true, email: true } } },
            }),
            this.prisma.order.count({ where }),
        ]);
        return {
            data: data.map((o) => this.toOrderResponse(o)),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findAllOrders(page = 1, limit = 20, status) {
        const skip = (page - 1) * limit;
        const where = status ? { status } : {};
        const [data, total] = await Promise.all([
            this.prisma.order.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: { menuItem: true, buyer: true, seller: true },
            }),
            this.prisma.order.count({ where }),
        ]);
        return {
            data: data.map((o) => this.toOrderResponse(o)),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async updateStatus(orderId, userId, userRole, status) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: {
                buyer: true,
                seller: true,
                menuItem: true,
            },
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        const isSeller = order.sellerId === userId;
        const isBuyer = order.buyerId === userId;
        const isAdmin = userRole === 'ADMIN';
        if (status === 'CANCELLED') {
            if (!isBuyer && !isAdmin)
                throw new common_1.ForbiddenException('Only buyer can cancel');
            if (order.status !== 'PENDING')
                throw new common_1.BadRequestException('Only PENDING orders can be cancelled');
        }
        else if (['ACCEPTED', 'REJECTED'].includes(status)) {
            if (!isSeller && !isAdmin)
                throw new common_1.ForbiddenException('Only seller can accept/reject');
            if (order.status !== 'PENDING')
                throw new common_1.BadRequestException('Only PENDING orders can be accepted/rejected');
        }
        else if (status === 'COMPLETED') {
            if (!isSeller && !isAdmin)
                throw new common_1.ForbiddenException('Only seller can complete');
            if (order.status !== 'ACCEPTED')
                throw new common_1.BadRequestException('Only ACCEPTED orders can be completed');
        }
        else {
            throw new common_1.BadRequestException('Invalid status');
        }
        const updated = await this.prisma.order.update({
            where: { id: orderId },
            data: { status },
            include: { menuItem: true, buyer: true, seller: true },
        });
        await this.notifications.sendOrderStatusChangedEmail(order.buyer.email, order.buyer.fullName, order.id, status);
        await this.push.notifyBuyerOrderStatus(order.buyerId, order.id, status);
        return this.toOrderResponse(updated);
    }
    async cancel(orderId, userId, userRole) {
        return this.updateStatus(orderId, userId, userRole, 'CANCELLED');
    }
    toOrderResponse(order) {
        return {
            id: order.id,
            buyerId: order.buyerId,
            sellerId: order.sellerId,
            menuItemId: order.menuItemId,
            status: order.status,
            note: order.note,
            scheduledFor: order.scheduledFor,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
            menuItem: order.menuItem ? { ...order.menuItem, price: Number(order.menuItem.price) } : undefined,
            buyer: order.buyer,
            seller: order.seller,
        };
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService,
        push_service_1.PushService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map