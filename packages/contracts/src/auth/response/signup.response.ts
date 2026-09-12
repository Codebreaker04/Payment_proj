import { z } from 'zod';

// --- Signup Response ---
// Same envelope as Login: success or failure, both carry `message`.
export const SignupResponseSchema = z.discriminatedUnion('success', [
  z.object({
    success: z.literal(true),
    message: z.string().optional(),
    user: z.object({
      id: z.string(),
      email: z.string(),
      name: z.string().nullable(),
    }),
    accessToken: z.string(),
  }),
  z.object({
    success: z.literal(false),
    message: z.string(),
  }),
]);

export type SignupResponseDto = z.infer<typeof SignupResponseSchema>;