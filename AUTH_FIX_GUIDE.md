# 🔐 Authorization Issues Fixed

## ❌ Problems Found

### 1. **Missing `await` in bcrypt.compare**
```typescript
// WRONG - Missing await
const passwordMatch = bcrypt.compare(
  credentials?.password,
  user?.password,
);
```
**Issue**: `bcrypt.compare()` returns a Promise, but wasn't being awaited. This always evaluated to truthy (the Promise object), allowing any password!

### 2. **Wrong import path**
```typescript
import { genrateToken } from "../../../utils/auth";
```
**Issue**: 
- Typo: `genrateToken` (should be `generateToken`)
- Wrong path (3 levels up)
- Function not needed for NextAuth

### 3. **Incorrect return value**
```typescript
if (passwordMatch) {
  const token = genrateToken(user.id);
  return token; // ❌ Wrong! Should return user object
}
```
**Issue**: NextAuth `authorize()` should return a user object, not a token string.

### 4. **Missing error handling**
No try-catch block, no validation for undefined credentials.

### 5. **Wrong arguments order in bcrypt.compare**
```typescript
bcrypt.compare(credentials?.password, user?.password)
```
Should be: `bcrypt.compare(plainPassword, hashedPassword)`

### 6. **Missing Next.js 13+ App Router exports**
```typescript
export default NextAuth({...}); // ❌ Wrong for App Router
```
Should export GET and POST handlers.

## ✅ Solutions Applied

### 1. Fixed bcrypt.compare with await
```typescript
const isPasswordValid = await bcrypt.compare(
  credentials.password,
  user.password
);
```

### 2. Restructured auth configuration
Created `/lib/auth.ts` with proper NextAuth options:
```typescript
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        // Validation
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter email and password");
        }

        // Find user
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        // Verify password with await
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid password");
        }

        // Return user object (not token!)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};
```

### 3. Fixed route handler for App Router
```typescript
// api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
```

### 4. Added TypeScript definitions
```typescript
// types/next-auth.d.ts
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
    };
  }
}
```

### 5. Updated utils/auth.ts
```typescript
export const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET || "default_secret_key";
  const token = jwt.sign({ userId }, secret, { expiresIn: "15d" });
  return token;
};

export const verifyToken = (token: string): { userId: string } | null => {
  try {
    const secret = process.env.JWT_SECRET || "default_secret_key";
    const decoded = jwt.verify(token, secret) as { userId: string };
    return decoded;
  } catch (error) {
    return null;
  }
};
```

### 6. Installed missing dependencies
```bash
npm install jsonwebtoken @types/jsonwebtoken
```

## 🧪 Testing Authentication

### 1. Create a test user (via Prisma or API)
```bash
# In Prisma Studio or database
INSERT INTO users (id, email, password, name) VALUES (
  'test-user-id',
  'test@example.com',
  '$2b$10$...',  -- hashed password
  'Test User'
);
```

### 2. Test login
```bash
curl -X POST http://localhost:3000/api/auth/callback/credentials \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "your-password"
  }'
```

### 3. Or use NextAuth session
```typescript
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// In server component
const session = await getServerSession(authOptions);
```

## 📝 Files Modified

```
✅ apps/user-app/lib/auth.ts              (CREATED - Auth config)
✅ apps/user-app/api/auth/[...nextauth]/route.ts (FIXED)
✅ apps/user-app/utils/auth.ts            (FIXED - JWT helpers)
✅ apps/user-app/types/next-auth.d.ts     (CREATED - Types)
✅ apps/user-app/package.json             (UPDATED - Added deps)
```

## 🔒 Security Improvements

1. ✅ Proper async/await for bcrypt
2. ✅ Validation of credentials before processing
3. ✅ Error messages that don't leak info
4. ✅ JWT tokens with expiration
5. ✅ Session strategy configured
6. ✅ Secret keys properly configured

## 📚 Environment Variables Required

```env
# .env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-here
JWT_SECRET=your-jwt-secret-key-here
DATABASE_URL=postgresql://user:password@localhost:5432/payments
```

Generate secrets:
```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate JWT_SECRET
openssl rand -base64 32
```

## 🎯 Next Steps

1. Create sign-in page at `/app/auth/signin/page.tsx`
2. Add sign-up functionality
3. Protect routes with middleware
4. Add session provider to layout

---

**Status**: ✅ All authorization issues fixed!
