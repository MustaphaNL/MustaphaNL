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
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
