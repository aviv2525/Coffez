import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import type { CreateSellerProfileInput, UpdateSellerProfileInput } from '@orderbridge/shared';

type SellerProfileCreateData = Omit<Prisma.SellerProfileUncheckedCreateInput, 'status' | 'tier'> & {
  beans?: string[];
  drinkTypes?: string[];
  machineType?: string | null;
  openingHours?: string | null;
  status?: string;
  tier?: string;
  phone?: string | null;
  city?: string | null;
  street?: string | null;
  applicationNotes?: string | null;
};

@Injectable()
export class SellersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  async list(page = 1, limit = 20, category?: string) {
    const skip = (page - 1) * limit;
    const where: any = { status: 'APPROVED', ...(category ? { categories: { has: category } } : {}) };

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
          media: {
            take: 1,
            orderBy: { sortOrder: 'asc' },
            select: { id: true, type: true, url: true, thumbnailUrl: true },
          },
          reviews: { select: { rating: true } },
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
        media: { orderBy: { sortOrder: 'asc' } },
      },
    });

    if (!seller) throw new NotFoundException('Seller not found');
    return this.toPublicSellerDetail(seller);
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
    if (existing) {
      if ((existing as any).status === 'REJECTED') {
        await this.prisma.sellerProfile.delete({ where: { userId } });
      } else {
        throw new ForbiddenException('Seller profile already exists');
      }
    }

    const data: SellerProfileCreateData = {
      userId,
      displayName: input.displayName,
      bio: input.bio ?? null,
      categories: input.categories ?? [],
      locationText: input.locationText ?? null,
      avatarUrl: input.avatarUrl ?? null,
      beans: input.beans ?? [],
      drinkTypes: input.drinkTypes ?? [],
      machineType: input.machineType ?? null,
      openingHours: input.openingHours ?? null,
      lat: input.lat ?? null,
      lng: input.lng ?? null,
      pickupDetails: input.pickupDetails ?? null,
      webhookUrl: (input as any).webhookUrl ?? null,
      tipBit: (input as any).tipBit ?? null,
      tipPaypal: (input as any).tipPaypal ?? null,
      status: 'PENDING',
      tier: (input as any).tier ?? 'HOME',
      phone: (input as any).phone ?? null,
      city: (input as any).city ?? null,
      street: (input as any).street ?? null,
    };
    const profile = await this.prisma.sellerProfile.create({ data });
    await this.notifications.sendSellerApplicationEmail(userId, input.displayName, (input as any).tier ?? 'HOME', {
      phone: (input as any).phone,
      city: (input as any).city,
      street: (input as any).street,
      notes: (input as any).applicationNotes,
    });
    return profile;
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
        ...(input.beans !== undefined && { beans: input.beans }),
        ...(input.drinkTypes !== undefined && { drinkTypes: input.drinkTypes }),
        ...(input.machineType !== undefined && { machineType: input.machineType }),
        ...(input.openingHours !== undefined && { openingHours: input.openingHours }),
        ...(input.lat !== undefined && { lat: input.lat }),
        ...(input.lng !== undefined && { lng: input.lng }),
        ...(input.pickupDetails !== undefined && { pickupDetails: input.pickupDetails }),
        ...((input as any).webhookUrl !== undefined && { webhookUrl: (input as any).webhookUrl }),
        ...((input as any).tipBit !== undefined && { tipBit: (input as any).tipBit }),
        ...((input as any).tipPaypal !== undefined && { tipPaypal: (input as any).tipPaypal }),
        ...((input as any).milkOptions !== undefined && { milkOptions: (input as any).milkOptions }),
      },
    });
  }

  async approve(userId: string) {
    return this.prisma.sellerProfile.update({
      where: { userId },
      data: { status: 'APPROVED' } as any,
    });
  }

  async setOnline(userId: string, isOnline: boolean) {
    return this.prisma.sellerProfile.update({
      where: { userId },
      data: { isOnline },
    });
  }

  async ensureOwnership(ownerId: string, sellerId: string) {
    if (ownerId !== sellerId) throw new ForbiddenException('Not allowed to modify this seller');
  }

  private toPublicSeller(seller: any) {
    const firstMedia = seller.media?.[0];
    const reviewCount = seller.reviews?.length ?? 0;
    const avgRating = reviewCount > 0
      ? Math.round((seller.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviewCount) * 10) / 10
      : null;
    return {
      userId: seller.userId,
      displayName: seller.displayName,
      bio: seller.bio,
      categories: seller.categories,
      locationText: seller.locationText,
      avatarUrl: seller.avatarUrl,
      beans: seller.beans ?? [],
      drinkTypes: seller.drinkTypes ?? [],
      machineType: seller.machineType ?? null,
      openingHours: seller.openingHours ?? null,
      lat: seller.lat ?? null,
      lng: seller.lng ?? null,
      pickupDetails: seller.pickupDetails ?? null,
      isOnline: seller.isOnline ?? false,
      status: seller.status ?? 'PENDING',
      tier: seller.tier ?? 'HOME',
      tipBit: seller.tipBit ?? null,
      tipPaypal: seller.tipPaypal ?? null,
      milkOptions: seller.milkOptions ?? [],
      coverMedia: firstMedia ? { id: firstMedia.id, type: firstMedia.type, url: firstMedia.url, thumbnailUrl: firstMedia.thumbnailUrl } : null,
      avgRating,
      reviewCount,
      createdAt: seller.createdAt,
      updatedAt: seller.updatedAt,
      user: seller.user ? { id: seller.user.id, fullName: seller.user.fullName } : undefined,
    };
  }

  private toPublicSellerDetail(seller: any) {
    return {
      ...this.toPublicSeller({ ...seller, media: seller.media ? [seller.media[0]] : [] }),
      media: (seller.media ?? []).map((m: any) => ({
        id: m.id,
        type: m.type,
        url: m.url,
        thumbnailUrl: m.thumbnailUrl,
        title: m.title,
        caption: m.caption,
      })),
    };
  }
}