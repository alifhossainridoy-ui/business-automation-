import type { Business } from "@rupzone/shared-types";
import { debugToken } from "@rupzone/meta-client";
import { getPhoneNumberQuality } from "@rupzone/whatsapp-client";
import { reportError } from "@rupzone/notify";

const EXPIRY_WARNING_DAYS = 7;

export interface TokenHealth {
  configured: boolean;
  valid: boolean | null;
  /** Days until expiry; null if unknown, "never" if the token doesn't expire. */
  daysLeft: number | "never" | null;
  error?: string;
}

export interface BusinessHealth {
  business: Business;
  fbToken: TokenHealth;
  waToken: TokenHealth;
  waQuality: string | null;
}

interface AlertEnv {
  metaAppId: string;
  metaAppSecret: string;
  telegramBotToken: string;
  telegramChatId: string;
}

/**
 * Runs at Health-page render time (no scheduled job, per the decision to
 * keep this live-checked) — calls Graph API for whichever tokens are
 * configured, and pages Telegram immediately for anything that needs the
 * operator's attention. reportError's own cooldown keeps a refresh-heavy
 * operator from getting paged repeatedly for the same issue.
 */
export async function checkBusinessHealth(
  business: Business,
  env: AlertEnv
): Promise<BusinessHealth> {
  const [fbToken, waToken, waQuality] = await Promise.all([
    checkToken("Facebook Page", business.fb_page_token, business, "health-fb-token", env),
    checkToken("WhatsApp", business.wa_token, business, "health-wa-token", env),
    checkQuality(business, env),
  ]);

  return { business, fbToken, waToken, waQuality };
}

async function checkToken(
  label: string,
  token: string | null,
  business: Business,
  source: string,
  env: AlertEnv
): Promise<TokenHealth> {
  if (!token) return { configured: false, valid: null, daysLeft: null };

  if (!env.metaAppId || !env.metaAppSecret) {
    return {
      configured: true,
      valid: null,
      daysLeft: null,
      error: "META_APP_ID / META_APP_SECRET not set — cannot check",
    };
  }

  try {
    const result = await debugToken(token, env.metaAppId, env.metaAppSecret);
    const daysLeft: number | "never" | null =
      result.expiresAt === null ? null : result.expiresAt === 0 ? "never" : daysUntil(result.expiresAt);

    if (!result.isValid) {
      await alert(env, source, business, `${label} token is invalid`);
    } else if (typeof daysLeft === "number" && daysLeft <= EXPIRY_WARNING_DAYS) {
      await alert(
        env,
        source,
        business,
        `${label} token expires in ${Math.max(0, Math.round(daysLeft))} day(s)`
      );
    }

    return { configured: true, valid: result.isValid, daysLeft };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await alert(env, source, business, `${label} token check failed: ${message}`);
    return { configured: true, valid: null, daysLeft: null, error: message };
  }
}

async function checkQuality(business: Business, env: AlertEnv): Promise<string | null> {
  if (!business.wa_token || !business.wa_phone_id) return null;

  try {
    const { qualityRating } = await getPhoneNumberQuality(business.wa_phone_id, business.wa_token);
    if (qualityRating === "RED" || qualityRating === "YELLOW") {
      await alert(env, "health-wa-quality", business, `WhatsApp quality rating dropped to ${qualityRating}`);
    }
    return qualityRating;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await alert(env, "health-wa-quality", business, `WhatsApp quality check failed: ${message}`);
    return null;
  }
}

function daysUntil(expiresAtUnixSeconds: number): number {
  return (expiresAtUnixSeconds * 1000 - Date.now()) / (1000 * 60 * 60 * 24);
}

function alert(env: AlertEnv, source: string, business: Business, message: string): Promise<void> {
  return reportError({
    source,
    message: `${business.name}: ${message}`,
    business_id: business.id,
    botToken: env.telegramBotToken,
    chatId: env.telegramChatId,
  });
}
