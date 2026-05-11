import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db";
import {
  accounts,
  profiles,
  sessions,
  users,
  verificationTokens,
} from "@/lib/db/schema";

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [
    Resend({
      apiKey: process.env.AUTH_RESEND_KEY,
      from: process.env.AUTH_RESEND_FROM,
    }),
  ],
  pages: {
    signIn: "/login",
    verifyRequest: "/login?check-email=1",
  },
  session: { strategy: "database" },
  callbacks: {
    session({ session, user }) {
      if (user?.id) session.user.id = user.id;
      return session;
    },
  },
  events: {
    createUser: async ({ user }) => {
      if (user.id && user.email) {
        await db
          .insert(profiles)
          .values({ id: user.id, email: user.email })
          .onConflictDoNothing();
      }
    },
  },
});
