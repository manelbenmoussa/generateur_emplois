import { PrismaClient } from "@prisma/client";

// Use globalThis to store the Prisma client in development so hot-reload
// doesn't create new clients and exhaust DB connections.
const anyGlobal = globalThis as unknown as { __prisma?: PrismaClient };

const prisma = anyGlobal.__prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  anyGlobal.__prisma = prisma;
}

export default prisma;
