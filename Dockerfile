FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:18-alpine AS runner

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 automation

COPY --from=builder --chown=automation:nodejs /app/package*.json ./
COPY --from=builder --chown=automation:nodejs /app/dist ./dist
COPY --from=builder --chown=automation:nodejs /app/node_modules ./node_modules

USER automation

EXPOSE 3000

ENV NODE_ENV=production

CMD ["node", "dist/index.js"]