import { z } from 'zod';
export declare const paginationSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    sortBy: z.ZodOptional<z.ZodString>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    sortOrder: "asc" | "desc";
    page: number;
    limit: number;
    sortBy?: string | undefined;
}, {
    sortOrder?: "asc" | "desc" | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    sortBy?: string | undefined;
}>;
export type PaginationInput = z.infer<typeof paginationSchema>;
