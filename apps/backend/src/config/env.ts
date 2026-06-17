/**
 * Infra/app-level env only. Per-business secrets (Facebook Page token,
 * WhatsApp token, OpenRouter key) live in the `businesses` table, never here.
 *
 * metaAppSecret / metaWebhookVerifyToken are an exception worth noting: they
 * belong to the single Meta App this whole system is registered under, not
 * to any one business's Page — every business's Page webhook is verified
 * with the same app-level secret, so they're infra config, not tenant data.
 */
export const env = {
  port: Number(process.env.BACKEND_PORT ?? 4000),
  redisUrl: process.env.REDIS_URL ?? "redis://localhost:6379",
  supabaseUrl: process.env.SUPABASE_URL ?? "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  metaAppSecret: process.env.META_APP_SECRET ?? "",
  metaWebhookVerifyToken: process.env.META_WEBHOOK_VERIFY_TOKEN ?? "",
  // Operator's own Telegram bot — single alert channel for every business
  // (Phase 4), not a per-business credential.
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN ?? "",
  telegramChatId: process.env.TELEGRAM_CHAT_ID ?? "",
};
