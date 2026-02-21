"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordSchema = exports.requestPasswordResetSchema = exports.verifyEmailSchema = exports.refreshTokenSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8).max(128),
    fullName: zod_1.z.string().min(1).max(200),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1),
});
exports.refreshTokenSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1).optional(),
});
exports.verifyEmailSchema = zod_1.z.object({
    token: zod_1.z.string().min(1),
});
exports.requestPasswordResetSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
});
exports.resetPasswordSchema = zod_1.z.object({
    token: zod_1.z.string().min(1),
    newPassword: zod_1.z.string().min(8).max(128),
});
