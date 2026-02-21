import { z } from 'zod';

export const userRoleSchema = z.enum(['USER', 'ADMIN']);

export const updateUserSchema = z.object({
  fullName: z.string().min(1).max(200).optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
