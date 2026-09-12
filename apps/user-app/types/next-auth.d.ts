import { DefaultSession } from 'next-auth';

// NextAuth JWT-session augmentation.
// Extends the default session/user/token shapes with the fields the app
// actually carries: a backend user `id` and the opaque `accessToken`
// issued by the bank-webhook `/auth/login` endpoint.
declare module 'next-auth' {
  interface Session {
    /** Opaque JWT issued by the bank-webhook backend. */
    accessToken?: string;
    user: {
      id: string;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    /** Opaque JWT issued by the bank-webhook backend. */
    accessToken?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    accessToken?: string;
  }
}