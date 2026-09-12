import { z } from 'zod';

// --- Generic Success Response ---
export const SuccessResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
});
export type SuccessResponseDto = z.infer<typeof SuccessResponseSchema>;

// --- Paginated Query Params ---
export const PaginatedQuerySchema = z.object({
  limit: z.number().int().positive().default(50),
  offset: z.number().int().min(0).default(0),
});
export type PaginatedQueryDto = z.infer<typeof PaginatedQuerySchema>;

// --- Transaction by ID Response ---
export const TransactionByIdResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  transaction: z.object({
    id: z.string(),
    referenceId: z.string(),
    senderId: z.string().nullable(),
    receiverId: z.string().nullable(),
    amount: z.number(),
    type: z.string(),
    status: z.string(),
    description: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
  }),
});
export type TransactionByIdResponseDto = z.infer<typeof TransactionByIdResponseSchema>;
