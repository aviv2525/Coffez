import { z } from 'zod';

export const createSellerProfileSchema = z.object({
  displayName: z.string().min(1).max(100),
  bio: z.string().max(1000).optional().nullable(),
  categories: z.array(z.string().max(50)).max(10).default([]),
  locationText: z.string().max(200).optional().nullable(),
  avatarUrl: z.string().url().optional().nullable(),
});

export const updateSellerProfileSchema = createSellerProfileSchema.partial();

export type CreateSellerProfileInput = z.infer<typeof createSellerProfileSchema>;
export type UpdateSellerProfileInput = z.infer<typeof updateSellerProfileSchema>;
