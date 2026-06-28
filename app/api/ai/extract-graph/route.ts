import { NextResponse } from 'next/server';
import { extractLearningGraph } from '@/lib/ai/graphExtractor';
import type { LearningNode, LearningEdge } from '@/types';

export const runtime = 'nodejs';

interface ExtractGraphRequest {
    userMessage: string;
    assistantReply: string;
    existingNodes: LearningNode[];
    existingEdges: LearningEdge[];
    aiSettings?: {
        useOpenRouter: boolean;
        openRouterApiKey: string;
        openRouterModel: string;
    };
}

const REINFORCE_STEP = 15;
const INITIAL_STRENGTH = 30;

export async function POST(req: Request) {
    try {
        const body = (await req.json()) as ExtractGraphRequest;
        if (!body?.userMessage || !body?.assistantReply) {
            return NextResponse.json({ error: 'Request tidak lengkap.' }, { status: 400 });
        }

        const existingNodes = body.existingNodes ?? [];
        const existingEdges = body.existingEdges ?? [];

        // Only id/topic/tags go into the LLM prompt — keeps token usage low.
        const extraction = await extractLearningGraph({
            userMessage: body.userMessage,
            assistantReply: body.assistantReply,
            existingNodes: existingNodes.map((n) => ({ id: n.id, topic: n.topic, summary: n.summary, tags: n.tags })),
            aiSettings: body.aiSettings,
        });

        if (extraction.updates.length === 0 && extraction.edges.length === 0) {
            return NextResponse.json({ nodes: null, edges: null });
        }

        const now = new Date().toISOString();
        const nodesById = new Map<string, LearningNode>(existingNodes.map((n) => [n.id, n]));
        const topicToId = new Map<string, string>(existingNodes.map((n) => [n.topic.toLowerCase(), n.id]));

        for (const u of extraction.updates) {
            const existing = u.id ? nodesById.get(u.id) : undefined;
            if (existing) {
                const merged: LearningNode = {
                    ...existing,
                    summary: u.summary || existing.summary,
                    tags: Array.from(new Set([...existing.tags, ...u.tags])),
                    strength: Math.min(100, existing.strength + REINFORCE_STEP),
                    reviewCount: existing.reviewCount + 1,
                    lastReviewedAt: now,
                };
                nodesById.set(merged.id, merged);
                topicToId.set(merged.topic.toLowerCase(), merged.id);
            } else {
                const id = crypto.randomUUID();
                const created: LearningNode = {
                    id,
                    topic: u.topic,
                    summary: u.summary,
                    tags: u.tags,
                    strength: INITIAL_STRENGTH,
                    reviewCount: 1,
                    createdAt: now,
                    lastReviewedAt: now,
                };
                nodesById.set(id, created);
                topicToId.set(u.topic.toLowerCase(), id);
            }
        }

        const edgesByKey = new Map<string, LearningEdge>(
            existingEdges.map((e) => [`${e.sourceId}|${e.targetId}|${e.relation}`, e])
        );

        for (const e of extraction.edges) {
            const sourceId = topicToId.get(e.sourceTopic.toLowerCase());
            const targetId = topicToId.get(e.targetTopic.toLowerCase());
            if (!sourceId || !targetId || sourceId === targetId) continue;

            const key = `${sourceId}|${targetId}|${e.relation}`;
            const existing = edgesByKey.get(key);
            if (existing) {
                edgesByKey.set(key, { ...existing, strength: Math.min(100, existing.strength + REINFORCE_STEP) });
            } else {
                edgesByKey.set(key, {
                    id: crypto.randomUUID(),
                    sourceId,
                    targetId,
                    relation: e.relation,
                    strength: INITIAL_STRENGTH,
                });
            }
        }

        return NextResponse.json({
            nodes: Array.from(nodesById.values()),
            edges: Array.from(edgesByKey.values()),
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Gagal extract learning graph.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
