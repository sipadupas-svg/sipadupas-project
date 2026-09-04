# ─── SIPADUPAS — Multi-stage Dockerfile ─────────────────────────────────
# Builder stage: install deps & build Next.js standalone
FROM oven/bun:1 AS builder

WORKDIR /app

# Install dependencies (use cache mount for faster rebuilds)
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy source and generate Prisma client
COPY prisma ./prisma/
RUN bunx prisma generate

# Copy everything else and build
COPY . .
RUN bun run build

# ─── Production stage ──────────────────────────────────────────────────
FROM oven/bun:1 AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Security: run as non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 sipadupas

# Copy standalone output from builder
COPY --from=builder --chown=sipadupas:nodejs /app/.next/standalone ./
COPY --from=builder --chown=sipadupas:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=sipadupas:nodejs /app/public ./public

# Copy Prisma schema and generated client (required for runtime DB access)
COPY --from=builder --chown=sipadupas:nodejs /app/prisma ./prisma
COPY --from=builder --chown=sipadupas:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=sipadupas:nodejs /app/node_modules/@prisma ./node_modules/@prisma

# Create db directory for SQLite and copy any seed DB files
RUN mkdir -p /app/db && chown sipadupas:nodejs /app/db
COPY --from=builder --chown=sipadupas:nodejs /app/db/ ./db/

USER sipadupas

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:3000/api || exit 1

CMD ["bun", "server.js"]
