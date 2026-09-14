import { z } from 'zod';

// --- Logout Response ---
// No request body required. Revokes all tokens issued to the user by
// bumping `User.tokenVersion`.
export const LogoutResponseSchema = z.object({
  success: z.literal(true),
});

export type LogoutResponseDto = z.infer<typeof LogoutResponseSchema>;