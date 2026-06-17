import { listBusinesses, listRecentErrorLogs } from "@rupzone/db";
import { checkBusinessHealth, type BusinessHealth, type TokenHealth } from "./checks";

export const dynamic = "force-dynamic";

export default async function HealthPage() {
  const businesses = await listBusinesses();

  const env = {
    metaAppId: process.env.META_APP_ID ?? "",
    metaAppSecret: process.env.META_APP_SECRET ?? "",
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN ?? "",
    telegramChatId: process.env.TELEGRAM_CHAT_ID ?? "",
  };

  const [results, errors] = await Promise.all([
    Promise.all(businesses.map((business) => checkBusinessHealth(business, env))),
    listRecentErrorLogs(20),
  ]);

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-2xl font-semibold">Health</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Checked live on each page load — token validity/expiry via Graph
        API&apos;s debug_token, WhatsApp quality rating via the Cloud API.
        Anything that needs attention also pages the operator&apos;s
        Telegram bot.
      </p>
      {(!env.metaAppId || !env.metaAppSecret) && (
        <p className="mt-3 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          META_APP_ID / META_APP_SECRET not set — token checks are skipped.
        </p>
      )}
      {(!env.telegramBotToken || !env.telegramChatId) && (
        <p className="mt-3 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID not set — alerts are logged
          but not sent.
        </p>
      )}

      <div className="mt-8 space-y-6">
        {results.length === 0 && (
          <p className="text-center text-sm text-neutral-500">No businesses yet.</p>
        )}
        {results.map((result) => (
          <BusinessHealthCard key={result.business.id} result={result} />
        ))}
      </div>

      <section className="mt-12">
        <h2 className="text-lg font-medium">Recent errors</h2>
        <div className="mt-4 space-y-2">
          {errors.length === 0 && <p className="text-sm text-neutral-500">None logged.</p>}
          {errors.map((e) => (
            <div key={e.id} className="rounded-lg border border-neutral-200 p-3 text-sm">
              <div className="flex items-center justify-between text-xs text-neutral-500">
                <span>{e.source}</span>
                <span>{new Date(e.created_at).toLocaleString()}</span>
              </div>
              <div className="mt-1">{e.message}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function BusinessHealthCard({ result }: { result: BusinessHealth }) {
  const { business, fbToken, waToken, waQuality } = result;

  return (
    <div className="rounded-lg border border-neutral-200 p-5">
      <h3 className="font-medium">{business.name}</h3>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <TokenRow label="Facebook Page token" health={fbToken} />
        <TokenRow label="WhatsApp token" health={waToken} />
      </div>

      <div className="mt-3 text-sm">
        <span className="font-medium">WhatsApp quality: </span>
        <QualityBadge rating={waQuality} />
      </div>

      <div className="mt-3 text-sm text-neutral-600">
        <span className="font-medium text-neutral-900">AI: </span>
        Primary {business.ai_model} → fallback gpt-4o-mini (fixed) ·{" "}
        {business.openrouter_api_key ? "OpenRouter key configured" : "no OpenRouter key configured"}
      </div>
    </div>
  );
}

function TokenRow({ label, health }: { label: string; health: TokenHealth }) {
  if (!health.configured) {
    return (
      <div className="text-sm text-neutral-500">
        {label}: <span>not configured</span>
      </div>
    );
  }

  if (health.error) {
    return (
      <div className="text-sm text-amber-700">
        {label}: <span>{health.error}</span>
      </div>
    );
  }

  const expiry =
    health.daysLeft === "never"
      ? "no expiry"
      : typeof health.daysLeft === "number"
        ? `expires in ${Math.max(0, Math.round(health.daysLeft))}d`
        : "expiry unknown";

  return (
    <div className={`text-sm ${health.valid ? "text-neutral-700" : "text-red-700"}`}>
      {label}: {health.valid ? "valid" : "invalid"} · {expiry}
    </div>
  );
}

function QualityBadge({ rating }: { rating: string | null }) {
  if (!rating) return <span className="text-sm text-neutral-500">not configured</span>;
  const color =
    rating === "GREEN"
      ? "text-green-700"
      : rating === "YELLOW"
        ? "text-amber-700"
        : rating === "RED"
          ? "text-red-700"
          : "text-neutral-500";
  return <span className={`text-sm font-medium ${color}`}>{rating}</span>;
}
