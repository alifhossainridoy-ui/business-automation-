FROM node:20-alpine

WORKDIR /app

RUN npm install -g pnpm

COPY pnpm-workspace.yaml package.json ./
COPY apps/backend/package.json apps/backend/package.json
COPY packages/ai-client/package.json packages/ai-client/package.json
COPY packages/db/package.json packages/db/package.json
COPY packages/shared-types/package.json packages/shared-types/package.json

RUN pnpm install --frozen-lockfile=false

COPY tsconfig.base.json ./
COPY apps/backend apps/backend
COPY packages packages

WORKDIR /app/apps/backend
CMD ["pnpm", "start"]
