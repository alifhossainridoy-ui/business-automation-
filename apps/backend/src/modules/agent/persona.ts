import type { Business, Conversation } from "@rupzone/shared-types";

const FALLBACK_PERSONA =
  "তুমি Rupa, একটি বাংলা beauty ব্র্যান্ডের বন্ধুত্বপূর্ণ সহকারী। সংক্ষিপ্ত, আন্তরিক ও সহায়ক উত্তর দাও।";

/**
 * business.persona is one free-text field holding both tone and a handful
 * of example conversations together (per blueprint §06) — no separate
 * few-shot table, so it's injected into the system prompt as-is.
 */
export function buildSystemPrompt(business: Business, knowledge: string[]): string {
  const persona = business.persona?.trim() || FALLBACK_PERSONA;
  const knowledgeBlock = knowledge.length
    ? `\n\nProduct knowledge (use only if relevant — never invent details beyond this):\n${knowledge
        .map((entry) => `- ${entry}`)
        .join("\n")}`
    : "";

  return `${persona}${knowledgeBlock}\n\nReply in Bengali. Keep replies short and natural, like a real chat message.`;
}

/** Renders cross-channel history (oldest first, including the new inbound
 * message) into a transcript ending with a "Rupa:" cue for completion. */
export function formatHistoryForPrompt(history: Conversation[]): string {
  const transcript = history
    .map((entry) => `${entry.role === "customer" ? "Customer" : "Rupa"}: ${entry.message}`)
    .join("\n");
  return `${transcript}\nRupa:`;
}
