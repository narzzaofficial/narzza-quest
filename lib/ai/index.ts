import type { AIProvider } from "./types";
import { createOpenAIProvider } from "./openai";

export * from "./types";

export type AIProviderName = "openai" | "claude";

let cached: AIProvider | null = null;

/**
 * Returns the configured AI provider (singleton).
 * Controlled by the AI_PROVIDER env var (default: "openai").
 *
 * To add Claude later:
 *   1. npm install @anthropic-ai/sdk
 *   2. create lib/ai/claude.ts exporting createClaudeProvider(): AIProvider
 *   3. wire the "claude" case below
 *   4. set AI_PROVIDER=claude
 * No feature code needs to change.
 */
export function getAIProvider(): AIProvider {
    if (cached) return cached;

    const provider = (process.env.AI_PROVIDER || "openai").toLowerCase();
    switch (provider) {
        case "openai":
            cached = createOpenAIProvider();
            break;
        case "claude":
            throw new Error(
                "AI_PROVIDER=claude belum dikonfigurasi. Buat lib/ai/claude.ts + install @anthropic-ai/sdk dulu."
            );
        default:
            throw new Error(`AI_PROVIDER tidak dikenal: "${provider}"`);
    }
    return cached;
}
