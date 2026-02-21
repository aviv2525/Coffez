"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfileMediaSchema = exports.createProfileMediaSchema = exports.profileMediaTypeSchema = void 0;
const zod_1 = require("zod");
exports.profileMediaTypeSchema = zod_1.z.enum(['IMAGE', 'VIDEO']);
exports.createProfileMediaSchema = zod_1.z.object({
    type: exports.profileMediaTypeSchema,
    url: zod_1.z.string().url(),
    thumbnailUrl: zod_1.z.string().url().optional().nullable(),
    title: zod_1.z.string().max(200).optional().nullable(),
    caption: zod_1.z.string().max(500).optional().nullable(),
    sortOrder: zod_1.z.number().int().min(0).default(0),
});
exports.updateProfileMediaSchema = zod_1.z.object({
    type: exports.profileMediaTypeSchema.optional(),
    url: zod_1.z.string().url().optional(),
    thumbnailUrl: zod_1.z.string().url().optional().nullable(),
    title: zod_1.z.string().max(200).optional().nullable(),
    caption: zod_1.z.string().max(500).optional().nullable(),
    sortOrder: zod_1.z.number().int().min(0).optional(),
});
