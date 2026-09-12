import { z } from 'zod';

// --- User Profile ---
export const UserProfileSchema = z.object({
  id: z.string().uuid(),
  name: z.string().nullable(),
  email: z.string().email(),
  phone: z.string().nullable(),
  createdAt: z.string(),
});
export type UserProfileDto = z.infer<typeof UserProfileSchema>;

// --- Update Profile Request ---
export const UpdateProfileSchema = z.object({
  name: z.string().max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(20).optional(),
});
export type UpdateProfileDto = z.infer<typeof UpdateProfileSchema>;

// --- User Settings ---
export const UserSettingsSchema = z.object({
  userId: z.string(),
  language: z.string().default('en'),
  currency: z.string().default('USD'),
  emailNotifications: z.boolean().default(true),
  transactionAlerts: z.boolean().default(true),
  twoFactorEnabled: z.boolean().default(false),
});
export type UserSettingsDto = z.infer<typeof UserSettingsSchema>;

// --- Update Settings Request ---
export const UpdateSettingsSchema = z.object({
  language: z.string().max(5).optional(),
  currency: z.string().optional(),
  emailNotifications: z.boolean().optional(),
  transactionAlerts: z.boolean().optional(),
  twoFactorEnabled: z.boolean().optional(),
});
export type UpdateSettingsDto = z.infer<typeof UpdateSettingsSchema>;

// --- User Profile Response ---
// Same envelope: success carries the profile, failure carries message.
export const UserProfileResponseSchema = z.discriminatedUnion('success', [
  z.object({
    success: z.literal(true),
    message: z.string().optional(),
    profile: UserProfileSchema.nullable(),
  }),
  z.object({
    success: z.literal(false),
    message: z.string(),
  }),
]);
export type UserProfileResponseDto = z.infer<typeof UserProfileResponseSchema>;
