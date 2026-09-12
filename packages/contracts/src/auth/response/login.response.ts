import { z } from 'zod';

// --- Login Response ---
// One envelope for success and failure: the backend's global error filter
// shapes every failure as `{ success: false, message }`, so callers parse
// the response ONCE and read `message` in both cases.
export const LoginResponseSchema = z.discriminatedUnion('success', [
  z.object({
    success: z.literal(true),
    message: z.string().optional(),
    accessToken: z.string(),
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

export type LoginResponseDto = z.infer<typeof LoginResponseSchema>;