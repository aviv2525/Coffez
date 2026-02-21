import { PrismaService } from '../prisma/prisma.service';
import { SellersService } from '../sellers/sellers.service';
import type { CreateProfileMediaInput, UpdateProfileMediaInput } from '@orderbridge/shared';
export declare class MediaService {
    private readonly prisma;
    private readonly sellers;
    constructor(prisma: PrismaService, sellers: SellersService);
    getBySellerId(sellerId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import("@prisma/client").$Enums.ProfileMediaType;
        sellerId: string;
        title: string | null;
        url: string;
        thumbnailUrl: string | null;
        caption: string | null;
        sortOrder: number;
    }[]>;
    create(sellerId: string, userId: string, input: CreateProfileMediaInput): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import("@prisma/client").$Enums.ProfileMediaType;
        sellerId: string;
        title: string | null;
        url: string;
        thumbnailUrl: string | null;
        caption: string | null;
        sortOrder: number;
    }>;
    update(mediaId: string, userId: string, input: UpdateProfileMediaInput): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import("@prisma/client").$Enums.ProfileMediaType;
        sellerId: string;
        title: string | null;
        url: string;
        thumbnailUrl: string | null;
        caption: string | null;
        sortOrder: number;
    }>;
    delete(mediaId: string, userId: string): Promise<{
        success: boolean;
    }>;
}
