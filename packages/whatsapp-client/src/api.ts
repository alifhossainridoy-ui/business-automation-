const GRAPH_BASE = "https://graph.facebook.com/v19.0";

/** Sends a freeform text message via the WhatsApp Cloud API. */
export async function sendWhatsAppMessage(
  to: string,
  message: string,
  waToken: string,
  phoneNumberId: string
): Promise<void> {
  const url = `${GRAPH_BASE}/${phoneNumberId}/messages`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${waToken}`,
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: message },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`WhatsApp send failed (${res.status}): ${text}`);
  }
}
