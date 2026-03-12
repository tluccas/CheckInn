# Build
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
RUN npm run build

# Prod
FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist

EXPOSE 3000

COPY --from=build /app/src/config/typeorm.config.ts ./src/config/typeorm.config.ts
COPY --from=build /app/src/migrations ./src/migrations
COPY --from=build /app/tsconfig.json ./tsconfig.json

EXPOSE 3000

CMD ["node", "dist/main"]
