import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SellersService } from '../sellers/sellers.service';
import type { CreateMenuItemInput, UpdateMenuItemInput } from '@orderbridge/shared';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class MenuService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sellers: SellersService,
  ) {}

  async getBySellerId(sellerId: string) {
    await this.sellers.getById(sellerId);
    const items = await this.prisma.menuItem.findMany({
      where: { sellerId },
      orderBy: { createdAt: 'desc' },
    });
    return items.map((i) => ({ ...i, price: Number(i.price) }));
  }

  async create(sellerId: string, userId: string, input: CreateMenuItemInput) {
    await this.sellers.ensureOwnership(userId, sellerId);
    return this.prisma.menuItem.create({
      data: {
        sellerId,
        title: input.title,
        description: input.description ?? null,
        price: new Decimal(input.price),
        imageUrl: input.imageUrl ?? null,
        isAvailable: input.isAvailable ?? true,
      },
    }).then((i) => ({ ...i, price: Number(i.price) }));
  }

  async update(menuItemId: string, userId: string, input: UpdateMenuItemInput) {
    const item = await this.prisma.menuItem.findUnique({ where: { id: menuItemId } });
    if (!item) throw new NotFoundException('Menu item not found');
    await this.sellers.ensureOwnership(userId, item.sellerId);
    return this.prisma.menuItem.update({
      where: { id: menuItemId },
      data: {
        ...(input.title !== undefined && { title: input.title }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.price !== undefined && { price: new Decimal(input.price) }),
        ...(input.imageUrl !== undefined && { imageUrl: input.imageUrl }),
        ...(input.isAvailable !== undefined && { isAvailable: input.isAvailable }),
      },
    }).then((i) => ({ ...i, price: Number(i.price) }));
  }

  async delete(menuItemId: string, userId: string) {
    const item = await this.prisma.menuItem.findUnique({ where: { id: menuItemId } });
    if (!item) throw new NotFoundException('Menu item not found');
    await this.sellers.ensureOwnership(userId, item.sellerId);
    await this.prisma.menuItem.delete({ where: { id: menuItemId } });
    return { success: true };
  }

  async setAvailability(menuItemId: string, userId: string, isAvailable: boolean) {
    const item = await this.prisma.menuItem.findUnique({ where: { id: menuItemId } });
    if (!item) throw new NotFoundException('Menu item not found');
    await this.sellers.ensureOwnership(userId, item.sellerId);
    return this.prisma.menuItem.update({
      where: { id: menuItemId },
      data: { isAvailable },
    }).then((i) => ({ ...i, price: Number(i.price) }));
  }
}
