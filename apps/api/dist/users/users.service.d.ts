import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findById(id: string): Promise<{
        id: string;
        email: string;
        fullName: string;
        role: import("@prisma/client").$Enums.UserRole;
        emailVerifiedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findByEmail(email: string): Promise<{
        id: string;
        email: string;
        passwordHash: string;
        fullName: string;
        role: import("@prisma/client").$Enums.UserRole;
        emailVerifiedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
}
