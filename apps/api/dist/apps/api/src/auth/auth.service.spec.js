"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
const mockPrisma = {
    user: {
        findUnique: jest.fn(),
        create: jest.fn(),
    },
    refreshToken: { create: jest.fn(), delete: jest.fn(), deleteMany: jest.fn(), findFirst: jest.fn() },
    emailVerificationToken: { create: jest.fn(), findUnique: jest.fn(), delete: jest.fn() },
};
const mockJwt = { sign: jest.fn().mockReturnValue('access-token') };
const mockConfig = { get: jest.fn().mockReturnValue('secret') };
const mockNotifications = { sendVerificationEmail: jest.fn(), sendPasswordResetEmail: jest.fn() };
describe('AuthService', () => {
    let service;
    beforeEach(async () => {
        jest.clearAllMocks();
        const module = await testing_1.Test.createTestingModule({
            providers: [
                auth_service_1.AuthService,
                { provide: prisma_service_1.PrismaService, useValue: mockPrisma },
                { provide: jwt_1.JwtService, useValue: mockJwt },
                { provide: config_1.ConfigService, useValue: mockConfig },
                { provide: notifications_service_1.NotificationsService, useValue: mockNotifications },
            ],
        }).compile();
        service = module.get(auth_service_1.AuthService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    describe('login', () => {
        it('should throw UnauthorizedException when user not found', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(null);
            await expect(service.login({ email: 'x@y.com', password: 'pass' })).rejects.toThrow(common_1.UnauthorizedException);
        });
    });
    describe('register', () => {
        it('should throw ConflictException when email already exists', async () => {
            mockPrisma.user.findUnique.mockResolvedValue({ id: '1', email: 'x@y.com' });
            await expect(service.register({ email: 'x@y.com', password: 'password123', fullName: 'Test' })).rejects.toThrow(common_1.ConflictException);
        });
    });
});
//# sourceMappingURL=auth.service.spec.js.map