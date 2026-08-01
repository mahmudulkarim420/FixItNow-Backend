FROM node:22-alpine

WORKDIR /app

# Install OpenSSL for Prisma engine compatibility
RUN apk add --no-cache openssl

# Enable pnpm via Corepack
RUN corepack enable

# Copy dependency definition files and install dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

# Copy project source files
COPY . .

# Generate Prisma client & build production bundle
RUN pnpm run build

# Default environment port
EXPOSE 5000

# Execute database migrations and start application server
CMD ["sh", "-c", "pnpm run migrate && node dist/server.js"]
