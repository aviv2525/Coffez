import { z } from 'zod';
export declare const createSellerProfileSchema: z.ZodObject<{
    displayName: z.ZodString;
    bio: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    categories: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    locationText: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    avatarUrl: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    displayName: string;
    categories: string[];
    bio?: string | null | undefined;
    locationText?: string | null | undefined;
    avatarUrl?: string | null | undefined;
}, {
    displayName: string;
    bio?: string | null | undefined;
    categories?: string[] | undefined;
    locationText?: string | null | undefined;
    avatarUrl?: string | null | undefined;
}>;
export declare const updateSellerProfileSchema: z.ZodObject<{
    displayName: z.ZodOptional<z.ZodString>;
    bio: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    categories: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodString, "many">>>;
    locationText: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    avatarUrl: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
}, "strip", z.ZodTypeAny, {
    displayName?: string | undefined;
    bio?: string | null | undefined;
    categories?: string[] | undefined;
    locationText?: string | null | undefined;
    avatarUrl?: string | null | undefined;
}, {
    displayName?: string | undefined;
    bio?: string | null | undefined;
    categories?: string[] | undefined;
    locationText?: string | null | undefined;
    avatarUrl?: string | null | undefined;
}>;
export type CreateSellerProfileInput = z.infer<typeof createSellerProfileSchema>;
export type UpdateSellerProfileInput = z.infer<typeof updateSellerProfileSchema>;
