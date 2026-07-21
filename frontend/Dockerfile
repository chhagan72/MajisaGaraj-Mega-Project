# # ------------------- Stage 1: Build Stage ------------------------------
# FROM node:21 AS frontend-builder

# # Set the working directory to /app
# WORKDIR /app

# # Copy the package.json and package-lock.json for dependency installation
# COPY package*.json ./

# # Install dependencies
# RUN npm install

# # Copy the rest of the application code
# COPY . .

# # ------------------- Stage 2: Final Stage ------------------------------
# FROM node:21-slim

# # Set the working directory to /app
# WORKDIR /app

# # Copy built assets and dependencies from frontend-builder stage
# COPY --from=frontend-builder /app .

# # Copy the .env.sample file to .env.local
# COPY .env.docker .env.local

# # Expose port 5173 for the Node.js application
# EXPOSE 5173

# # Define the default command to run the application in development mode
# CMD ["npm", "start"]

# ------------------- Stage 1: Build Stage -------------------
# ------------------- Stage 1: Build Stage -------------------
# Upgrade from Node 21 to Node 22 (LTS) to satisfy Vite 8 requirements
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency files first
COPY package*.json ./

# RUN npm ci ensures native bindings for Alpine (musl) are resolved cleanly
RUN npm ci

COPY . .

# Build static assets (Outputs to /app/dist)
RUN npm run build

# ------------------- Stage 2: Web Server Stage -------------------
FROM nginx:alpine

# If you prefer listening on 5173 inside Nginx:
RUN sed -i 's/listen       80;/listen       5173;/g' /etc/nginx/conf.d/default.conf

# Copy static files built from Stage 1
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 5173

CMD ["nginx", "-g", "daemon off;"]