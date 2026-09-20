# Production Dockerfile for WebRunzo Unified Google Cloud Run Deployment
FROM node:22-slim

WORKDIR /app

# Install build essentials for native packages if needed
RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

# Copy package manifests
COPY package.json package-lock.json ./

# Install all dependencies (including devDependencies required for vite build and esbuild)
RUN npm install

# Copy application source code
COPY . .

# Set production environment and build the unified bundle
ENV NODE_ENV=production
RUN npm run build

# Cloud Run injects PORT at runtime (defaults to 8080 or 3000)
ENV PORT=3000
EXPOSE 3000

# Launch the compiled CommonJS server
CMD ["node", "dist/server.cjs"]
