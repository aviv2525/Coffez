import { z } from 'zod';

export const createSellerProfileSchema = z.object({
  displayName: z.string().min(1).max(100),
  bio: z.string().max(1000).optional().nullable(),
  categories: z.array(z.string().max(50)).max(10).default([]),
  locationText: z.string().max(200).optional().nullable(),
  avatarUrl: z.string().url().optional().nullable(),
  beans: z.array(z.string().max(80)).max(20).default([]),
  drinkTypes: z.array(z.string().max(80)).max(20).default([]),
  machineType: z.string().max(200).optional().nullable(),
  openingHours: z.string().max(500).optional().nullable(),
  lat: z.number().min(-90).max(90).optional().nullable(),
  lng: z.number().min(-180).max(180).optional().nullable(),
  pickupDetails: z.string().max(500).optional().nullable(),
  tipBit: z.string().max(300).optional().nullable(),
  tipPaypal: z.string().max(300).optional().nullable(),
});

export const updateSellerProfileSchema = createSellerProfileSchema.partial();

export type CreateSellerProfileInput = z.infer<typeof createSellerProfileSchema>;
export type UpdateSellerProfileInput = z.infer<typeof updateSellerProfileSchema>;
