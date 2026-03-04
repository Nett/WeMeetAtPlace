# Instructions

## Monorepo structure

- `apps/server` – main NestJS app (views, API)
- `apps/auth` – auth service (placeholder)
- `libs/postgres` – shared Postgres module

## Backend setup

### Install pnpm ([visit site for alternatives](https://pnpm.io/installation))
```bash
npm install -g pnpm@latest-10
```

### Install NestJs cli

```bash
pnpm i -g @nestjs/cli
```

### Install dependencies and run

```bash
pnpm install
pnpm dev:server    # server on :3000
pnpm dev:auth      # auth on :3001
```