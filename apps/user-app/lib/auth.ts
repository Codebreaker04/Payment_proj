import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { LoginRequestSchema, LoginResponseSchema } from '@repo/contracts';

// Server-side (NextAuth authorize runs in the Node runtime, inside the
// container): API_URL points at the backend over the docker network.
// NEXT_PUBLIC_* fallbacks kept for non-docker/dev runs.
const API_BASE_URL =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:3002';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: {
          label: 'Email',
          type: 'email',
          placeholder: 'name@company.com',
        },
        password: {
          label: 'Password',
          type: 'password',
        },
      },
      async authorize(credentials) {
        if (!credentials) {
          throw new Error('Please enter email and password');
        }

        // Validate the raw credentials against the shared contract
        // before hitting the backend.
        const request = LoginRequestSchema.safeParse(credentials);
        if (!request.success) {
          throw new Error('Please enter a valid email and password');
        }

        const response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request.data),
          cache: 'no-store',
        });

        const body = (await response.json().catch(() => null)) as unknown;

        // One envelope for success and failure — parse it once.
        const result = LoginResponseSchema.safeParse(body);
        if (!result.success) {
          throw new Error(
            response.ok
              ? 'Authentication service returned an invalid response'
              : 'Unable to reach the authentication service',
          );
        }

        if (!result.data.success) {
          throw new Error(result.data.message || 'Invalid email or password');
        }

        const { accessToken, user } = result.data;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          accessToken,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.accessToken = user.accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id!;
      session.accessToken = token.accessToken;
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    // 14 days — always shorter than the backend token's 15-day life, so the
    // session cookie never outlives the access token it carries (which would
    // leave users "logged in" while every API call 401s).
    maxAge: 14 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
};