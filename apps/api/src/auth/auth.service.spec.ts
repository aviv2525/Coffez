import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

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
  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
        { provide: ConfigService, useValue: mockConfig },
        { provide: NotificationsService, useValue: mockNotifications },
      ],
    }).compile();
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should throw UnauthorizedException when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(service.login({ email: 'x@y.com', password: 'pass' })).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('register', () => {
    it('should throw ConflictException when email already exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: '1', email: 'x@y.com' });
      await expect(
        service.register({ email: 'x@y.com', password: 'password123', fullName: 'Test' }),
      ).rejects.toThrow(ConflictException);
    });
  });
});
