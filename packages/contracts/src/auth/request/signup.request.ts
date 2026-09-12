import { z } from 'zod';

export const SignupRequestSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.email(),
  password: z.string().min(8),
});
export type SignupRequestDto = z.infer<typeof SignupRequestSchema>;
