import { z } from 'zod';

// --- Verify Request ---
export const VerifyWebhookSchema = z.object({
  token: z.string().min(1),
});
export type VerifyWebhookDto = z.infer<typeof VerifyWebhookSchema>;

// --- Verify Response ---
// Same envelope: success carries the validated user, failure carries message.
export const VerifyResponseSchema = z.discriminatedUnion('success', [
  z.object({
    success: z.literal(true),
    message: z.string(),
    user: z.object({
      id: z.string(),
      email: z.string(),
      name: z.string().nullable(),
    }),
  }),
  z.object({
    success: z.literal(false),
    message: z.string(),
  }),
]);
export type VerifyResponseDto = z.infer<typeof VerifyResponseSchema>;