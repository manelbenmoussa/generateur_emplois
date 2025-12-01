/**
 * Prisma configuration for Migrate and connection URLs.
 *
 * This file centralizes connection URLs for Prisma Migrate and documents an
 * optional Accelerate URL. The Prisma CLI / Migrate tooling (Prisma v7+)
 * expects the connection information to be provided here rather than in
 * the `schema.prisma` datasource `url` attribute.
 *
 * Set environment variables in your environment or .env file:
 * - DATABASE_URL: connection string for direct DB connections (used for migrate)
 * - PRISMA_ACCELERATE_URL: connection URL for Prisma Accelerate (if used)
 */

export const prismaConfig = {
  migrate: {
    // Migrate will read this value for schema migrations
    url: process.env.DATABASE_URL || "",
  },
  // Optional: Prisma Accelerate (if you use it, set PRISMA_ACCELERATE_URL)
  accelerateUrl: process.env.PRISMA_ACCELERATE_URL || undefined,
};

export default prismaConfig;
