import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, VerifyEmailDto, RequestPasswordResetDto, ResetPasswordDto } from './dto';
export declare class AuthController {
    private readonly auth;
    constructor(auth: AuthService);
    register(dto: RegisterDto, res: Response): Promise<{
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
    } | {
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
        expiresAt: Date;
    }>;
    login(dto: LoginDto, req: Request, res: Response): Promise<{
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
        expiresAt: Date;
    }>;
    refresh(req: Request, res: Response): Promise<{
        accessToken: string;
        expiresAt: Date;
    }>;
    logout(req: Request, res: Response): Promise<{
        success: boolean;
    }>;
    verifyEmail(dto: VerifyEmailDto): Promise<{
        success: boolean;
    }>;
    requestPasswordReset(dto: RequestPasswordResetDto): Promise<{
        success: boolean;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        success: boolean;
    }>;
}
