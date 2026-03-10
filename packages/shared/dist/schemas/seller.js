"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSellerProfileSchema = exports.createSellerProfileSchema = void 0;
const zod_1 = require("zod");
exports.createSellerProfileSchema = zod_1.z.object({
    displayName: zod_1.z.string().min(1).max(100),
    bio: zod_1.z.string().max(1000).optional().nullable(),
    categories: zod_1.z.array(zod_1.z.string().max(50)).max(10).default([]),
    locationText: zod_1.z.string().max(200).optional().nullable(),
    avatarUrl: zod_1.z.string().url().optional().nullable(),
    beans: zod_1.z.array(zod_1.z.string().max(80)).max(20).default([]),
    drinkTypes: zod_1.z.array(zod_1.z.string().max(80)).max(20).default([]),
    machineType: zod_1.z.string().max(200).optional().nullable(),
    openingHours: zod_1.z.string().max(500).optional().nullable(),
});
exports.updateSellerProfileSchema = exports.createSellerProfileSchema.partial();
