# Validation Consolidation Plan — Shared Zod Package

## Context

Frontend has zero validation library — 100% manual `if` checks. Backend uses class-validator with NestJS ValidationPipe. **No types shared** between frontend and backend: `apps/user-app/lib/api.ts` re-declares 9 interfaces by hand that already exist in Prisma + NestJS DTOs. Rules duplicated across 3 layers (password min-8 in signup/page.tsx, api/auth/signup/route.ts, signupRequest.dto.ts). The repo has 3 uncommitted compile errors in bank-webhook DTOs already.

**Goal:** Single source of truth for validation + types. Shared Zod schemas in monorepo package consumed by both frontend and backend.

**Strategy:** Hybrid — create Zod schemas in shared package first. Frontend consumes immediately. Backend stays on class-validator for now (Swagger auto-doc works, risk low). Later swap backend via `ZodValidationPipe`.

---

## Steps

### Step 1: Create `packages/validation`

Follow `packages/database` conventions:

```
packages/validation/
├── package.json          # @repo/validation, zod dependency
├── tsconfig.json         # extends @repo/typescript-config/base.json
├── src/
│   ├── index.ts          # barrel export
│   ├── schemas/
│   │   ├── auth.schema.ts
│   │   ├── transaction.schema.ts
│   │   ├── user.schema.ts
│   │   └── wallet.schema.ts
│   └── types.ts          # re-export z.infer for convenience
```

**`package.json`**:
```json
{
  "name": "@repo/validation",
  "private": true,
  "type": "commonjs",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": { ".": { "types": "./dist/index.d.ts", "default": "./dist/index.js" } },
  "scripts": { "build": "tsc", "check-types": "tsc --noEmit" },
  "dependencies": { "zod": "^4.0.0" }
}
```

### Step 2: Write shared Zod schemas

Map each class-validator DTO to a Zod schema + inferred type.

**`schemas/auth.schema.ts`** — Login, Signup:
```ts
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const signupSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8),
});
export type SignupInput = z.infer<typeof signupSchema>;
```

**`schemas/transaction.schema.ts`** — P2P transfer, pagination:
```ts
export const userTransferSchema = z.object({
  senderUserId: z.string().uuid(),
  receiverUserId: z.string().uuid(),
  amount: z.number().positive().min(0.01),
  idempotencyKey: z.string().min(1),
  description: z.string().max(255).optional(),
});
export type UserTransferInput = z.infer<typeof userTransferSchema>;
```

**`schemas/user.schema.ts`** — Profile + Settings updates.

**`schemas/wallet.schema.ts`** — Balance query, pagination params.

Also add **response schemas** that mirror what the API actually returns — so frontend can validate responses instead of bare `as T` casts:
```ts
export const transactionResponseSchema = z.object({
  success: z.boolean(),
  transaction: z.object({ ... }),
});
export const balanceResponseSchema = z.object({
  success: z.boolean(),
  balance: z.number(),
});
```

### Step 3: Add `@repo/validation` to `apps/user-app`

- `npm install @repo/validation -w user-app`
- Update `turbo.json` build pipeline so `user-app:build` depends on `validation:build`

**Replace hand-mirrored types in `lib/api.ts`** (L3-48):
- Import Zod-inferred types from `@repo/validation` instead of inline interfaces
- Add runtime validation on API responses using `.parse()` (replaces bare `as T` on L77)
- Add request validation using Zod schemas before sending

**Add form validation in pages:**
- `app/transfer/page.tsx`: validate with `userTransferSchema` before submit
- `app/auth/signup/page.tsx`: validate with `signupSchema`
- `app/settings/page.tsx`: validate with `updateSettingsSchema`
- `app/account/page.tsx`: validate with `updateProfileSchema`

**Remove manual validation code** from each page (the hand-written `if` blocks).

### Step 4: Keep class-validator on NestJS for now

No changes to `apps/bank-webhook/src/transaction/dtos/request.ts` etc. The DTO classes continue to work with `ValidationPipe` + `@nestjs/swagger`.

**Exception:** Fix the 3 compile errors listed in the exploration report (LoginDto symbol mismatch, PaymentMethod import missing, auth.service.ts return type). These are pre-existing breakages not related to validation migration — just bugs.

### Step 5: Prepare backend migration path (future)

Add a `ZodValidationPipe` class to `apps/bank-webhook/src/common/pipes/zod-validation.pipe.ts`. Don't wire it yet:

```ts
// Keep on file for future use
@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodSchema) {}
  transform(value: unknown) {
    const result = this.schema.safeParse(value);
    if (!result.success) throw new BadRequestException(result.error.format());
    return result.data;
  }
}
```

### Step 6: Clean up (optional — do at end)

After backend migrates to Zod (future step):
- Remove `class-validator`, `class-transformer` from `apps/bank-webhook/package.json`
- Delete `packages/validation` Zod schemas that became dead? No — they ARE the source of truth
- Delete NestJS DTO files
- Remove `ValidationPipe` from `main.ts`, replace with `ZodValidationPipe`

---

## Files to create

| File | Purpose |
|------|---------|
| `packages/validation/package.json` | @repo/validation with zod |
| `packages/validation/tsconfig.json` | extends base |
| `packages/validation/src/index.ts` | barrel |
| `packages/validation/src/schemas/auth.schema.ts` | login, signup schemas |
| `packages/validation/src/schemas/transaction.schema.ts` | transfer, pagination schemas |
| `packages/validation/src/schemas/user.schema.ts` | profile, settings schemas |
| `packages/validation/src/schemas/wallet.schema.ts` | balance, pagination schemas |

## Files to modify

| File | Change |
|------|--------|
| `apps/user-app/package.json` | add `@repo/validation` dep |
| `apps/user-app/lib/api.ts` | replace inline interfaces with Zod types, add `.parse()` on responses |
| `apps/user-app/app/transfer/page.tsx` | replace manual `if` checks with `userTransferSchema.parse()` |
| `apps/user-app/app/auth/signup/page.tsx` | replace manual checks with `signupSchema.parse()` |
| `apps/user-app/app/settings/page.tsx` | add `updateSettingsSchema.safeParse()` before send |
| `apps/user-app/app/account/page.tsx` | add `updateProfileSchema.safeParse()` before send |
| `apps/user-app/app/api/auth/signup/route.ts` | replace manual validation with `signupSchema.parse()` |
| `turbo.json` | add `validation:build` dependsOn if needed |

## Files to fix (pre-existing bugs, not validation)

| File | Bug |
|------|-----|
| `apps/bank-webhook/src/auth/auth.controller.ts:3-4` | imports `LoginDto` / `SignupDto` — should be `LoginRequestDto` / `SignupRequestDto` |
| `apps/bank-webhook/src/transaction/transaction.controller.ts:20` | imports `PaymentMethod` from wrong path |
| `apps/bank-webhook/src/auth/auth.service.ts:113` | missing return type annotation (syntax error) |

## Verification

1. `npm run check-types` — all packages typecheck
2. `npm run build` — all packages build
3. `cd apps/bank-webhook && npm run test` — NestJS unit tests pass (no behavior changed)
4. `cd apps/user-app && npm run build` — Next.js production builds
5. Manual: open signup page, try short password → error from Zod (not server round-trip)
6. Manual: open transfer page, try empty receiver → error from Zod before submit
7. `cd packages/validation && node -e "require('@repo/validation')"` — CJS import works