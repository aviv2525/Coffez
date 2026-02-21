export type UserRole = 'USER' | 'ADMIN';
export interface User {
    id: string;
    email: string;
    fullName: string;
    role: UserRole;
    emailVerifiedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
export interface SellerProfile {
    userId: string;
    displayName: string;
    bio: string | null;
    categories: string[];
    locationText: string | null;
    avatarUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
}
export type MenuItemAvailability = boolean;
export interface MenuItem {
    id: string;
    sellerId: string;
    title: string;
    description: string | null;
    price: number;
    imageUrl: string | null;
    isAvailable: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export type ProfileMediaType = 'IMAGE' | 'VIDEO';
export interface ProfileMedia {
    id: string;
    sellerId: string;
    type: ProfileMediaType;
    url: string;
    thumbnailUrl: string | null;
    title: string | null;
    caption: string | null;
    sortOrder: number;
    createdAt: Date;
    updatedAt: Date;
}
export type OrderStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';
export interface Order {
    id: string;
    buyerId: string;
    sellerId: string;
    menuItemId: string;
    status: OrderStatus;
    note: string | null;
    scheduledFor: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export interface PaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
