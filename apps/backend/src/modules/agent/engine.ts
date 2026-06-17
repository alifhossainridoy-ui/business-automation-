import type { Business, ConversationChannel } from "@rupzone/shared-types";
import { findOrCreateCustomer, insertConversation, listRecentConversations } from "@rupzone/db";
import { sendMessengerMessage } from "@rupzone/meta-client";
import { sendWhatsAppMessage } from "@rupzone/whatsapp-client";
import { aiClient } from "@rupzone/ai-client";
import { buildSystemPrompt, formatHistoryForPrompt } from "./persona";
import { retrieveRelevantKnowledge } from "./rag";

export interface InboundMessage {
  channel: ConversationChannel;
  text: string;
  /** Messenger sender PSID — required when channel === "messenger". */
  fb_psid?: string;
  /** WhatsApp sender id (a phone number) — required when channel === "whatsapp". */
  wa_id?: string;
  name?: string;
}

/**
 * One inbound Messenger/WhatsApp message, end-to-end: find-or-create the
 * customer (cross-channel memory) → log inbound → gather history + RAG +
 * persona → aiClient.complete() (rule #3) → send the reply → log outbound.
 * Mirrors the comment-engine's log-everything discipline (rule #5).
 */
export async function handleInboundMessage(
  business: Business,
  inbound: InboundMessage
): Promise<void> {
  if (!business.openrouter_api_key) {
    console.error(`Business ${business.id} has no openrouter_api_key; skipping message`);
    return;
  }

  // WhatsApp's `wa_id` is a phone number, so it doubles as the cross-channel
  // phone key. Messenger's PSID carries no phone number on its own.
  const customer = await findOrCreateCustomer({
    business_id: business.id,
    phone: inbound.channel === "whatsapp" ? inbound.wa_id : undefined,
    fb_psid: inbound.fb_psid,
    wa_id: inbound.wa_id,
    name: inbound.name,
    source: inbound.channel,
  });

  await insertConversation({
    business_id: business.id,
    customer_id: customer.id,
    channel: inbound.channel,
    role: "customer",
    message: inbound.text,
  });

  const [history, knowledge] = await Promise.all([
    listRecentConversations(customer.id, 10),
    retrieveRelevantKnowledge(business, inbound.text),
  ]);

  const result = await aiClient.complete({
    apiKey: business.openrouter_api_key,
    system: buildSystemPrompt(business, knowledge),
    prompt: formatHistoryForPrompt(history),
    primaryModel: business.ai_model,
    temperature: 0.6,
    maxTokens: 400,
  });

  await safeguard(() => sendReply(business, inbound, result.text));

  await insertConversation({
    business_id: business.id,
    customer_id: customer.id,
    channel: inbound.channel,
    role: "agent",
    message: result.text,
  });
}

async function sendReply(
  business: Business,
  inbound: InboundMessage,
  text: string
): Promise<void> {
  if (inbound.channel === "messenger") {
    if (!business.fb_page_token || !inbound.fb_psid) {
      console.error(`Business ${business.id} missing fb_page_token or sender psid; cannot reply`);
      return;
    }
    await sendMessengerMessage(inbound.fb_psid, text, business.fb_page_token);
    return;
  }

  if (!business.wa_token || !business.wa_phone_id || !inbound.wa_id) {
    console.error(`Business ${business.id} missing WhatsApp config or sender id; cannot reply`);
    return;
  }
  await sendWhatsAppMessage(inbound.wa_id, text, business.wa_token, business.wa_phone_id);
}

async function safeguard(action: () => Promise<void>): Promise<void> {
  try {
    await action();
  } catch (err) {
    console.error("Agent reply send failed:", err);
  }
}
