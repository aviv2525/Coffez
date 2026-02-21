"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const common_1 = require("@nestjs/common");
const orders_service_1 = require("./orders.service");
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
const push_service_1 = require("../push/push.service");
const mockPrisma = {
    order: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
    },
    menuItem: { findUnique: jest.fn() },
    sellerProfile: { findUnique: jest.fn(), findUniqueOrThrow: jest.fn() },
    user: { findUnique: jest.fn() },
};
const mockNotifications = { sendOrderCreatedEmail: jest.fn(), sendOrderStatusChangedEmail: jest.fn() };
const mockPush = { notifySellerNewOrder: jest.fn(), notifyBuyerOrderStatus: jest.fn() };
describe('OrdersService', () => {
    let service;
    beforeEach(async () => {
        jest.clearAllMocks();
        const module = await testing_1.Test.createTestingModule({
            providers: [
                orders_service_1.OrdersService,
                { provide: prisma_service_1.PrismaService, useValue: mockPrisma },
                { provide: notifications_service_1.NotificationsService, useValue: mockNotifications },
                { provide: push_service_1.PushService, useValue: mockPush },
            ],
        }).compile();
        service = module.get(orders_service_1.OrdersService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    describe('updateStatus', () => {
        it('should throw NotFoundException when order does not exist', async () => {
            mockPrisma.order.findUnique.mockResolvedValue(null);
            await expect(service.updateStatus('order-id', 'user-id', 'USER', 'CANCELLED')).rejects.toThrow(common_1.NotFoundException);
        });
        it('should throw ForbiddenException when buyer tries to accept order', async () => {
            mockPrisma.order.findUnique.mockResolvedValue({
                id: 'o1',
                buyerId: 'buyer',
                sellerId: 'seller',
                status: 'PENDING',
                buyer: {},
                seller: {},
                menuItem: {},
            });
            await expect(service.updateStatus('o1', 'buyer', 'USER', 'ACCEPTED')).rejects.toThrow(common_1.ForbiddenException);
        });
    });
});
//# sourceMappingURL=orders.service.spec.js.map