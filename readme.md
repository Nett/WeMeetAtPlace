# Instructions

## Monorepo structure

- `apps/server` – main NestJS app (views, API)
- `apps/user` – user service (placeholder)
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
pnpm dev:user     # user on :3001
```

## Migrations (user app)

Generate a migration from entity changes. The migration name (e.g. `AddUserProfile`) is a descriptive label you choose based on the changes applied to your entities:

```bash
npm run migration:generate:user -- apps/user/migrations/AddUserProfile
```

Apply migrations:

```bash
npm run migration:run:user
```

Revert the last migration:

```bash
npm run migration:revert:user
```