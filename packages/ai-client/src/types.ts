export interface AiCompleteOptions {
  /** OpenRouter API key for the calling business — never hardcoded. */
  apiKey: string;
  /** System prompt. */
  system?: string;
  /** User-facing prompt / message. */
  prompt: string;
  /** Primary model to try first (defaults to Kimi). */
  primaryModel?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AiCompleteResult {
  text: string;
  modelUsed: string;
  /** True if the primary provider failed and fallback was used. */
  fellBack: boolean;
}

export interface AiProvider {
  name: string;
  complete(options: AiCompleteOptions): Promise<string>;
}
