'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { getLearningGraph, saveLearningGraph } from '@/lib/db';
import type { LearningGraph, LearningNode, UserProfile } from '@/types';

const DECAY_RATE_PER_DAY = 0.5;

function applyDecay(nodes: LearningNode[]): { nodes: LearningNode[]; changed: boolean } {
    const now = Date.now();
    let changed = false;
    const decayed = nodes.map((node) => {
        const days = (now - new Date(node.lastReviewedAt).getTime()) / 86_400_000;
        const next = Math.max(0, Math.round(node.strength - days * DECAY_RATE_PER_DAY));
        if (next !== node.strength) {
            changed = true;
            return { ...node, strength: next };
        }
        return node;
    });
    return { nodes: decayed, changed };
}

/** Loads the user's learning knowledge graph and exposes a way to record a chat exchange against it. */
export function useLearningGraph(uid?: string, aiSettings?: UserProfile['aiSettings']) {
    const [graph, setGraph] = useState<LearningGraph | null>(null);
    const graphRef = useRef<LearningGraph | null>(null);
    graphRef.current = graph;

    useEffect(() => {
        if (!uid) return;
        getLearningGraph(uid)
            .then((loaded) => {
                if (!loaded) return;
                const { nodes, changed } = applyDecay(loaded.nodes);
                const updated = changed ? { ...loaded, nodes } : loaded;
                setGraph(updated);
                if (changed) {
                    saveLearningGraph(uid, { nodes, edges: loaded.edges }).catch((err) => {
                        console.error('[LearningGraph] Failed to persist strength decay:', err);
                    });
                }
            })
            .catch((err) => {
                console.error('[LearningGraph] Failed to load graph:', err);
            });
    }, [uid]);

    const recordExchange = useCallback((userMessage: string, assistantReply: string) => {
        if (!uid) return;
        const current = graphRef.current ?? { uid, nodes: [], edges: [], updatedAt: '' };

        fetch('/api/ai/extract-graph', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userMessage,
                assistantReply,
                existingNodes: current.nodes,
                existingEdges: current.edges,
                aiSettings,
            }),
        })
            .then((res) => res.json())
            .then((data: { nodes?: LearningGraph['nodes'] | null; edges?: LearningGraph['edges'] | null; error?: string }) => {
                if (data?.error) {
                    console.error('[LearningGraph] extract-graph API error:', data.error);
                    return;
                }
                if (!data?.nodes || !data?.edges) return;
                const updated: LearningGraph = { uid, nodes: data.nodes, edges: data.edges, updatedAt: new Date().toISOString() };
                setGraph(updated);
                saveLearningGraph(uid, { nodes: updated.nodes, edges: updated.edges }).catch((err) => {
                    console.error('[LearningGraph] Failed to save graph:', err);
                });
            })
            .catch((err) => {
                console.error('[LearningGraph] Network error during extraction:', err);
            });
    }, [uid, aiSettings]); // graphRef used instead of graph — stable ref, no re-render deps

    return { graph, recordExchange };
}
