"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const argon2 = require("argon2");
const crypto_1 = require("crypto");
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
const REFRESH_EXPIRY_DAYS = 7;
const EMAIL_VERIFICATION_EXPIRY_HOURS = 24;
const PASSWORD_RESET_EXPIRY_HOURS = 1;
let AuthService = class AuthService {
    constructor(prisma, jwt, config, notifications) {
        this.prisma = prisma;
        this.jwt = jwt;
        this.config = config;
        this.notifications = notifications;
    }
    async register(input) {
        const existing = await this.prisma.user.findUnique({
            where: { email: input.email.toLowerCase() },
        });
        if (existing)
            throw new common_1.ConflictException('Email already registered');
        const passwordHash = await argon2.hash(input.password);
        const user = await this.prisma.user.create({
            data: {
                email: input.email.toLowerCase(),
                passwordHash,
                fullName: input.fullName,
                role: 'USER',
            },
        });
        const token = (0, crypto_1.randomBytes)(32).toString('hex');
        await this.prisma.emailVerificationToken.create({
            data: {
                userId: user.id,
                token,
                expiresAt: new Date(Date.now() + EMAIL_VERIFICATION_EXPIRY_HOURS * 60 * 60 * 1000),
            },
        });
        await this.notifications.sendVerificationEmail(user.email, user.fullName, token);
        const accessToken = this.signAccessToken(user);
        const { refreshToken: newRefresh, refreshExpiry } = await this.createRefreshToken(user.id);
        return { user: this.userResponse(user), accessToken, refreshToken: newRefresh, expiresAt: refreshExpiry };
    }
    async login(input, refreshToken) {
        const user = await this.prisma.user.findUnique({
            where: { email: input.email.toLowerCase() },
        });
        if (!user || !(await argon2.verify(user.passwordHash, input.password))) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        const accessToken = this.signAccessToken(user);
        const { refreshToken: newRefresh, refreshExpiry } = await this.rotateRefreshToken(user.id, refreshToken);
        return {
            user: this.userResponse(user),
            accessToken,
            refreshToken: newRefresh,
            expiresAt: refreshExpiry,
        };
    }
    async refresh(refreshToken) {
        if (!refreshToken)
            throw new common_1.UnauthorizedException('Refresh token required');
        const hash = await this.hashRefreshToken(refreshToken);
        const stored = await this.prisma.refreshToken.findFirst({
            where: { tokenHash: hash },
            include: { user: true },
        });
        if (!stored || stored.expiresAt < new Date()) {
            if (stored)
                await this.prisma.refreshToken.delete({ where: { id: stored.id } }).catch(() => { });
            throw new common_1.UnauthorizedException('Invalid or expired refresh token');
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
    async logout(refreshToken) {
        if (refreshToken) {
            const hash = await this.hashRefreshToken(refreshToken);
            await this.prisma.refreshToken.deleteMany({ where: { tokenHash: hash } });
        }
        return { success: true };
    }
    async verifyEmail(input) {
        const record = await this.prisma.emailVerificationToken.findUnique({
            where: { token: input.token },
            include: { user: true },
        });
        if (!record || record.expiresAt < new Date())
            throw new common_1.BadRequestException('Invalid or expired verification token');
        await this.prisma.$transaction([
            this.prisma.user.update({
                where: { id: record.userId },
                data: { emailVerifiedAt: new Date() },
            }),
            this.prisma.emailVerificationToken.delete({ where: { id: record.id } }),
        ]);
        return { success: true };
    }
    async requestPasswordReset(input) {
        const user = await this.prisma.user.findUnique({
            where: { email: input.email.toLowerCase() },
        });
        if (!user)
            return { success: true };
        const token = (0, crypto_1.randomBytes)(32).toString('hex');
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
    async resetPassword(input) {
        const record = await this.prisma.passwordResetToken.findUnique({
            where: { token: input.token },
            include: { user: true },
        });
        if (!record || record.expiresAt < new Date())
            throw new common_1.BadRequestException('Invalid or expired reset token');
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
    async revokeAllRefreshTokensForUser(userId) {
        await this.prisma.refreshToken.deleteMany({ where: { userId } });
        return { success: true };
    }
    signAccessToken(user) {
        return this.jwt.sign({ sub: user.id, email: user.email, role: user.role }, { expiresIn: this.config.get('JWT_ACCESS_EXPIRES', '15m') });
    }
    async hashRefreshToken(token) {
        return argon2.hash(token, { type: argon2.argon2id });
    }
    async createRefreshToken(userId) {
        const raw = (0, crypto_1.randomBytes)(48).toString('hex');
        const tokenHash = await this.hashRefreshToken(raw);
        const expiresAt = new Date(Date.now() + REFRESH_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
        await this.prisma.refreshToken.create({
            data: { userId, tokenHash, expiresAt },
        });
        return { refreshToken: raw, refreshExpiry: expiresAt };
    }
    async rotateRefreshToken(userId, previousToken) {
        if (previousToken) {
            const hash = await this.hashRefreshToken(previousToken);
            await this.prisma.refreshToken.deleteMany({ where: { userId, tokenHash: hash } });
        }
        return this.createRefreshToken(userId);
    }
    userResponse(user) {
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
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService,
        notifications_service_1.NotificationsService])
], AuthService);
//# sourceMappingURL=auth.service.js.map