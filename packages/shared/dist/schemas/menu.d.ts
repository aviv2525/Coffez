import { z } from 'zod';
export declare const createMenuItemSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    price: z.ZodNumber;
    imageUrl: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    isAvailable: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    title: string;
    price: number;
    isAvailable: boolean;
    description?: string | null | undefined;
    imageUrl?: string | null | undefined;
}, {
    title: string;
    price: number;
    description?: string | null | undefined;
    imageUrl?: string | null | undefined;
    isAvailable?: boolean | undefined;
}>;
export declare const updateMenuItemSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    price: z.ZodOptional<z.ZodNumber>;
    imageUrl: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    isAvailable: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    title?: string | undefined;
    description?: string | null | undefined;
    price?: number | undefined;
    imageUrl?: string | null | undefined;
    isAvailable?: boolean | undefined;
}, {
    title?: string | undefined;
    description?: string | null | undefined;
    price?: number | undefined;
    imageUrl?: string | null | undefined;
    isAvailable?: boolean | undefined;
}>;
export declare const setAvailabilitySchema: z.ZodObject<{
    isAvailable: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    isAvailable: boolean;
}, {
    isAvailable: boolean;
}>;
export type CreateMenuItemInput = z.infer<typeof createMenuItemSchema>;
export type UpdateMenuItemInput = z.infer<typeof updateMenuItemSchema>;
export type SetAvailabilityInput = z.infer<typeof setAvailabilitySchema>;
