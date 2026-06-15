'use client';

import React, { useEffect, useState } from 'react';
import { BookMarked, CheckCircle2, Loader2, Trophy, BookOpen } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getArcHistory, completeArc } from '@/lib/db';
import PageHeader from '@/components/ui/PageHeader';
import GlassCard from '@/components/ui/GlassCard';
import StatTile from '@/components/ui/StatTile';
import { ArcHistoryCard } from '@/components/story-arc/ArcHistoryCard';
import type { StoryArc } from '@/types';

export default function StoryArcPage() {
    const { profile } = useAuth();
    const [arcs,    setArcs]    = useState<StoryArc[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!profile?.uid) return;
        getArcHistory(profile.uid).then(async (data) => {
            const sorted = [...data].sort((a, b) => a.arcNumber - b.arcNumber);

            const activeArcs = sorted.filter((a) => a.status === 'active');
            if (activeArcs.length > 1) {
                const orphans = activeArcs.slice(0, -1);
                await Promise.all(orphans.map((a) => completeArc(a.id).catch(() => {})));
                orphans.forEach((a) => { a.status = 'completed'; });
            }

            setArcs(sorted);
        }).finally(() => setLoading(false));
    }, [profile?.uid]);

    const activeArc = [...arcs]
        .filter((a) => a.status === 'active')
        .sort((a, b) => b.arcNumber - a.arcNumber)[0] ?? null;

    const completedArcs = arcs
        .filter((a) => a.status === 'completed')
        .sort((a, b) => b.arcNumber - a.arcNumber);

    const totalQuests = arcs.reduce((sum, a) => sum + a.questsCompleted, 0);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-brand animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
            <PageHeader
                icon={<BookMarked className="w-6 h-6 text-white" />}
                title="Story Arc"
                subtitle="Setiap arc adalah chapter 14 hari dalam hidupmu — dibuat AI Game Master dari tujuan & konteksmu."
                grad="brand"
            />

            <div className="grid grid-cols-3 gap-4">
                <StatTile icon={BookOpen}     label="Total Arc"           value={arcs.length}          grad="brand" />
                <StatTile icon={Trophy}       label="Quest Diselesaikan"  value={totalQuests}          grad="amber" />
                <StatTile icon={CheckCircle2} label="Arc Selesai"         value={completedArcs.length} grad="green" />
            </div>

            {arcs.length === 0 && (
                <GlassCard className="p-12 text-center">
                    <BookOpen className="w-8 h-8 text-ink-muted mx-auto mb-3" />
                    <p className="text-ink font-bold">Belum ada arc</p>
                    <p className="text-ink-soft text-sm mt-1">Buka dashboard untuk memulai arc pertamamu.</p>
                </GlassCard>
            )}

            {activeArc && (
                <div className="space-y-2">
                    <p className="text-ink-muted text-[10px] uppercase tracking-widest font-bold">Arc Aktif</p>
                    <ArcHistoryCard arc={activeArc} defaultOpen />
                </div>
            )}

            {completedArcs.length > 0 && (
                <div className="space-y-3">
                    <p className="text-ink-muted text-[10px] uppercase tracking-widest font-bold">
                        Chapter Sebelumnya · {completedArcs.length} arc selesai
                    </p>
                    <div className="relative">
                        <div className="absolute left-5 top-3 bottom-3 w-px bg-line" />
                        <div className="space-y-3">
                            {completedArcs.map((arc) => (
                                <div key={arc.id} className="relative pl-12">
                                    <div className="absolute left-[14px] top-5 w-2.5 h-2.5 rounded-full bg-brand/30 border-2 border-brand/50" />
                                    <ArcHistoryCard arc={arc} defaultOpen={false} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
