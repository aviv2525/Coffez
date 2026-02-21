import { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { SellersService } from './sellers.service';
import { CreateSellerProfileDto, UpdateSellerProfileDto } from './dto';
export declare class SellersController {
    private readonly sellers;
    constructor(sellers: SellersService);
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
    getMyProfile(user: CurrentUserPayload): Promise<{
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        categories: string[];
        displayName: string;
        bio: string | null;
        locationText: string | null;
        avatarUrl: string | null;
    }>;
    create(user: CurrentUserPayload, dto: CreateSellerProfileDto): Promise<{
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        categories: string[];
        displayName: string;
        bio: string | null;
        locationText: string | null;
        avatarUrl: string | null;
    }>;
    update(user: CurrentUserPayload, dto: UpdateSellerProfileDto): Promise<{
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        categories: string[];
        displayName: string;
        bio: string | null;
        locationText: string | null;
        avatarUrl: string | null;
    }>;
    getById(id: string): Promise<{
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
}
