/**
 * Infra-level env only (DB/Redis connection info). Per-business secrets
 * (Facebook, WhatsApp, OpenRouter tokens) live in the `businesses` table,
 * never here.
 */
export const env = {
  port: Number(process.env.BACKEND_PORT ?? 4000),
  redisUrl: process.env.REDIS_URL ?? "redis://localhost:6379",
  supabaseUrl: process.env.SUPABASE_URL ?? "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
};
