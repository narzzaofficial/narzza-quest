'use client';

import { X } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import type { LearningNode, LearningEdge, LearningRelation } from '@/types';

interface NodeDetailPanelProps {
    node: LearningNode;
    edges: LearningEdge[];
    allNodes: LearningNode[];
    onClose: () => void;
}

export function NodeDetailPanel({ node, edges, allNodes, onClose }: NodeDetailPanelProps) {
    const connected = edges
        .filter((e) => e.sourceId === node.id || e.targetId === node.id)
        .map((e) => {
            const otherId = e.sourceId === node.id ? e.targetId : e.sourceId;
            const other = allNodes.find((n) => n.id === otherId);
            return other ? { relation: e.relation, topic: other.topic } : null;
        })
        .filter((x): x is { relation: LearningRelation; topic: string } => !!x);

    return (
        <GlassCard className="p-5 w-full md:w-80 shrink-0 overflow-y-auto custom-scrollbar">
            <div className="flex items-start justify-between gap-2 mb-3">
                <h3 className="text-ink font-extrabold text-base">{node.topic}</h3>
                <button onClick={onClose} className="text-ink-muted hover:text-ink shrink-0">
                    <X className="w-4 h-4" />
                </button>
            </div>
            <p className="text-ink-soft text-sm leading-relaxed mb-4">{node.summary}</p>

            <div className="flex items-center gap-2 mb-4">
                <span className="text-[10px] uppercase tracking-widest font-bold text-ink-muted shrink-0">Strength</span>
                <div className="flex-1 h-2 rounded-full bg-surface-2 overflow-hidden">
                    <div className="h-full bg-brand rounded-full" style={{ width: `${node.strength}%` }} />
                </div>
                <span className="text-xs font-bold text-ink shrink-0">{node.strength}%</span>
            </div>

            {node.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                    {node.tags.map((t) => (
                        <span key={t} className="px-2 py-0.5 rounded-full bg-surface-2 text-ink-soft text-[10px] font-semibold">{t}</span>
                    ))}
                </div>
            )}

            {connected.length > 0 && (
                <div>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-ink-muted mb-2">Terhubung dengan</p>
                    <div className="space-y-1.5">
                        {connected.map((c, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs">
                                <span className="text-ink-muted">{c.relation}</span>
                                <span className="text-ink font-semibold">{c.topic}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <p className="text-ink-muted/60 text-[10px] mt-4">
                Direview {node.reviewCount}x · terakhir {new Date(node.lastReviewedAt).toLocaleDateString('id-ID')}
            </p>
        </GlassCard>
    );
}
