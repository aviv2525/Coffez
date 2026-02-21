import { PrismaService } from '../prisma/prisma.service';
import type { CreateSellerProfileInput, UpdateSellerProfileInput } from '@orderbridge/shared';
export declare class SellersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(page?: number, limit?: number, category?: string): Promise<{
        data: {
            userId: any;
            displayName: any;
            bio: any;
            categories: any;
            locationText: any;
            avatarUrl: any;
            createdAt: any;
            updatedAt: any;
            user: {
                id: any;
                fullName: any;
            } | undefined;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getById(sellerId: string): Promise<{
        userId: any;
        displayName: any;
        bio: any;
        categories: any;
        locationText: any;
        avatarUrl: any;
        createdAt: any;
        updatedAt: any;
        user: {
            id: any;
            fullName: any;
        } | undefined;
    }>;
    getMyProfile(userId: string): Promise<{
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        categories: string[];
        displayName: string;
        bio: string | null;
        locationText: string | null;
        avatarUrl: string | null;
    }>;
    create(userId: string, input: CreateSellerProfileInput): Promise<{
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        categories: string[];
        displayName: string;
        bio: string | null;
        locationText: string | null;
        avatarUrl: string | null;
    }>;
    update(userId: string, input: UpdateSellerProfileInput): Promise<{
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        categories: string[];
        displayName: string;
        bio: string | null;
        locationText: string | null;
        avatarUrl: string | null;
    }>;
    ensureOwnership(ownerId: string, sellerId: string): Promise<void>;
    private toPublicSeller;
}
