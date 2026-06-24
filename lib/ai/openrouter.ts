import OpenAI from "openai";
import type {
    AIMessage,
    AIProvider,
    GenerateJSONOptions,
    GenerateTextOptions,
} from "./types";

function toOpenAIMessages(system: string | undefined, messages: AIMessage[]) {
    const out: { role: AIMessage["role"]; content: string | any[] }[] = [];
    if (system) out.push({ role: "system", content: system });
    for (const m of messages) out.push({ role: m.role, content: m.content });
    return out;
}

export function createOpenRouterProvider(
    apiKey: string,
    model: string
): AIProvider {
    if (!apiKey) {
        throw new Error(
            "OpenRouter API Key tidak ditemukan. Pastikan sudah diisi di halaman Profile/Settings."
        );
    }
    const client = new OpenAI({ 
        apiKey,
        baseURL: "https://openrouter.ai/api/v1",
        defaultHeaders: {
            "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
            "X-Title": "Narzza Quest",
        }
    });

    const activeModel = model || "google/gemini-2.5-flash";

    return {
        name: "openrouter",

        async generateText({
            system,
            messages,
            maxTokens = 2048,
            temperature = 0.7,
        }: GenerateTextOptions): Promise<string> {
            const res = await client.chat.completions.create({
                model: activeModel,
                max_tokens: maxTokens,
                temperature,
                messages: toOpenAIMessages(system, messages),
            });
            return res.choices[0]?.message?.content ?? "";
        },

        async *streamText({
            system,
            messages,
            maxTokens = 2048,
            temperature = 0.7,
        }: GenerateTextOptions): AsyncIterable<string> {
            const stream = await client.chat.completions.create({
                model: activeModel,
                max_tokens: maxTokens,
                temperature,
                messages: toOpenAIMessages(system, messages),
                stream: true,
            });
            for await (const chunk of stream) {
                const delta = chunk.choices[0]?.delta?.content;
                if (delta) yield delta;
            }
        },

        async generateJSON<T = unknown>({
            system,
            messages,
            maxTokens = 4096,
            temperature = 0.7,
        }: GenerateJSONOptions): Promise<T> {
            const res = await client.chat.completions.create({
                model: activeModel,
                max_tokens: maxTokens,
                temperature,
                response_format: { type: "json_object" },
                messages: toOpenAIMessages(system, messages),
            });
            const text = res.choices[0]?.message?.content ?? "{}";
            return JSON.parse(text) as T;
        },
    };
}
