import { prisma } from "@repo/database";
import CredentialsProvider from "next-auth/providers/credentials";
import genrateToken from "../../../utils/auth.ts";
import bcrypt from "bcrypt";
import NextAuth from "next-auth";

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",

      credentials: {
        username: {
          label: "Email",
          type: "text",
          placeholder: "Enter your email",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "Enter your password",
        },
      },
      async authorize(credentials: any, req: any) {
        const user = await prisma.user.findUnique({
          email: credentials?.username,
        });

        if (!user) {
          return null;
        }

        const passwordMatch = await bcrypt.compare(
          user?.password,
          credentials?.password,
        );

        if (passwordMatch) {
          const token = genrateToken(user.id);
          return token;
        }
      },
    }),
  ],
});
