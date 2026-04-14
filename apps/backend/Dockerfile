FROM node:20-slim

# Install OpenSSL (required for Prisma)
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy prisma schema and generate client
COPY prisma ./prisma
RUN npx prisma generate

# Copy the rest of the source code
COPY . .

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 3001

# Run migrations and start the server
CMD ["/bin/sh", "-c", "sed -i 's/__PORT__/'\"$PORT\"'/g' /etc/nginx/nginx.conf && sed -i 's|__API_URL__|'\"$API_URL\"'|g' /etc/nginx/nginx.conf && nginx -g 'daemon off;'"]
