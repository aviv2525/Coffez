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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const throttler_1 = require("@nestjs/throttler");
const cookie_util_1 = require("./cookie.util");
const auth_service_1 = require("./auth.service");
const dto_1 = require("./dto");
const refresh_token_guard_1 = require("./guards/refresh-token.guard");
let AuthController = class AuthController {
    constructor(auth) {
        this.auth = auth;
    }
    async register(dto, res) {
        const result = await this.auth.register(dto);
        if (result.refreshToken && result.expiresAt) {
            (0, cookie_util_1.setRefreshTokenCookie)(res, result.refreshToken, result.expiresAt);
            return { user: result.user, accessToken: result.accessToken, expiresAt: result.expiresAt };
        }
        return result;
    }
    async login(dto, req, res) {
        const refreshToken = req.cookies?.refreshToken;
        const result = await this.auth.login(dto, refreshToken);
        (0, cookie_util_1.setRefreshTokenCookie)(res, result.refreshToken, result.expiresAt);
        return { user: result.user, accessToken: result.accessToken, expiresAt: result.expiresAt };
    }
    async refresh(req, res) {
        const refreshToken = req.refreshToken;
        const result = await this.auth.refresh(refreshToken);
        (0, cookie_util_1.setRefreshTokenCookie)(res, result.refreshToken, result.expiresAt);
        return { accessToken: result.accessToken, expiresAt: result.expiresAt };
    }
    async logout(req, res) {
        const refreshToken = req.refreshToken;
        await this.auth.logout(refreshToken);
        (0, cookie_util_1.clearRefreshTokenCookie)(res);
        return { success: true };
    }
    async verifyEmail(dto) {
        return this.auth.verifyEmail(dto);
    }
    async requestPasswordReset(dto) {
        return this.auth.requestPasswordReset(dto);
    }
    async resetPassword(dto) {
        return this.auth.resetPassword(dto);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('register'),
    (0, swagger_1.ApiOperation)({ summary: 'Register a new user' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.RegisterDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    (0, throttler_1.Throttle)({ auth: { limit: 5, ttl: 600000 } }),
    (0, swagger_1.ApiOperation)({ summary: 'Login' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.LoginDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('refresh'),
    (0, common_1.UseGuards)(refresh_token_guard_1.RefreshTokenGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Refresh access token' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, common_1.UseGuards)(refresh_token_guard_1.RefreshTokenGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Logout and revoke refresh token' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Post)('verify-email'),
    (0, swagger_1.ApiOperation)({ summary: 'Verify email with token' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.VerifyEmailDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyEmail", null);
__decorate([
    (0, common_1.Post)('password/reset-request'),
    (0, swagger_1.ApiOperation)({ summary: 'Request password reset email' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.RequestPasswordResetDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "requestPasswordReset", null);
__decorate([
    (0, common_1.Post)('password/reset'),
    (0, swagger_1.ApiOperation)({ summary: 'Reset password with token' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.ResetPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('auth'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map