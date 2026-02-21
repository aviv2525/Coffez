import { z } from 'zod';

export const profileMediaTypeSchema = z.enum(['IMAGE', 'VIDEO']);

export const createProfileMediaSchema = z.object({
  type: profileMediaTypeSchema,
  url: z.string().url(),
  thumbnailUrl: z.string().url().optional().nullable(),
  title: z.string().max(200).optional().nullable(),
  caption: z.string().max(500).optional().nullable(),
  sortOrder: z.number().int().min(0).default(0),
});

export const updateProfileMediaSchema = z.object({
  type: profileMediaTypeSchema.optional(),
  url: z.string().url().optional(),
  thumbnailUrl: z.string().url().optional().nullable(),
  title: z.string().max(200).optional().nullable(),
  caption: z.string().max(500).optional().nullable(),
  sortOrder: z.number().int().min(0).optional(),
});

export type CreateProfileMediaInput = z.infer<typeof createProfileMediaSchema>;
export type UpdateProfileMediaInput = z.infer<typeof updateProfileMediaSchema>;
