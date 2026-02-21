import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PushService } from '../push/push.service';

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
  let service: OrdersService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: NotificationsService, useValue: mockNotifications },
        { provide: PushService, useValue: mockPush },
      ],
    }).compile();
    service = module.get<OrdersService>(OrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('updateStatus', () => {
    it('should throw NotFoundException when order does not exist', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(null);
      await expect(
        service.updateStatus('order-id', 'user-id', 'USER', 'CANCELLED'),
      ).rejects.toThrow(NotFoundException);
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
      await expect(
        service.updateStatus('o1', 'buyer', 'USER', 'ACCEPTED'),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
