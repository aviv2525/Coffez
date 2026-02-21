import { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { MenuService } from './menu.service';
import { CreateMenuItemDto, UpdateMenuItemDto, SetAvailabilityDto } from './dto';
export declare class MenuController {
    private readonly menu;
    constructor(menu: MenuService);
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
    create(user: CurrentUserPayload, dto: CreateMenuItemDto): Promise<{
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
    update(user: CurrentUserPayload, id: string, dto: UpdateMenuItemDto): Promise<{
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
    delete(user: CurrentUserPayload, id: string): Promise<{
        success: boolean;
    }>;
    setAvailability(user: CurrentUserPayload, id: string, dto: SetAvailabilityDto): Promise<{
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
