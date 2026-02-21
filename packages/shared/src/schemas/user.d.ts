import { z } from 'zod';
export declare const userRoleSchema: z.ZodEnum<["USER", "ADMIN"]>;
export declare const updateUserSchema: z.ZodObject<{
    fullName: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    fullName?: string | undefined;
}, {
    fullName?: string | undefined;
}>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
