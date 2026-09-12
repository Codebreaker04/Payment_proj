import { z } from 'zod';

// Enums matching the Prisma schema
export const TransactionStatusSchema = z.enum([
  'Pending',
  'Completed',
  'Failed',
  'Refunded',
]);
export type TransactionStatus = z.infer<typeof TransactionStatusSchema>;

export const TransactionTypeSchema = z.enum([
  'P2P_Transfer',
  'credit',
  'debit',
  'refund',
]);
export type TransactionType = z.infer<typeof TransactionTypeSchema>;

export const PaymentMethodSchema = z.enum(['P2P', 'UPI', 'CARD', 'INTERNAL']);
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;

// Base fields shared across all transaction types
const BaseTransactionFields = {
  amount: z.number().positive().min(0.01),
  currency: z.string().length(3),
  idempotencyKey: z.string().min(1).max(255),
  description: z.string().max(255).optional().nullable(),
};

// --- P2P Transaction ---
export const P2PTransactionSchema = z.object({
  ...BaseTransactionFields,
  paymentMethod: z.literal('P2P'),
  senderId: z.string().min(1),
  receiverId: z.string().min(1),
});
export type P2PTransactionRequestDto = z.infer<typeof P2PTransactionSchema>;

// --- UPI Transaction ---
export const UPITransactionSchema = z.object({
  ...BaseTransactionFields,
  paymentMethod: z.literal('UPI'),
  vpa: z.string().min(1),
});
export type UPITransactionRequestDto = z.infer<typeof UPITransactionSchema>;

// --- Card Transaction ---
export const CardTransactionSchema = z.object({
  ...BaseTransactionFields,
  paymentMethod: z.literal('CARD'),
  cardNumber: z.string().min(1).max(19),
  expiryDate: z.string().min(1),
  expiryMonth: z.string().min(1).max(2),
  cvv: z.string().min(1).max(4),
});
export type CardTransactionRequestDto = z.infer<typeof CardTransactionSchema>;

// --- Internal Transaction ---
export const InternalTransactionSchema = z.object({
  ...BaseTransactionFields,
  paymentMethod: z.literal('INTERNAL'),
  systemAccountId: z.string().min(1),
});
export type InternalTransactionRequestDto = z.infer<typeof InternalTransactionSchema>;

// Union type for any transaction initiated via webhook
export const InitiateTransactionSchema = z.union([
  P2PTransactionSchema,
  UPITransactionSchema,
  CardTransactionSchema,
  InternalTransactionSchema,
]);
export type InitiateTransactionRequestDto = z.infer<typeof InitiateTransactionSchema>;

// --- User-initiated P2P Transfer (from the frontend) ---
export const UserP2PTransferSchema = z.object({
  senderUserId: z.string().min(1),
  receiverUserId: z.string().min(1),
  amount: z.number().positive().min(0.01),
  idempotencyKey: z.string().min(1),
  description: z.string().max(255).optional().nullable(),
});
export type UserP2PTransferRequestDto = z.infer<typeof UserP2PTransferSchema>;

// --- Transaction Response ---
export const TransactionResponseSchema = z.object({
  id: z.string().uuid(),
  referenceId: z.string(),
  senderId: z.string().nullable(),
  receiverId: z.string().nullable(),
  amount: z.number(),
  type: TransactionTypeSchema,
  status: TransactionStatusSchema,
  description: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type TransactionResponseDto = z.infer<typeof TransactionResponseSchema>;

// --- Paginated Transaction List ---
export const TransactionListResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  count: z.number().min(0),
  transactions: z.array(TransactionResponseSchema),
});
export type TransactionListResponseDto = z.infer<
  typeof TransactionListResponseSchema
>;

// --- Transaction Operation Result (P2P webhook / user transfer) ---
export const TransactionResultSchema = z.discriminatedUnion('success', [
  z.object({
    success: z.literal(true),
    message: z.string(),
    transaction: z.object({
      id: z.string(),
      referenceId: z.string(),
      amount: z.number(),
      status: TransactionStatusSchema,
      type: TransactionTypeSchema,
      createdAt: z.string(),
    }),
  }),
  z.object({
    success: z.literal(false),
    message: z.string(),
  }),
]);
export type TransactionResultDto = z.infer<typeof TransactionResultSchema>;

