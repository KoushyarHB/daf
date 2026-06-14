import type { NextAuthConfig } from "next-auth";

import type { UserRole } from "@/lib/auth/roles";

/** Edge-safe config — no Prisma, bcrypt, or credential providers. */
export const authConfig = {
  secret:
    process.env.AUTH_SECRET ??
    (process.env.NODE_ENV === "development"
      ? "dev-auth-secret-not-for-production"
      : undefined),
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) {
        token.sub = user.id;
      }
      if (user?.role) {
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      if (session.user && token.role) {
        session.user.role = token.role as UserRole;
      }
      return session;
    },
  },
  trustHost: true,
} satisfies NextAuthConfig;
