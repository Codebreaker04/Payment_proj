import { z } from 'zod';

// --- Wallet Balance Response ---
export const WalletBalanceSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  balance: z.number(),
});
export type WalletBalanceDto = z.infer<typeof WalletBalanceSchema>;

// --- Wallet Transactions Response ---
export const WalletTransactionsResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  count: z.number().min(0),
  transactions: z.array(z.unknown()),
});
export type WalletTransactionsResponseDto = z.infer<typeof WalletTransactionsResponseSchema>;

// --- Get Wallet Transactions Query Params ---
export const GetWalletTransactionsQuerySchema = z.object({
  limit: z.number().int().positive().default(50),
  offset: z.number().int().min(0).default(0),
});
export type GetWalletTransactionsQueryDto = z.infer<typeof GetWalletTransactionsQuerySchema>;
