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
    // Only include Google provider if credentials are configured
    ...(process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_CLIENT_ID !== "your-google-client-id"
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
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

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isCorrectPassword) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.picture = user.image;
      }

      // Fetch schoolId based on user role
      if (token.id && token.role) {
        try {
          if (token.role === "ADMIN") {
            const admin = await prisma.administrator.findUnique({
              where: { userId: token.id as string },
              select: { schoolId: true },
            });
            token.schoolId = admin?.schoolId;
          } else if (token.role === "TEACHER") {
            const teacher = await prisma.teacher.findUnique({
              where: { userId: token.id as string },
              select: { schoolId: true },
            });
            token.schoolId = teacher?.schoolId;
          } else if (token.role === "STUDENT") {
            const student = await prisma.student.findUnique({
              where: { userId: token.id as string },
              select: { schoolId: true },
            });
            token.schoolId = student?.schoolId;
          }
        } catch (error) {
          console.error("Error fetching schoolId:", error);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
        session.user.id = token.id;
        session.user.image = token.picture as string;
        session.user.schoolId = token.schoolId as number | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
