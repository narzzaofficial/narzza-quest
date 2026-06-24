import type { AIProvider } from "./types";
import { createOpenAIProvider } from "./openai";
import { createOpenRouterProvider } from "./openrouter";

export * from "./types";

export type AIProviderName = "openai" | "claude" | "openrouter";

let cached: AIProvider | null = null;

interface AISettings {
    useOpenRouter?: boolean;
    openRouterApiKey?: string;
    openRouterModel?: string;
}

export function getAIProvider(settings?: AISettings): AIProvider {
    if (settings?.useOpenRouter && settings?.openRouterApiKey) {
        return createOpenRouterProvider(
            settings.openRouterApiKey,
            settings.openRouterModel || "google/gemini-2.5-flash"
        );
    }

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
