/** Sends a plain-text message via the operator's own Telegram bot — the sole alert channel (Phase 4). */
export async function sendTelegramAlert(
  message: string,
  botToken: string,
  chatId: string
): Promise<void> {
  if (!botToken || !chatId) return;

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: message }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Telegram send failed (${res.status}): ${text}`);
  }
}
