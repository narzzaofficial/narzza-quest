import OpenAI from "openai";
import type {
    AIMessage,
    AIProvider,
    GenerateJSONOptions,
    GenerateTextOptions,
} from "./types";

// Server-side only — never import this from a client component.
const DEFAULT_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

function toOpenAIMessages(system: string | undefined, messages: AIMessage[]) {
    const out: { role: AIMessage["role"]; content: string }[] = [];
    if (system) out.push({ role: "system", content: system });
    for (const m of messages) out.push({ role: m.role, content: m.content });
    return out;
}

export function createOpenAIProvider(): AIProvider {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error(
            "OPENAI_API_KEY belum di-set. Tambahkan ke .env.local kamu."
        );
    }
    const client = new OpenAI({ apiKey });

    return {
        name: "openai",

        async generateText({
            system,
            messages,
            maxTokens = 2048,
            temperature = 0.7,
        }: GenerateTextOptions): Promise<string> {
            const res = await client.chat.completions.create({
                model: DEFAULT_MODEL,
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
                model: DEFAULT_MODEL,
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
            // NOTE: OpenAI's json_object mode requires the word "json" to appear
            // somewhere in the prompt — keep that in the system prompt.
            const res = await client.chat.completions.create({
                model: DEFAULT_MODEL,
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
