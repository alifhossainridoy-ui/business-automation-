FROM node:20-alpine AS base

WORKDIR /app

RUN npm install -g pnpm

COPY pnpm-workspace.yaml package.json ./
COPY apps/dashboard/package.json apps/dashboard/package.json
COPY packages/db/package.json packages/db/package.json
COPY packages/shared-types/package.json packages/shared-types/package.json

RUN pnpm install --frozen-lockfile=false

COPY tsconfig.base.json ./
COPY apps/dashboard apps/dashboard
COPY packages packages

WORKDIR /app/apps/dashboard
RUN pnpm build

EXPOSE 3000
CMD ["pnpm", "start"]
