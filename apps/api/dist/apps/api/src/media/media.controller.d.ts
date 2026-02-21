import { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { MediaService } from './media.service';
import { CreateProfileMediaDto, UpdateProfileMediaDto } from './dto';
export declare class MediaController {
    private readonly media;
    constructor(media: MediaService);
    getBySellerId(sellerId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        sellerId: string;
        title: string | null;
        type: import("@prisma/client").$Enums.ProfileMediaType;
        url: string;
        thumbnailUrl: string | null;
        caption: string | null;
        sortOrder: number;
    }[]>;
    create(user: CurrentUserPayload, dto: CreateProfileMediaDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        sellerId: string;
        title: string | null;
        type: import("@prisma/client").$Enums.ProfileMediaType;
        url: string;
        thumbnailUrl: string | null;
        caption: string | null;
        sortOrder: number;
    }>;
    update(user: CurrentUserPayload, mediaId: string, dto: UpdateProfileMediaDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        sellerId: string;
        title: string | null;
        type: import("@prisma/client").$Enums.ProfileMediaType;
        url: string;
        thumbnailUrl: string | null;
        caption: string | null;
        sortOrder: number;
    }>;
    delete(user: CurrentUserPayload, mediaId: string): Promise<{
        success: boolean;
    }>;
}
