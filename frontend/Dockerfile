FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json ./
# Copy workspace definitions
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

RUN npm ci

COPY . .

# Build frontend
WORKDIR /app/frontend
RUN npm run build

# Production Nginx image
FROM nginx:alpine AS production

# Copy custom nginx config
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copy static build assets
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
