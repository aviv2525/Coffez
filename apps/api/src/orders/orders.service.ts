import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PushService } from '../push/push.service';
import type { CreateOrderInput, OrderStatus } from '@orderbridge/shared';
import { OrderStatus as PrismaOrderStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly push: PushService,
  ) {}

  async create(buyerId: string, input: CreateOrderInput) {
    const menuItem = await this.prisma.menuItem.findUnique({
      where: { id: input.menuItemId },
      include: { seller: { include: { user: true } } },
    });
    if (!menuItem) throw new NotFoundException('Menu item not found');
    if (menuItem.sellerId !== input.sellerId)
      throw new BadRequestException('Menu item does not belong to this seller');
    if (!menuItem.isAvailable) throw new BadRequestException('Menu item is not available');

    const sellerUser = await this.prisma.user.findUnique({
      where: { id: menuItem.sellerId },
    });
    const buyer = await this.prisma.user.findUnique({
      where: { id: buyerId },
    });
    if (!sellerUser || !buyer) throw new NotFoundException('User not found');

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

    await this.notifications.sendOrderCreatedEmail(
      sellerUser.email,
      (menuItem.seller as any).displayName ?? sellerUser.fullName,
      order.id,
      buyer.fullName,
    );
    await this.push.notifySellerNewOrder(input.sellerId, order.id, buyer.fullName);

    return this.toOrderResponse(order);
  }

  async findMyOrders(userId: string, page = 1, limit = 20, status?: PrismaOrderStatus) {
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

  async findIncomingOrders(sellerId: string, page = 1, limit = 20, status?: PrismaOrderStatus) {
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

  async findAllOrders(page = 1, limit = 20, status?: PrismaOrderStatus) {
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

  async updateStatus(orderId: string, userId: string, userRole: string, status: PrismaOrderStatus) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        buyer: true,
        seller: true,
        menuItem: true,
      },
    });
    if (!order) throw new NotFoundException('Order not found');

    const isSeller = order.sellerId === userId;
    const isBuyer = order.buyerId === userId;
    const isAdmin = userRole === 'ADMIN';

    if (status === 'CANCELLED') {
      if (!isBuyer && !isAdmin) throw new ForbiddenException('Only buyer can cancel');
      if (order.status !== 'PENDING') throw new BadRequestException('Only PENDING orders can be cancelled');
    } else if (['ACCEPTED', 'REJECTED'].includes(status)) {
      if (!isSeller && !isAdmin) throw new ForbiddenException('Only seller can accept/reject');
      if (order.status !== 'PENDING') throw new BadRequestException('Only PENDING orders can be accepted/rejected');
    } else if (status === 'COMPLETED') {
      if (!isSeller && !isAdmin) throw new ForbiddenException('Only seller can complete');
      if (order.status !== 'ACCEPTED') throw new BadRequestException('Only ACCEPTED orders can be completed');
    } else {
      throw new BadRequestException('Invalid status');
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: { menuItem: true, buyer: true, seller: true },
    });

    await this.notifications.sendOrderStatusChangedEmail(
      order.buyer.email,
      order.buyer.fullName,
      order.id,
      status,
    );
    await this.push.notifyBuyerOrderStatus(order.buyerId, order.id, status);

    return this.toOrderResponse(updated);
  }

  async cancel(orderId: string, userId: string, userRole: string) {
    return this.updateStatus(orderId, userId, userRole, 'CANCELLED');
  }

  private toOrderResponse(order: any) {
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
}
