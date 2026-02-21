import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateSellerProfileInput, UpdateSellerProfileInput } from '@orderbridge/shared';

@Injectable()
export class SellersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(page = 1, limit = 20, category?: string) {
    const skip = (page - 1) * limit;
    const where = category
      ? { categories: { has: category } }
      : {};
    const [data, total] = await Promise.all([
      this.prisma.sellerProfile.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          user: {
            select: { id: true, fullName: true, email: true },
          },
        },
      }),
      this.prisma.sellerProfile.count({ where }),
    ]);
    return {
      data: data.map((s) => this.toPublicSeller(s)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getById(sellerId: string) {
    const seller = await this.prisma.sellerProfile.findUnique({
      where: { userId: sellerId },
      include: {
        user: { select: { id: true, fullName: true } },
      },
    });
    if (!seller) throw new NotFoundException('Seller not found');
    return this.toPublicSeller(seller);
  }

  async getMyProfile(userId: string) {
    const seller = await this.prisma.sellerProfile.findUnique({
      where: { userId },
    });
    if (!seller) throw new NotFoundException('Seller profile not found');
    return seller;
  }

  async create(userId: string, input: CreateSellerProfileInput) {
    const existing = await this.prisma.sellerProfile.findUnique({
      where: { userId },
    });
    if (existing) throw new ForbiddenException('Seller profile already exists');

    return this.prisma.sellerProfile.create({
      data: {
        userId,
        displayName: input.displayName,
        bio: input.bio ?? null,
        categories: input.categories ?? [],
        locationText: input.locationText ?? null,
        avatarUrl: input.avatarUrl ?? null,
      },
    });
  }

  async update(userId: string, input: UpdateSellerProfileInput) {
    await this.ensureOwnership(userId, userId);
    return this.prisma.sellerProfile.update({
      where: { userId },
      data: {
        ...(input.displayName !== undefined && { displayName: input.displayName }),
        ...(input.bio !== undefined && { bio: input.bio }),
        ...(input.categories !== undefined && { categories: input.categories }),
        ...(input.locationText !== undefined && { locationText: input.locationText }),
        ...(input.avatarUrl !== undefined && { avatarUrl: input.avatarUrl }),
      },
    });
  }

  async ensureOwnership(ownerId: string, sellerId: string) {
    if (ownerId !== sellerId) throw new ForbiddenException('Not allowed to modify this seller');
  }

  private toPublicSeller(seller: any) {
    return {
      userId: seller.userId,
      displayName: seller.displayName,
      bio: seller.bio,
      categories: seller.categories,
      locationText: seller.locationText,
      avatarUrl: seller.avatarUrl,
      createdAt: seller.createdAt,
      updatedAt: seller.updatedAt,
      user: seller.user ? { id: seller.user.id, fullName: seller.user.fullName } : undefined,
    };
  }
}
