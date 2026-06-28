'use client';

import { useMemo } from 'react';
import { ReactFlow, Background, Controls, MiniMap, type Node, type Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { LearningNode, LearningEdge, LearningRelation } from '@/types';

interface GraphCanvasProps {
    nodes: LearningNode[];
    edges: LearningEdge[];
    selectedId: string | null;
    onSelectNode: (id: string) => void;
}

const RELATION_STYLE: Record<LearningRelation, { stroke: string; dashed?: boolean }> = {
    prerequisite: { stroke: '#3b82f6' },
    related: { stroke: '#98a3ba' },
    'builds-on': { stroke: '#06b6d4' },
    contradicts: { stroke: '#e5484d', dashed: true },
};

const RING_CAPACITY = [8, 16, 24, 32];
const RING_RADIUS   = [180, 340, 500, 660];
const CENTER = { x: 500, y: 500 };

/** Concentric-ring layout — stronger nodes placed in inner rings. */
function layoutPositions(nodes: LearningNode[]): { x: number; y: number }[] {
    const count = nodes.length;
    if (count === 0) return [];
    if (count === 1) return [CENTER];

    const sorted = [...nodes]
        .map((n, i) => ({ strength: n.strength, originalIdx: i }))
        .sort((a, b) => b.strength - a.strength);

    const positions = new Array<{ x: number; y: number }>(count);
    let placed = 0;
    let ring = 0;

    while (placed < count) {
        const cap    = RING_CAPACITY[ring] ?? RING_CAPACITY[RING_CAPACITY.length - 1];
        const radius = RING_RADIUS[ring]   ?? RING_RADIUS[RING_RADIUS.length - 1] + (ring - RING_RADIUS.length + 1) * 160;
        const inRing = Math.min(cap, count - placed);

        for (let j = 0; j < inRing; j++) {
            const angle = (2 * Math.PI * j) / inRing - Math.PI / 2;
            positions[sorted[placed + j].originalIdx] = {
                x: CENTER.x + radius * Math.cos(angle),
                y: CENTER.y + radius * Math.sin(angle),
            };
        }

        placed += inRing;
        ring++;
    }

    return positions;
}

export function GraphCanvas({ nodes, edges, selectedId, onSelectNode }: GraphCanvasProps) {
    const positions = useMemo(() => layoutPositions(nodes), [nodes]);

    const connectedEdgeIds = useMemo(() => {
        if (!selectedId) return new Set<string>();
        return new Set(
            edges.filter((e) => e.sourceId === selectedId || e.targetId === selectedId).map((e) => e.id)
        );
    }, [edges, selectedId]);

    const flowNodes: Node[] = useMemo(() => nodes.map((n, i) => {
        const size       = 60 + (n.strength / 100) * 70;
        const isSelected = n.id === selectedId;
        return {
            id: n.id,
            position: positions[i],
            data: { label: n.topic },
            style: {
                width: size,
                height: size,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '9999px',
                fontSize: 11,
                fontWeight: 700,
                textAlign: 'center' as const,
                padding: 6,
                background: `rgba(59, 130, 246, ${0.25 + (n.strength / 100) * 0.55})`,
                color: '#16203a',
                border: isSelected ? '2px solid #3b82f6' : '1px solid rgba(59,130,246,0.3)',
                boxShadow: isSelected ? '0 0 0 4px rgba(59,130,246,0.2)' : undefined,
                opacity: selectedId && !isSelected ? 0.6 : 1,
                transition: 'opacity 0.15s, box-shadow 0.15s',
            },
        };
    }), [nodes, positions, selectedId]);

    const flowEdges: Edge[] = useMemo(() => edges.map((e) => {
        const style       = RELATION_STYLE[e.relation] ?? RELATION_STYLE.related;
        const isConnected = !selectedId || connectedEdgeIds.has(e.id);
        return {
            id: e.id,
            source: e.sourceId,
            target: e.targetId,
            style: {
                stroke: isConnected ? style.stroke : 'rgba(150,163,186,0.2)',
                strokeWidth: isConnected ? (1 + (e.strength / 100) * 2) : 0.5,
                strokeDasharray: style.dashed ? '5 5' : undefined,
                opacity: isConnected ? 1 : 0.25,
                transition: 'opacity 0.15s',
            },
        };
    }), [edges, selectedId, connectedEdgeIds]);

    return (
        <ReactFlow
            nodes={flowNodes}
            edges={flowEdges}
            onNodeClick={(_, node) => onSelectNode(node.id)}
            fitView
            proOptions={{ hideAttribution: true }}
        >
            <Background />
            <Controls />
            <MiniMap pannable zoomable />
        </ReactFlow>
    );
}
