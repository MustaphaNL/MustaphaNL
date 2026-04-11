# Stage 1: Build the React app
FROM node:18-alpine AS build
WORKDIR /app
COPY . .
WORKDIR /app/apps/frontend
RUN npm ci
RUN npx tsc --noEmit || true
RUN npx vite build

# Stage 2: Serve with nginx
FROM nginx:alpine
COPY --from=build /app/apps/frontend/dist /usr/share/nginx/html
COPY --from=build /app/apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
