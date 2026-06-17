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

/**
 * Sends an approved WhatsApp template message — the only way to message a
 * customer outside the 24-hour customer-service window, so this is what
 * bulk campaign sends use (freeform text, above, is only ever a direct
 * reply within that window).
 */
export async function sendWhatsAppTemplate(
  to: string,
  templateName: string,
  languageCode: string,
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
      type: "template",
      template: {
        name: templateName,
        language: { code: languageCode },
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`WhatsApp template send failed (${res.status}): ${text}`);
  }
}
