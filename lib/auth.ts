import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import type { Adapter } from "next-auth/adapters";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_CLIENT_ID !== "your-google-client-id"
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          }),
        ]
      : []),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user || !user.password) throw new Error("Invalid credentials");

        const ok = await bcrypt.compare(credentials.password, user.password);
        if (!ok) throw new Error("Invalid credentials");

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role ?? "STUDENT",
          image: user.image,
        } as unknown as {
          id: string;
          email: string;
          name?: string;
          role: string;
          image?: string;
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      try {
        if (account?.provider === "google") {
          // For OAuth flows the `user.id` may not be available yet when
          // signIn runs (or for new users). Use the email address as a
          // reliable identifier to determine whether we already have a user
          // record and whether that record is associated with a school.
          const email = (user as unknown as { email?: string })?.email;
          if (!email) return true;

          try {
            // Find existing user by email (if any)
            const existingUser = await prisma.user.findUnique({
              where: { email },
              select: { id: true },
            });

            if (!existingUser) {
              // No user exists yet for this email — allow NextAuth to create
              // the user record (do not redirect). The jwt callback will be
              // invoked with isNewUser and we set needsRoleConfirmation there.
              console.debug(
                "Google signIn: no existing user, allowing creation for",
                email
              );
              return true;
            }

            const uid = existingUser.id;
            const [admin, teacher, student] = await Promise.all([
              prisma.administrator.findUnique({
                where: { userId: uid },
                select: { id: true, schoolId: true },
              }),
              prisma.teacher.findUnique({
                where: { userId: uid },
                select: { id: true, schoolId: true },
              }),
              prisma.student.findUnique({
                where: { userId: uid },
                select: { id: true, schoolId: true },
              }),
            ]);

            const hasValidRoleAndSchool =
              (!!admin && !!admin.schoolId) ||
              (!!teacher && !!teacher.schoolId) ||
              (!!student && !!student.schoolId);

            if (!hasValidRoleAndSchool) {
              return "/auth/confirm-role";
            }
          } catch (e) {
            console.error("signIn google-check error:", e);
            // Allow sign-in to proceed on error to avoid blocking users.
            return true;
          }
        }
      } catch (e) {
        console.error("signIn callback error:", e);
      }
      return true;
    },
    async jwt({ token, user, account, isNewUser }) {
      if (user) {
        const u = user as unknown as {
          role?: string;
          id?: string;
          image?: string;
        };
        if (u.role) token.role = u.role;
        if (u.id) token.id = u.id;
        if (u.image) token.picture = u.image;
      }

      if (account?.provider === "google" && isNewUser) {
        token.needsRoleConfirmation = true;
      }

      if (token.id && token.role) {
        try {
          if (token.role === "ADMIN") {
            const rec = await prisma.administrator.findUnique({
              where: { userId: token.id as string },
              select: { schoolId: true },
            });
            token.schoolId = rec?.schoolId;
          } else if (token.role === "TEACHER") {
            const rec = await prisma.teacher.findUnique({
              where: { userId: token.id as string },
              select: { schoolId: true },
            });
            token.schoolId = rec?.schoolId;
          } else if (token.role === "STUDENT") {
            const rec = await prisma.student.findUnique({
              where: { userId: token.id as string },
              select: { schoolId: true },
            });
            token.schoolId = rec?.schoolId;
          }
        } catch (e) {
          console.error("Error populating schoolId in jwt callback:", e);
        }
      }

      // Ensure we have a profile picture on the token: if not set yet, try
      // to load it from the database (adapter may have saved the provider
      // profile image on the user record).
      try {
        if (token.id && !token.picture) {
          const u = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { image: true },
          });
          if (u?.image) token.picture = u.image;
        }
      } catch (e) {
        console.error("Error fetching user image in jwt callback:", e);
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        // Default to role from token, but we'll try to load the authoritative
        // role from the database below so changes take effect immediately
        // without requiring a user sign-out/sign-in.
        session.user.role = token.role as string;
        session.user.image = token.picture as string | undefined;
        session.user.schoolId = token.schoolId as number | undefined;
        session.user.needsRoleConfirmation = token.needsRoleConfirmation as
          | boolean
          | undefined;
      }

      // (image fetch moved to jwt callback)

      // If the token/session didn't mark needsRoleConfirmation but the user
      // has the default STUDENT role and no matching role record, prompt
      // them to confirm their role. This handles cases where the adapter or
      // DB default already set role=STUDENT for OAuth-created users.
      try {
        // Load authoritative role and role record (administrator/teacher/student)
        // from the database every time the session is constructed. This
        // ensures that a role update (made via the confirm-role API) is
        // reflected immediately when the client re-requests the session.
        if (session.user?.id) {
          const userId = session.user.id;
          const [admin, teacher, student] = await Promise.all([
            prisma.administrator.findUnique({
              where: { userId },
              select: { id: true, schoolId: true },
            }),
            prisma.teacher.findUnique({
              where: { userId },
              select: { id: true, schoolId: true },
            }),
            prisma.student.findUnique({
              where: { userId },
              select: { id: true, schoolId: true },
            }),
          ]);

          if (admin) {
            session.user.role = "ADMIN";
            session.user.schoolId = admin.schoolId;
            // If the role record exists but isn't associated with a school,
            // require confirmation so the admin can pick the correct school.
            session.user.needsRoleConfirmation = !admin.schoolId;
            const _su = session.user as unknown as { [k: string]: unknown };
            _su["roleCheckComplete"] = true;
          } else if (teacher) {
            session.user.role = "TEACHER";
            session.user.schoolId = teacher.schoolId;
            session.user.needsRoleConfirmation = !teacher.schoolId;
            const _su = session.user as unknown as { [k: string]: unknown };
            _su["roleCheckComplete"] = true;
          } else if (student) {
            session.user.role = "STUDENT";
            session.user.schoolId = student.schoolId;
            session.user.needsRoleConfirmation = !student.schoolId;
            const _su = session.user as unknown as { [k: string]: unknown };
            _su["roleCheckComplete"] = true;
          } else {
            // No role records found. If token or DB default set role to STUDENT
            // treat this as needing confirmation.
            if (session.user.role === "STUDENT") {
              session.user.needsRoleConfirmation = true;
            }
            // We still mark role check complete even when no role records
            // were found so clients know the DB check finished.
            const _su = session.user as unknown as { [k: string]: unknown };
            _su["roleCheckComplete"] = true;
          }
        }
      } catch (e) {
        console.error("Error checking role records in session callback:", e);
      }

      if (process.env.NODE_ENV !== "production") {
        try {
          console.debug("NextAuth session callback returning user:", {
            id: session.user?.id,
            email: session.user?.email,
            name: session.user?.name,
            image: session.user?.image,
            needsRoleConfirmation: session.user?.needsRoleConfirmation,
            role: session.user?.role,
          });
        } catch {
          // ignore
        }
      }

      return session;
    },
  },

  events: {
    signIn: async ({
      user,
      account,
      isNewUser,
    }: {
      user?: unknown;
      account: { provider?: string } | null;
      isNewUser?: boolean;
    }) => {
      const uid = (user as unknown as { id?: string })?.id;
      console.info("NextAuth signIn event:", {
        provider: account?.provider,
        userId: uid,
        isNewUser,
      });
    },
    createUser: async ({ user }: { user?: unknown }) => {
      const u = user as unknown as { id?: string; email?: string };
      console.info("NextAuth createUser event:", { id: u.id, email: u.email });
    },
  },

  logger: {
    error(code, metadata) {
      console.error("NextAuth error:", code, metadata);
    },
    warn(code) {
      console.warn("NextAuth warn:", code);
    },
    debug(code, metadata) {
      console.debug("NextAuth debug:", code, metadata);
    },
  },

  pages: { signIn: "/auth/signin" },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
};

export default authOptions;
