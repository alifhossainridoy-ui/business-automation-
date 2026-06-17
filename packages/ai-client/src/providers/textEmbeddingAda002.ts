import OpenAI from "openai";
import type { AiEmbedOptions, AiEmbedProvider } from "../types";

const MODEL = "openai/text-embedding-ada-002";

/** Fallback embedding model — also 1536-dim, matches product_kb.embedding. */
export const textEmbeddingAda002Provider: AiEmbedProvider = {
  name: "text-embedding-ada-002",
  async embed(options: AiEmbedOptions): Promise<number[]> {
    const client = new OpenAI({
      apiKey: options.apiKey,
      baseURL: "https://openrouter.ai/api/v1",
    });

    const response = await client.embeddings.create({
      model: MODEL,
      input: options.input,
    });

    const embedding = response.data[0]?.embedding;
    if (!embedding) {
      throw new Error("text-embedding-ada-002 provider returned no embedding");
    }
    return embedding;
  },
};
