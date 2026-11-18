import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { dbConnect } from "./db";
import { User } from "@/models";

export type Role = "ADMIN" | "EDITOR" | "SUPPORT" | "STUDENT";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 14 },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Email",
      credentials: { email: { label: "Email", type: "email" }, password: { label: "Password", type: "password" } },
      async authorize(creds) {
        const email = String(creds?.email ?? "").toLowerCase().trim();
        const password = String(creds?.password ?? "");
        if (!email || !password) return null;
        await dbConnect();
        const user = await User.findOne({ email }).select("+passwordHash").lean<any>();
        if (!user || !(await bcrypt.compare(password, user.passwordHash))) return null;
        return { id: String(user._id), name: user.name, email: user.email, role: user.role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
};

export type SessionUser = { id: string; name: string; email: string; role: Role };

export async function getUser(): Promise<SessionUser | null> {
  const s = await getServerSession(authOptions);
  return (s?.user as SessionUser) ?? null;
}

export const STAFF: Role[] = ["ADMIN", "EDITOR", "SUPPORT"];

/** Throws a Response-like error object for API handlers when the role is not allowed. */
export async function requireRole(roles: Role[]) {
  const user = await getUser();
  if (!user || !roles.includes(user.role)) {
    throw new HttpError(user ? 403 : 401, user ? "You don't have access to this section." : "Please sign in.");
  }
  return user;
}

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}
