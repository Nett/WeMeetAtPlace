# Build from monorepo root: docker build -f apps/user/Dockerfile -t <image> .
FROM node:24-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build:user

FROM node:24-alpine AS production
WORKDIR /app
COPY --from=build /app/apps/user/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./

CMD ["node", "dist/apps/user/src/main.js"]
