import { kimiProvider } from "./providers/kimi";
import { gpt4oMiniProvider } from "./providers/gpt4oMini";
import { textEmbedding3SmallProvider } from "./providers/textEmbedding3Small";
import { textEmbeddingAda002Provider } from "./providers/textEmbeddingAda002";
import type { AiCompleteOptions, AiCompleteResult, AiEmbedOptions, AiEmbedResult } from "./types";

export * from "./types";

/**
 * The ONLY entry point for AI calls in this codebase (build-brief rule #3).
 * Tries Kimi/text-embedding-3-small first, falls back on any failure. Never
 * call a model provider directly anywhere else in the app.
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

  async embed(options: AiEmbedOptions): Promise<AiEmbedResult> {
    try {
      const embedding = await textEmbedding3SmallProvider.embed(options);
      return { embedding, modelUsed: textEmbedding3SmallProvider.name, fellBack: false };
    } catch {
      const embedding = await textEmbeddingAda002Provider.embed(options);
      return { embedding, modelUsed: textEmbeddingAda002Provider.name, fellBack: true };
    }
  },
};
