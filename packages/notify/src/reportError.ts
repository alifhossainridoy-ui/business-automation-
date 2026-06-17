import { insertErrorLog } from "@rupzone/db";
import { sendTelegramAlert } from "./telegram";

export interface ReportErrorOptions {
  source: string;
  message: string;
  business_id?: string | null;
  botToken: string;
  chatId: string;
}

const ALERT_COOLDOWN_MS = 15 * 60 * 1000;
const lastAlertAt = new Map<string, number>();

/**
 * Always writes to error_log; only pages Telegram once per distinct
 * source+message per cooldown window, so a sustained outage throwing the
 * same error repeatedly doesn't flood the chat.
 */
export async function reportError(options: ReportErrorOptions): Promise<void> {
  const { source, message, business_id, botToken, chatId } = options;

  await insertErrorLog({ business_id: business_id ?? null, source, message }).catch((err) => {
    console.error("Failed to write error_log:", err);
  });

  const key = `${source}:${message}`;
  const now = Date.now();
  const last = lastAlertAt.get(key);
  if (last && now - last < ALERT_COOLDOWN_MS) return;
  lastAlertAt.set(key, now);

  await sendTelegramAlert(`[RupZone] ${source}: ${message}`, botToken, chatId).catch((err) => {
    console.error("Failed to send Telegram alert:", err);
  });
}
