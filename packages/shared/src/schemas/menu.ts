import { z } from 'zod';

export const createMenuItemSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional().nullable(),
  price: z.number().positive(),
  imageUrl: z.string().url().optional().nullable(),
  isAvailable: z.boolean().default(true),
});

export const updateMenuItemSchema = createMenuItemSchema.partial();

export const setAvailabilitySchema = z.object({
  isAvailable: z.boolean(),
});

export type CreateMenuItemInput = z.infer<typeof createMenuItemSchema>;
export type UpdateMenuItemInput = z.infer<typeof updateMenuItemSchema>;
export type SetAvailabilityInput = z.infer<typeof setAvailabilitySchema>;
