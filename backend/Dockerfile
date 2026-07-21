# ------------------- Stage 1: Dependency & Test Stage -------------------
FROM node:21-alpine AS dependencies

WORKDIR /app

# Copy package manifests for efficient layer caching
COPY package*.json ./

# Install clean production dependencies
RUN npm ci

# ------------------- Stage 2: Final Production Image -------------------
FROM node:21-alpine

WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Copy node_modules and app code from dependencies stage
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

# Security Hardening: Do NOT run container as root (Trivy compliance)
USER node

EXPOSE 8080

CMD ["node", "server.js"]