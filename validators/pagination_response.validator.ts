import { z } from 'zod';

export const PaginationSchema = z.object({
  limit: z.number().int().positive().default(20),
  skip: z.number().int().nonnegative().default(0),
});
 
export const SuccessResponseSchema = z.object({
  success: z.literal(true),
  data: z.unknown(),
  message: z.string().optional(),
});
 
export const ErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    message: z.string(),
    code: z.string().optional(),
    details: z.unknown().optional(),
  }),
});
 
export const PaginatedResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(z.unknown()),
  pagination: z.object({
    total: z.number().int().nonnegative(),
    limit: z.number().int().positive(),
    skip: z.number().int().nonnegative(),
    hasMore: z.boolean(),
  }),
});