import { kimiProvider } from "./providers/kimi";
import { gpt4oMiniProvider } from "./providers/gpt4oMini";
import type { AiCompleteOptions, AiCompleteResult } from "./types";

export * from "./types";

/**
 * The ONLY entry point for AI calls in this codebase (build-brief rule #3).
 * Tries Kimi first, falls back to GPT-4o-mini on any failure. Never call a
 * model provider directly anywhere else in the app.
 */
export const aiClient = {
  async complete(options: AiCompleteOptions): Promise<AiCompleteResult> {
    try {
      const text = await kimiProvider.complete(options);
      return { text, modelUsed: kimiProvider.name, fellBack: false };
    } catch {
      const text = await gpt4oMiniProvider.complete(options);
      return { text, modelUsed: gpt4oMiniProvider.name, fellBack: true };
    }
  },
};
