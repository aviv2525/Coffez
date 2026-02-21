import { z } from 'zod';
export declare const profileMediaTypeSchema: z.ZodEnum<["IMAGE", "VIDEO"]>;
export declare const createProfileMediaSchema: z.ZodObject<{
    type: z.ZodEnum<["IMAGE", "VIDEO"]>;
    url: z.ZodString;
    thumbnailUrl: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    title: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    caption: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    sortOrder: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    type: "IMAGE" | "VIDEO";
    url: string;
    sortOrder: number;
    title?: string | null | undefined;
    thumbnailUrl?: string | null | undefined;
    caption?: string | null | undefined;
}, {
    type: "IMAGE" | "VIDEO";
    url: string;
    title?: string | null | undefined;
    thumbnailUrl?: string | null | undefined;
    caption?: string | null | undefined;
    sortOrder?: number | undefined;
}>;
export declare const updateProfileMediaSchema: z.ZodObject<{
    type: z.ZodOptional<z.ZodEnum<["IMAGE", "VIDEO"]>>;
    url: z.ZodOptional<z.ZodString>;
    thumbnailUrl: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    title: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    caption: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    sortOrder: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    title?: string | null | undefined;
    type?: "IMAGE" | "VIDEO" | undefined;
    url?: string | undefined;
    thumbnailUrl?: string | null | undefined;
    caption?: string | null | undefined;
    sortOrder?: number | undefined;
}, {
    title?: string | null | undefined;
    type?: "IMAGE" | "VIDEO" | undefined;
    url?: string | undefined;
    thumbnailUrl?: string | null | undefined;
    caption?: string | null | undefined;
    sortOrder?: number | undefined;
}>;
export type CreateProfileMediaInput = z.infer<typeof createProfileMediaSchema>;
export type UpdateProfileMediaInput = z.infer<typeof updateProfileMediaSchema>;
