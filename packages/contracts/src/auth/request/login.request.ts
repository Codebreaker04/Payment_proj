import { z } from 'zod';

export const LoginRequestSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});
export type LoginRequestDto = z.infer<typeof LoginRequestSchema>;
