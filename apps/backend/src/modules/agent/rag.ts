import { aiClient } from "@rupzone/ai-client";
import { searchProductKb } from "@rupzone/db";
import type { Business } from "@rupzone/shared-types";

/**
 * Embeds the inbound message and pulls the closest product_kb rows for this
 * business (rule #1: scoped by business_id, never cross-business). Returns
 * an empty list rather than throwing — RAG failing shouldn't block a reply,
 * it should just fall back to persona-only.
 */
export async function retrieveRelevantKnowledge(
  business: Business,
  queryText: string
): Promise<string[]> {
  if (!business.openrouter_api_key) return [];

  try {
    const { embedding } = await aiClient.embed({
      apiKey: business.openrouter_api_key,
      input: queryText,
    });
    const matches = await searchProductKb(business.id, embedding, 4);
    return matches.map((match) => match.content);
  } catch (err) {
    console.error("product_kb RAG lookup failed:", err);
    return [];
  }
}
