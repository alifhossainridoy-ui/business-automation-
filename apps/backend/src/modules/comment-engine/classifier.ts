import { aiClient } from "@rupzone/ai-client";
import type { CommentCategory } from "@rupzone/shared-types";

const CLASSIFIER_SYSTEM_PROMPT = `তুমি একটি বাংলা beauty ব্র্যান্ডের কমেন্ট মডারেটর।
প্রতিটি কমেন্টকে ঠিক একটি শ্রেণিতে ফেলো:
abuse | negative | spam | price | normal — শুধু শব্দটি ফেরত দাও।

"দাম কত আপু?"              → price
"এরা ফ্রড, টাকা মেরে দেয়"  → negative
"নাইস প্রোডাক্ট ❤️"         → normal
"আমার পেজে ভিজিট করুন .."  → spam
"[গালি]"                    → abuse
"কোথায় পাওয়া যায়?"        → price`;

const VALID_CATEGORIES: CommentCategory[] = ["abuse", "negative", "spam", "price", "normal"];

/**
 * Classifies a single comment via the shared aiClient wrapper (Kimi ▸
 * GPT-4o-mini fallback — build-brief rule #3). Never calls a model
 * provider directly.
 */
export async function classifyComment(
  text: string,
  openrouterApiKey: string,
  primaryModel?: string
): Promise<CommentCategory> {
  const result = await aiClient.complete({
    apiKey: openrouterApiKey,
    system: CLASSIFIER_SYSTEM_PROMPT,
    prompt: text,
    primaryModel,
    temperature: 0,
    maxTokens: 10,
  });

  const category = result.text.trim().toLowerCase() as CommentCategory;
  return VALID_CATEGORIES.includes(category) ? category : "normal";
}
