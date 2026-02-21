"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderFilterSchema = exports.updateOrderStatusSchema = exports.createOrderSchema = exports.orderStatusSchema = void 0;
const zod_1 = require("zod");
exports.orderStatusSchema = zod_1.z.enum([
    'PENDING',
    'ACCEPTED',
    'REJECTED',
    'COMPLETED',
    'CANCELLED',
]);
exports.createOrderSchema = zod_1.z.object({
    sellerId: zod_1.z.string().uuid(),
    menuItemId: zod_1.z.string().uuid(),
    note: zod_1.z.string().max(500).optional().nullable(),
    scheduledFor: zod_1.z.string().optional().nullable(), // ISO datetime string
});
exports.updateOrderStatusSchema = zod_1.z.object({
    status: exports.orderStatusSchema,
});
exports.orderFilterSchema = zod_1.z.object({
    status: exports.orderStatusSchema.optional(),
    sellerId: zod_1.z.string().uuid().optional(),
    buyerId: zod_1.z.string().uuid().optional(),
});
