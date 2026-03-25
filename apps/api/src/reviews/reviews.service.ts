import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async getBySellerId(sellerId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { sellerId },
      orderBy: { createdAt: 'desc' },
      include: { buyer: { select: { id: true, fullName: true } } },
    });

    const total = reviews.length;
    const avgRating = total > 0
      ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / total) * 10) / 10
      : null;

    return {
      reviews: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
        buyerId: r.buyer.id,
        buyerName: r.buyer.fullName,
      })),
      avgRating,
      total,
    };
  }

  async upsert(buyerId: string, sellerId: string, rating: number, comment?: string) {
    if (buyerId === sellerId) {
      throw new ForbiddenException('You cannot review yourself');
    }

    const order = await this.prisma.order.findFirst({
      where: { buyerId, sellerId },
    });
    if (!order) {
      throw new ForbiddenException('You can only review sellers you have ordered from');
    }

    return this.prisma.review.upsert({
      where: { sellerId_buyerId: { sellerId, buyerId } },
      create: { sellerId, buyerId, rating, comment: comment ?? null },
      update: { rating, comment: comment ?? null },
    });
  }
}
