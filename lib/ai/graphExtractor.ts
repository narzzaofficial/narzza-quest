import { getAIProvider } from './index';
import type { LearningRelation } from '@/types';

// Server-side only. Extracts learning/study concepts from one chat exchange
// and proposes how they connect to the user's existing learning knowledge graph.

export interface ExistingNodeRef {
    id: string;
    topic: string;
    summary: string;
    tags: string[];
}

export interface GraphExtractionContext {
    userMessage: string;
    assistantReply: string;
    existingNodes: ExistingNodeRef[];
    aiSettings?: {
        useOpenRouter: boolean;
        openRouterApiKey: string;
        openRouterModel: string;
    };
}

export interface GraphExtractionUpdate {
    id: string | null;
    topic: string;
    summary: string;
    tags: string[];
}

export interface GraphExtractionEdge {
    sourceTopic: string;
    targetTopic: string;
    relation: LearningRelation;
}

export interface GraphExtractionResult {
    updates: GraphExtractionUpdate[];
    edges: GraphExtractionEdge[];
}

export async function extractLearningGraph(ctx: GraphExtractionContext): Promise<GraphExtractionResult> {
    const ai = getAIProvider(ctx.aiSettings);

    const system = [
        'Kamu meng-ekstrak konsep belajar/studi dari SATU pertukaran chat (1 pesan user + 1 balasan AI).',
        'Kalau pertukaran ini BUKAN soal belajar suatu konsep (misal: obrolan santai, mood, kerjaan, keuangan, quest harian), balas: { "updates": [], "edges": [] }. Jangan dipaksakan.',
        'Kalau ADA konsep yang dipelajari/dibahas:',
        '- "updates": daftar node topik yang baru dipelajari atau diperdalam.',
        '  - Topik yang sudah ada di "Topik existing" (walau beda kata-kata/fonetik) → WAJIB reuse "id" yang sama, lalu perbarui "summary" (gabungkan pemahaman lama+baru, jangan diulang mentah).',
        '  - Topik yang benar-benar baru → "id": null.',
        '- "edges": relasi antar topik (boleh antar topik baru, atau topik baru ke topik existing). "sourceTopic"/"targetTopic" pakai STRING nama topik (bukan id). "relation" salah satu dari: "prerequisite" | "related" | "builds-on" | "contradicts".',
        'Balas HANYA JSON: { "updates": [{ "id": string|null, "topic": string, "summary": string (1-3 kalimat), "tags": string[] }], "edges": [{ "sourceTopic": string, "targetTopic": string, "relation": string }] }',
        'Bahasa Indonesia.',
    ].join('\n');

    const lines: string[] = [];
    if (ctx.existingNodes.length > 0) {
        lines.push(
            `Topik existing: ${ctx.existingNodes.map((n) => `{id: "${n.id}", topic: "${n.topic}", summary: "${n.summary.slice(0, 120)}", tags: [${n.tags.join(', ')}]}`).join(', ')}.`
        );
    } else {
        lines.push('Topik existing: (belum ada).');
    }
    lines.push(`User: "${ctx.userMessage}"`);
    lines.push(`AI: "${ctx.assistantReply}"`);
    lines.push('Ekstrak sebagai JSON.');

    const res = await ai.generateJSON<Partial<GraphExtractionResult>>({
        system,
        messages: [{ role: 'user', content: lines.join('\n') }],
        maxTokens: 700,
        temperature: 0.4,
    });

    const updates = Array.isArray(res?.updates)
        ? res.updates
            .filter((u): u is GraphExtractionUpdate => !!u && typeof u.topic === 'string')
            .map((u) => ({
                id: typeof u.id === 'string' ? u.id : null,
                topic: String(u.topic).slice(0, 120),
                summary: String(u.summary ?? '').slice(0, 500),
                tags: Array.isArray(u.tags) ? u.tags.map((t) => String(t).slice(0, 40)).slice(0, 6) : [],
            }))
        : [];

    const edges = Array.isArray(res?.edges)
        ? res.edges
            .filter((e): e is GraphExtractionEdge => !!e && typeof e.sourceTopic === 'string' && typeof e.targetTopic === 'string')
            .map((e) => ({
                sourceTopic: String(e.sourceTopic).slice(0, 120),
                targetTopic: String(e.targetTopic).slice(0, 120),
                relation: (['prerequisite', 'related', 'builds-on', 'contradicts'] as const).includes(e.relation as LearningRelation)
                    ? (e.relation as LearningRelation)
                    : 'related',
            }))
        : [];

    return { updates, edges };
}
