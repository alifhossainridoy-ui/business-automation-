import OpenAI from "openai";
import type { AiCompleteOptions, AiProvider } from "../types";

const DEFAULT_MODEL = "moonshotai/kimi-k2";

export const kimiProvider: AiProvider = {
  name: "kimi",
  async complete(options: AiCompleteOptions): Promise<string> {
    const client = new OpenAI({
      apiKey: options.apiKey,
      baseURL: "https://openrouter.ai/api/v1",
    });

    const response = await client.chat.completions.create({
      model: options.primaryModel ?? DEFAULT_MODEL,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 600,
      messages: [
        ...(options.system ? [{ role: "system" as const, content: options.system }] : []),
        { role: "user" as const, content: options.prompt },
      ],
    });

    const text = response.choices[0]?.message?.content;
    if (!text) {
      throw new Error("Kimi provider returned an empty response");
    }
    return text;
  },
};
