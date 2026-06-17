import OpenAI from "openai";
import type { AiEmbedOptions, AiEmbedProvider } from "../types";

const DEFAULT_MODEL = "openai/text-embedding-3-small";

/** 1536-dim — matches the `vector(1536)` column on product_kb. */
export const textEmbedding3SmallProvider: AiEmbedProvider = {
  name: "text-embedding-3-small",
  async embed(options: AiEmbedOptions): Promise<number[]> {
    const client = new OpenAI({
      apiKey: options.apiKey,
      baseURL: "https://openrouter.ai/api/v1",
    });

    const response = await client.embeddings.create({
      model: options.primaryModel ?? DEFAULT_MODEL,
      input: options.input,
    });

    const embedding = response.data[0]?.embedding;
    if (!embedding) {
      throw new Error("text-embedding-3-small provider returned no embedding");
    }
    return embedding;
  },
};
