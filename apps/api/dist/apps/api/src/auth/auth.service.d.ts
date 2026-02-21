import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import type { RegisterInput, LoginInput, VerifyEmailInput, RequestPasswordResetInput, ResetPasswordInput } from '@orderbridge/shared';
export declare class AuthService {
    private readonly prisma;
    private readonly jwt;
    private readonly config;
    private readonly notifications;
    constructor(prisma: PrismaService, jwt: JwtService, config: ConfigService, notifications: NotificationsService);
    register(input: RegisterInput): Promise<{
        user: {
            id: string;
            email: string;
            fullName: string;
            role: import("@prisma/client").$Enums.UserRole;
            emailVerifiedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        };
        accessToken: string;
        refreshToken: string;
        expiresAt: Date;
    }>;
    login(input: LoginInput, refreshToken?: string): Promise<{
        user: {
            id: string;
            email: string;
            fullName: string;
            role: import("@prisma/client").$Enums.UserRole;
            emailVerifiedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        };
        accessToken: string;
        refreshToken: string;
        expiresAt: Date;
    }>;
    refresh(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
        expiresAt: Date;
    }>;
    logout(refreshToken: string | undefined): Promise<{
        success: boolean;
    }>;
    verifyEmail(input: VerifyEmailInput): Promise<{
        success: boolean;
    }>;
    requestPasswordReset(input: RequestPasswordResetInput): Promise<{
        success: boolean;
    }>;
    resetPassword(input: ResetPasswordInput): Promise<{
        success: boolean;
    }>;
    revokeAllRefreshTokensForUser(userId: string): Promise<{
        success: boolean;
    }>;
    private signAccessToken;
    private hashRefreshToken;
    private createRefreshToken;
    private rotateRefreshToken;
    private userResponse;
}
