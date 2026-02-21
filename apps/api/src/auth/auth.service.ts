import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import type {
  RegisterInput,
  LoginInput,
  VerifyEmailInput,
  RequestPasswordResetInput,
  ResetPasswordInput,
} from '@orderbridge/shared';

const REFRESH_EXPIRY_DAYS = 7;
const EMAIL_VERIFICATION_EXPIRY_HOURS = 24;
const PASSWORD_RESET_EXPIRY_HOURS = 1;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly notifications: NotificationsService,
  ) {}

  async register(input: RegisterInput) {
    const existing = await this.prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await argon2.hash(input.password);
    const user = await this.prisma.user.create({
      data: {
        email: input.email.toLowerCase(),
        passwordHash,
        fullName: input.fullName,
        role: 'USER',
      },
    });

    const token = randomBytes(32).toString('hex');
    await this.prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + EMAIL_VERIFICATION_EXPIRY_HOURS * 60 * 60 * 1000),
      },
    });

    await this.notifications.sendVerificationEmail(user.email, user.fullName, token);
    // Optionally auto-login: return tokens so user can use app while verifying
    const accessToken = this.signAccessToken(user);
    const { refreshToken: newRefresh, refreshExpiry } = await this.createRefreshToken(user.id);
    return { user: this.userResponse(user), accessToken, refreshToken: newRefresh, expiresAt: refreshExpiry };
  }

  async login(input: LoginInput, refreshToken?: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });
    if (!user || !(await argon2.verify(user.passwordHash, input.password))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const accessToken = this.signAccessToken(user);
    const { refreshToken: newRefresh, refreshExpiry } = await this.rotateRefreshToken(
      user.id,
      refreshToken,
    );
    return {
      user: this.userResponse(user),
      accessToken,
      refreshToken: newRefresh,
      expiresAt: refreshExpiry,
    };
  }

  async refresh(refreshToken: string) {
    if (!refreshToken) throw new UnauthorizedException('Refresh token required');
    const hash = await this.hashRefreshToken(refreshToken);
    const stored = await this.prisma.refreshToken.findFirst({
      where: { tokenHash: hash },
      include: { user: true },
    });
    if (!stored || stored.expiresAt < new Date()) {
      if (stored) await this.prisma.refreshToken.delete({ where: { id: stored.id } }).catch(() => {});
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    await this.prisma.refreshToken.delete({ where: { id: stored.id } });
    const { refreshToken: newRefresh, refreshExpiry } = await this.createRefreshToken(stored.userId);
    const accessToken = this.signAccessToken(stored.user);
    return {
      accessToken,
      refreshToken: newRefresh,
      expiresAt: refreshExpiry,
    };
  }

  async logout(refreshToken: string | undefined) {
    if (refreshToken) {
      const hash = await this.hashRefreshToken(refreshToken);
      await this.prisma.refreshToken.deleteMany({ where: { tokenHash: hash } });
    }
    return { success: true };
  }

  async verifyEmail(input: VerifyEmailInput) {
    const record = await this.prisma.emailVerificationToken.findUnique({
      where: { token: input.token },
      include: { user: true },
    });
    if (!record || record.expiresAt < new Date())
      throw new BadRequestException('Invalid or expired verification token');

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: record.userId },
        data: { emailVerifiedAt: new Date() },
      }),
      this.prisma.emailVerificationToken.delete({ where: { id: record.id } }),
    ]);
    return { success: true };
  }

  async requestPasswordReset(input: RequestPasswordResetInput) {
    const user = await this.prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });
    if (!user) return { success: true }; // no leak

    const token = randomBytes(32).toString('hex');
    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + PASSWORD_RESET_EXPIRY_HOURS * 60 * 60 * 1000),
      },
    });
    await this.notifications.sendPasswordResetEmail(user.email, user.fullName, token);
    return { success: true };
  }

  async resetPassword(input: ResetPasswordInput) {
    const record = await this.prisma.passwordResetToken.findUnique({
      where: { token: input.token },
      include: { user: true },
    });
    if (!record || record.expiresAt < new Date())
      throw new BadRequestException('Invalid or expired reset token');

    const passwordHash = await argon2.hash(input.newPassword);
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: record.userId },
        data: { passwordHash },
      }),
      this.prisma.passwordResetToken.delete({ where: { id: record.id } }),
    ]);
    return { success: true };
  }

  async revokeAllRefreshTokensForUser(userId: string) {
    await this.prisma.refreshToken.deleteMany({ where: { userId } });
    return { success: true };
  }

  private signAccessToken(user: User) {
    return this.jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      { expiresIn: this.config.get('JWT_ACCESS_EXPIRES', '15m') },
    );
  }

  private async hashRefreshToken(token: string) {
    return argon2.hash(token, { type: argon2.argon2id });
  }

  private async createRefreshToken(userId: string) {
    const raw = randomBytes(48).toString('hex');
    const tokenHash = await this.hashRefreshToken(raw);
    const expiresAt = new Date(Date.now() + REFRESH_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
    await this.prisma.refreshToken.create({
      data: { userId, tokenHash, expiresAt },
    });
    return { refreshToken: raw, refreshExpiry: expiresAt };
  }

  private async rotateRefreshToken(userId: string, previousToken?: string) {
    if (previousToken) {
      const hash = await this.hashRefreshToken(previousToken);
      await this.prisma.refreshToken.deleteMany({ where: { userId, tokenHash: hash } });
    }
    return this.createRefreshToken(userId);
  }

  private userResponse(user: User) {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      emailVerifiedAt: user.emailVerifiedAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
