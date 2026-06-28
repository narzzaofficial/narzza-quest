'use client';

import { useState } from 'react';
import { Network, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLearningGraph } from '@/hooks/useLearningGraph';
import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/ui/EmptyState';
import { GraphCanvas } from '@/components/learning/GraphCanvas';
import { NodeDetailPanel } from '@/components/learning/NodeDetailPanel';

export default function LearningGraphPage() {
    const { profile } = useAuth();
    const { graph } = useLearningGraph(profile?.uid, profile?.aiSettings);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const nodes = graph?.nodes ?? [];
    const edges = graph?.edges ?? [];
    const selectedNode = nodes.find((n) => n.id === selectedId) ?? null;

    return (
        <div className="p-4 md:p-6 space-y-5 h-full flex flex-col">
            <PageHeader
                icon={<Network className="w-6 h-6 text-white" />}
                title="Learning Graph"
                subtitle="Peta konsep yang sudah kamu pelajari lewat AI Coach"
                grad="sky"
            />

            {!profile ? (
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-ink-muted" />
                </div>
            ) : nodes.length === 0 ? (
                <EmptyState
                    icon={Network}
                    title="Belum ada topik belajar"
                    desc="Mulai diskusi soal konsep yang kamu pelajari di AI Coach — node bakal otomatis muncul di sini."
                />
            ) : (
                <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-0">
                    <div className="flex-1 glass rounded-card shadow-card overflow-hidden min-h-[400px]">
                        <GraphCanvas nodes={nodes} edges={edges} selectedId={selectedId} onSelectNode={setSelectedId} />
                    </div>
                    {selectedNode && (
                        <NodeDetailPanel
                            node={selectedNode}
                            edges={edges}
                            allNodes={nodes}
                            onClose={() => setSelectedId(null)}
                        />
                    )}
                </div>
            )}
        </div>
    );
}
