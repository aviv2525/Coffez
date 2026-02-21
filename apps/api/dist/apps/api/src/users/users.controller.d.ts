import { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { UsersService } from './users.service';
export declare class UsersController {
    private readonly users;
    constructor(users: UsersService);
    me(user: CurrentUserPayload): Promise<{
        id: string;
        email: string;
        fullName: string;
        role: import("@prisma/client").$Enums.UserRole;
        emailVerifiedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
