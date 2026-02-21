"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setAvailabilitySchema = exports.updateMenuItemSchema = exports.createMenuItemSchema = void 0;
const zod_1 = require("zod");
exports.createMenuItemSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).max(200),
    description: zod_1.z.string().max(1000).optional().nullable(),
    price: zod_1.z.number().positive(),
    imageUrl: zod_1.z.string().url().optional().nullable(),
    isAvailable: zod_1.z.boolean().default(true),
});
exports.updateMenuItemSchema = exports.createMenuItemSchema.partial();
exports.setAvailabilitySchema = zod_1.z.object({
    isAvailable: zod_1.z.boolean(),
});
