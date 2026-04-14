FROM node:20-alpine AS builder

WORKDIR /app

COPY apps/frontend/package*.json ./
RUN npm ci

COPY packages/shared /packages/shared

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

COPY apps/frontend/ .
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

COPY apps/frontend/nginx.conf /etc/nginx/nginx.conf

CMD ["nginx", "-g", "daemon off;"]
