# Stap 1: bouw de React app
FROM node:20-alpine AS builder

WORKDIR /app

# Kopieer package bestanden en installeer dependencies
COPY package*.json ./
RUN npm ci
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
# Kopieer de rest van de broncode en bouw
COPY . .
RUN npm run build

# Stap 2: serveer de gebouwde bestanden met nginx
FROM nginx:alpine

# Kopieer de gebouwde app naar nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Kopieer nginx configuratie
COPY nginx.conf /etc/nginx/nginx.conf

# Railway injecteert $PORT dynamisch bij elke start
CMD ["/bin/sh", "-c", "sed -i 's/__PORT__/'\"$PORT\"'/g' /etc/nginx/nginx.conf && nginx -g 'daemon off;'"]
