import { PrismaService } from '../prisma/prisma.service';
import { SellersService } from '../sellers/sellers.service';
import type { CreateMenuItemInput, UpdateMenuItemInput } from '@orderbridge/shared';
export declare class MenuService {
    private readonly prisma;
    private readonly sellers;
    constructor(prisma: PrismaService, sellers: SellersService);
    getBySellerId(sellerId: string): Promise<{
        price: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        sellerId: string;
        title: string;
        description: string | null;
        imageUrl: string | null;
        isAvailable: boolean;
    }[]>;
    create(sellerId: string, userId: string, input: CreateMenuItemInput): Promise<{
        price: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        sellerId: string;
        title: string;
        description: string | null;
        imageUrl: string | null;
        isAvailable: boolean;
    }>;
    update(menuItemId: string, userId: string, input: UpdateMenuItemInput): Promise<{
        price: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        sellerId: string;
        title: string;
        description: string | null;
        imageUrl: string | null;
        isAvailable: boolean;
    }>;
    delete(menuItemId: string, userId: string): Promise<{
        success: boolean;
    }>;
    setAvailability(menuItemId: string, userId: string, isAvailable: boolean): Promise<{
        price: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        sellerId: string;
        title: string;
        description: string | null;
        imageUrl: string | null;
        isAvailable: boolean;
    }>;
}
