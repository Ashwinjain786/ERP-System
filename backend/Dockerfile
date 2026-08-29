FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json ./
# Copy workspace definitions
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

# Install dependencies (respects workspaces)
RUN npm ci

# Copy entire source code
COPY . .

# Generate Prisma Client & Build
WORKDIR /app/backend
RUN npx prisma generate
RUN npm run build

# Production image
FROM node:20-alpine AS production
WORKDIR /app

# Copy node_modules and built assets
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/backend/package.json ./backend/
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/prisma ./backend/prisma
COPY --from=builder /app/backend/prisma7.config.ts ./backend/prisma7.config.ts

ENV NODE_ENV=production
WORKDIR /app/backend

# Ensure database schema is pushed, then start API
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && node dist/index.js"]
