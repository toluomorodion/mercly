import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { db } from "./db";
import { z } from "zod";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = String(credentials.email);
        const password = String(credentials.password);

        const user = await db.user.findUnique({
          where: { email }
        });

        if (!user) {
          return null;
        }

        const passwordsMatch = await bcrypt.compare(password, user.passwordHash);

        if (!passwordsMatch) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          businessName: user.businessName
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.businessName = (user as any).businessName as string;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = (token as any).userId as string;
        session.user.businessName = (token as any).businessName as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth?mode=login',
  },
});

export const getSession = async () => {
  const session = await auth();
  return session;
};
