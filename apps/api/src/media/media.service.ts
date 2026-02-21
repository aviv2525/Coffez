import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SellersService } from '../sellers/sellers.service';
import type { CreateProfileMediaInput, UpdateProfileMediaInput } from '@orderbridge/shared';
import { ProfileMediaType } from '@prisma/client';

const MAX_MEDIA_PER_SELLER = 20;

@Injectable()
export class MediaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sellers: SellersService,
  ) {}

  async getBySellerId(sellerId: string) {
    await this.sellers.getById(sellerId);
    return this.prisma.profileMedia.findMany({
      where: { sellerId },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async create(sellerId: string, userId: string, input: CreateProfileMediaInput) {
    await this.sellers.ensureOwnership(userId, sellerId);
    const count = await this.prisma.profileMedia.count({ where: { sellerId } });
    if (count >= MAX_MEDIA_PER_SELLER)
      throw new ForbiddenException(`Maximum ${MAX_MEDIA_PER_SELLER} media items allowed`);
    return this.prisma.profileMedia.create({
      data: {
        sellerId,
        type: input.type as ProfileMediaType,
        url: input.url,
        thumbnailUrl: input.thumbnailUrl ?? null,
        title: input.title ?? null,
        caption: input.caption ?? null,
        sortOrder: input.sortOrder ?? 0,
      },
    });
  }

  async update(mediaId: string, userId: string, input: UpdateProfileMediaInput) {
    const media = await this.prisma.profileMedia.findUnique({ where: { id: mediaId } });
    if (!media) throw new NotFoundException('Media not found');
    await this.sellers.ensureOwnership(userId, media.sellerId);
    return this.prisma.profileMedia.update({
      where: { id: mediaId },
      data: {
        ...(input.type !== undefined && { type: input.type as ProfileMediaType }),
        ...(input.url !== undefined && { url: input.url }),
        ...(input.thumbnailUrl !== undefined && { thumbnailUrl: input.thumbnailUrl }),
        ...(input.title !== undefined && { title: input.title }),
        ...(input.caption !== undefined && { caption: input.caption }),
        ...(input.sortOrder !== undefined && { sortOrder: input.sortOrder }),
      },
    });
  }

  async delete(mediaId: string, userId: string) {
    const media = await this.prisma.profileMedia.findUnique({ where: { id: mediaId } });
    if (!media) throw new NotFoundException('Media not found');
    await this.sellers.ensureOwnership(userId, media.sellerId);
    await this.prisma.profileMedia.delete({ where: { id: mediaId } });
    return { success: true };
  }
}
