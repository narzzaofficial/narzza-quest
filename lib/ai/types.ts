// Provider-agnostic AI contract.
// Switching from OpenAI to Claude (or any other) only requires a new adapter
// implementing this interface — nothing in the feature code changes.

export type AIRole = "system" | "user" | "assistant";

export type AIMessageContentPart = 
    | { type: 'text'; text: string }
    | { type: 'image_url'; image_url: { url: string } };

export interface AIMessage {
    role: AIRole;
    content: string | AIMessageContentPart[];
}

export interface GenerateTextOptions {
    /** System / instruction prompt that frames the assistant's behavior. */
    system?: string;
    /** Conversation turns. */
    messages: AIMessage[];
    maxTokens?: number;
    temperature?: number;
}

export interface GenerateJSONOptions extends GenerateTextOptions {
    /**
     * Optional JSON schema describing the expected output shape.
     * Providers that support structured outputs will enforce it; others
     * fall back to JSON mode + parse. When omitted, the prompt itself must
     * make the desired JSON shape explicit.
     */
    schema?: Record<string, unknown>;
    /** Human-readable name for the schema (used by structured-output APIs). */
    schemaName?: string;
}

export interface AIProvider {
    /** Identifier of the active provider, e.g. "openai" | "claude". */
    readonly name: string;
    /** Free-form text completion. */
    generateText(opts: GenerateTextOptions): Promise<string>;
    /** Streaming text — yields chunks as they arrive. */
    streamText(opts: GenerateTextOptions): AsyncIterable<string>;
    /** JSON completion, parsed into T. */
    generateJSON<T = unknown>(opts: GenerateJSONOptions): Promise<T>;
}
