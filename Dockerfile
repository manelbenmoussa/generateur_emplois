# Multi-stage Dockerfile for Next.js + Prisma
# Builds app in 'builder' stage (including prisma client generation) and
# produces a slim production image in 'runner' stage.

FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
# Copy package manifests first for better cache when deps don't change
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps --no-audit --progress=false

FROM deps AS builder
COPY . .
# Ensure prisma client is generated (prisma is a devDependency)
RUN npx prisma generate || true
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
# Copy only what's needed for production
COPY --from=builder /app/.next .next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
# Install only production deps
RUN npm ci --only=production --no-audit --progress=false

EXPOSE 3000
CMD ["npm", "start"]
