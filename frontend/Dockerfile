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
FROM node:21-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Compile Vite React app to static bundle in /app/dist
RUN npm run build

# ------------------- Stage 2: Web Server Stage -------------------
FROM nginx:alpine

# Copy custom/default Nginx configuration if needed
COPY --from=builder /app/dist /usr/share/nginx/html

# Security Hardening: Change ownership so Nginx can run securely
RUN chown -R nginx:nginx /usr/share/nginx/html /var/cache/nginx /var/log/nginx

EXPOSE 5173

CMD ["nginx", "-g", "daemon off;"]