# RupZone Automation System

Self-hosted, multi-business customer-automation platform (Facebook comments,
Messenger, WhatsApp) built in phases. See the build brief and blueprint for
full architecture and rules; this README covers local setup.

## Status: Phase 0 — Foundation

What exists so far:
- Monorepo (pnpm workspaces): `apps/dashboard` (Next.js), `apps/backend` (Fastify)
- Shared packages: `@rupzone/ai-client` (Kimi → GPT-4o-mini fallback wrapper),
  `@rupzone/db` (Supabase client + business_id-scoped query helpers),
  `@rupzone/shared-types`
- Supabase schema migration: `supabase/migrations/0001_init_schema.sql`
- Dashboard `/setup` page to create businesses and enter their Facebook,
  WhatsApp, and OpenRouter tokens (stored in the `businesses` table — never
  hardcoded)
- `docker-compose.yml` running `redis`, `backend`, `dashboard` with
  `restart: unless-stopped`

Not yet built: webhooks, comment engine, agent, bulk/lead automation,
dashboard pages beyond Setup. Those land in later phases.

## Rules this codebase follows

1. Every table has `business_id`; every query filters by it.
2. No hardcoded secrets — business tokens live in the `businesses` table,
   entered via the dashboard. Only infra-level values (`DATABASE_URL`,
   `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `REDIS_URL`) go in `.env`.
3. All AI calls go through `aiClient.complete()` (`packages/ai-client`).
   Never call a model provider directly anywhere else.
4. Comment moderation: abuse→delete, negative/spam→hide (never delete),
   price→reply+private_reply, normal→nothing.
5. Every action is logged for audit + undo.
6. Modular — one module's code must not entangle another's.
7. Single operator, simple auth.
8. Official APIs only (Meta Graph API, WhatsApp Cloud API).

## Local development

```bash
cp .env.example .env
# fill in SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY

pnpm install

# apply the schema to your Supabase project (via SQL editor or CLI)
# supabase/migrations/0001_init_schema.sql

pnpm dev:backend     # Fastify on :4000  (GET /health)
pnpm dev:dashboard   # Next.js on :3000  (/setup)
```

## Docker

```bash
docker compose up --build
```

Runs Redis, backend, and dashboard together with `restart: unless-stopped`.
