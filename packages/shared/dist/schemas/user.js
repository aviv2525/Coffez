"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserSchema = exports.userRoleSchema = void 0;
const zod_1 = require("zod");
exports.userRoleSchema = zod_1.z.enum(['USER', 'ADMIN']);
exports.updateUserSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(1).max(200).optional(),
});
