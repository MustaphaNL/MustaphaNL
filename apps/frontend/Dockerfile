FROM node:20-alpine AS builder

WORKDIR /app

# Copy shared package (Docker context is repo root)
COPY packages/shared /packages/shared

# Install deps
COPY apps/frontend/package.json ./
RUN npm install

# Copy frontend source
COPY apps/frontend/. .

# Build args
ARG VITE_API_URL=http://localhost:3001
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

FROM nginx:1.25-alpine AS runner

COPY --from=builder /app/dist /usr/share/nginx/html
# Place config in /templates so nginx's docker-entrypoint runs envsubst on $PORT
COPY apps/frontend/nginx.conf /etc/nginx/templates/default.conf.template

# Railway injects PORT; fall back to 80 for local Docker use
ENV PORT=80

CMD ["nginx", "-g", "daemon off;"]
