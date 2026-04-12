
FROM node:20-alpine AS builder

WORKDIR /app

# Copy shared package for type resolution
COPY packages/shared /packages/shared

# Install backend deps
COPY apps/backend/package.json ./
RUN npm install

# Copy backend source
COPY apps/backend/tsconfig.json ./
COPY apps/backend/prisma ./prisma/
COPY apps/backend/src ./src/

RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

COPY apps/backend/package.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY apps/backend/prisma ./prisma/

RUN mkdir -p /app/uploads

COPY apps/backend/entrypoint.sh ./
RUN chmod +x entrypoint.sh

EXPOSE 3001

CMD ["./entrypoint.sh"]
