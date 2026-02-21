import { z } from 'zod';

export const orderStatusSchema = z.enum([
  'PENDING',
  'ACCEPTED',
  'REJECTED',
  'COMPLETED',
  'CANCELLED',
]);

export const createOrderSchema = z.object({
  sellerId: z.string().uuid(),
  menuItemId: z.string().uuid(),
  note: z.string().max(500).optional().nullable(),
  scheduledFor: z.string().optional().nullable(), // ISO datetime string
});

export const updateOrderStatusSchema = z.object({
  status: orderStatusSchema,
});

export const orderFilterSchema = z.object({
  status: orderStatusSchema.optional(),
  sellerId: z.string().uuid().optional(),
  buyerId: z.string().uuid().optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type OrderFilterInput = z.infer<typeof orderFilterSchema>;
