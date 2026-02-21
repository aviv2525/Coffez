import { z } from 'zod';
export declare const orderStatusSchema: z.ZodEnum<["PENDING", "ACCEPTED", "REJECTED", "COMPLETED", "CANCELLED"]>;
export declare const createOrderSchema: z.ZodObject<{
    sellerId: z.ZodString;
    menuItemId: z.ZodString;
    note: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    scheduledFor: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    sellerId: string;
    menuItemId: string;
    note?: string | null | undefined;
    scheduledFor?: string | null | undefined;
}, {
    sellerId: string;
    menuItemId: string;
    note?: string | null | undefined;
    scheduledFor?: string | null | undefined;
}>;
export declare const updateOrderStatusSchema: z.ZodObject<{
    status: z.ZodEnum<["PENDING", "ACCEPTED", "REJECTED", "COMPLETED", "CANCELLED"]>;
}, "strip", z.ZodTypeAny, {
    status: "PENDING" | "ACCEPTED" | "REJECTED" | "COMPLETED" | "CANCELLED";
}, {
    status: "PENDING" | "ACCEPTED" | "REJECTED" | "COMPLETED" | "CANCELLED";
}>;
export declare const orderFilterSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<["PENDING", "ACCEPTED", "REJECTED", "COMPLETED", "CANCELLED"]>>;
    sellerId: z.ZodOptional<z.ZodString>;
    buyerId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status?: "PENDING" | "ACCEPTED" | "REJECTED" | "COMPLETED" | "CANCELLED" | undefined;
    sellerId?: string | undefined;
    buyerId?: string | undefined;
}, {
    status?: "PENDING" | "ACCEPTED" | "REJECTED" | "COMPLETED" | "CANCELLED" | undefined;
    sellerId?: string | undefined;
    buyerId?: string | undefined;
}>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type OrderFilterInput = z.infer<typeof orderFilterSchema>;
