import { PrismaClient } from "@prisma/client";

// Construct PrismaClient with either Accelerate (accelerateUrl) or a direct
// adapter connection. The exact constructor options shape depends on the
// installed Prisma Client version; to avoid tight coupling with a specific
// typings shape we use a small `any` cast here.
const clientOptions: Record<string, unknown> = {};

if (process.env.PRISMA_ACCELERATE_URL) {
  clientOptions.accelerateUrl = process.env.PRISMA_ACCELERATE_URL;
} else if (process.env.DATABASE_URL) {
  // Instead of passing a plain `adapter` object (which the runtime may try
  // to call `.connect()` on), provide a datasource override. This lets the
  // generated Prisma client use the provided database URL at runtime without
  // requiring a driver adapter implementation.
  clientOptions.datasources = {
    db: { url: process.env.DATABASE_URL },
  };

  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.info(
      "Prisma configured with runtime datasource override (DATABASE_URL)"
    );
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Cast the constructor to accept a loose `unknown` options shape to avoid
// tight coupling with generated Prisma types while still passing runtime
// options when available.
const PrismaClientCtor = PrismaClient as unknown as new (
  opts?: unknown
) => PrismaClient;

export const prisma =
  globalForPrisma.prisma ?? new PrismaClientCtor(clientOptions);
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
