'use client';

import React, { useEffect, useState } from 'react';
import {
    BookMarked, CheckCircle2, Circle, Clock, Loader2,
    Sparkles, Trophy, BookOpen, Swords,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getArcHistory, completeArc } from '@/lib/db';
import PageHeader from '@/components/ui/PageHeader';
import GlassCard from '@/components/ui/GlassCard';
import StatTile from '@/components/ui/StatTile';
import type { StoryArc } from '@/types';

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'short', year: 'numeric',
    });
}

export default function StoryArcPage() {
    const { profile } = useAuth();
    const [arcs, setArcs] = useState<StoryArc[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!profile?.uid) return;
        getArcHistory(profile.uid).then(async (data) => {
            const sorted = [...data].sort((a, b) => a.arcNumber - b.arcNumber);

            // Cleanup: complete orphaned active arcs (from old refresh bug), keep only newest
            const activeArcs = sorted.filter(a => a.status === 'active');
            if (activeArcs.length > 1) {
                const orphans = activeArcs.slice(0, -1);
                await Promise.all(orphans.map(a => completeArc(a.id).catch(() => {})));
                orphans.forEach(a => { a.status = 'completed'; });
            }

            setArcs(sorted);
        }).finally(() => setLoading(false));
    }, [profile?.uid]);

    const activeArc = [...arcs]
        .filter(a => a.status === 'active')
        .sort((a, b) => b.arcNumber - a.arcNumber)[0] ?? null;

    const completedArcs = arcs
        .filter(a => a.status === 'completed')
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

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <StatTile icon={BookOpen}    label="Total Arc"        value={arcs.length}      grad="brand" />
                <StatTile icon={Trophy}      label="Quest Diselesaikan" value={totalQuests}    grad="amber" />
                <StatTile icon={CheckCircle2} label="Arc Selesai"     value={completedArcs.length} grad="green" />
            </div>

            {/* Empty state */}
            {arcs.length === 0 && (
                <GlassCard className="p-12 text-center">
                    <BookOpen className="w-8 h-8 text-ink-muted mx-auto mb-3" />
                    <p className="text-ink font-bold">Belum ada arc</p>
                    <p className="text-ink-soft text-sm mt-1">Buka dashboard untuk memulai arc pertamamu.</p>
                </GlassCard>
            )}

            {/* Active Arc */}
            {activeArc && (
                <div className="space-y-2">
                    <p className="text-ink-muted text-[10px] uppercase tracking-widest font-bold">Arc Aktif</p>
                    <ArcCard arc={activeArc} defaultOpen />
                </div>
            )}

            {/* Completed Arcs */}
            {completedArcs.length > 0 && (
                <div className="space-y-3">
                    <p className="text-ink-muted text-[10px] uppercase tracking-widest font-bold">
                        Chapter Sebelumnya · {completedArcs.length} arc selesai
                    </p>
                    <div className="relative">
                        {/* Timeline vertical line */}
                        <div className="absolute left-5 top-3 bottom-3 w-px bg-line" />
                        <div className="space-y-3">
                            {completedArcs.map((arc) => (
                                <div key={arc.id} className="relative pl-12">
                                    <div className="absolute left-[14px] top-5 w-2.5 h-2.5 rounded-full bg-brand/30 border-2 border-brand/50" />
                                    <ArcCard arc={arc} defaultOpen={false} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Arc Card ────────────────────────────────────────────────────

function ArcCard({ arc, defaultOpen }: { arc: StoryArc; defaultOpen: boolean }) {
    const [open, setOpen] = useState(defaultOpen);
    const isActive = arc.status === 'active';

    const daysRemaining = isActive
        ? Math.max(0, Math.ceil((new Date(arc.endDate).getTime() - Date.now()) / 86_400_000))
        : 0;
    const progressPct = isActive
        ? Math.min(100, ((14 - daysRemaining) / 14) * 100)
        : 100;

    return (
        <GlassCard className={isActive ? 'ring-2 ring-brand/25' : ''}>
            {/* Header row — always visible */}
            <button
                type="button"
                onClick={() => setOpen(v => !v)}
                className="w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-surface-2/40 transition-colors rounded-card"
            >
                {/* Arc number chip */}
                <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-sm shadow-sm
                    ${isActive
                        ? 'text-white'
                        : 'bg-surface-2 text-ink-muted border border-line'
                    }`}
                    style={isActive ? { background: 'linear-gradient(135deg, #4f7cff 0%, #38bdf8 100%)' } : undefined}
                >
                    {arc.arcNumber}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-ink font-extrabold text-base leading-tight truncate">{arc.title}</h2>
                        {isActive
                            ? <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand/10 text-brand border border-brand/20">Aktif</span>
                            : <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-success-soft text-success border border-success/20 flex items-center gap-1">
                                <CheckCircle2 className="w-2.5 h-2.5" /> Selesai
                              </span>
                        }
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-ink-muted text-xs">
                        <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(arc.startDate)} — {formatDate(arc.endDate)}
                        </span>
                        <span className="flex items-center gap-1">
                            <Swords className="w-3 h-3" />
                            {arc.questsCompleted} quest
                        </span>
                    </div>
                </div>

                <span className={`text-ink-muted transition-transform duration-200 shrink-0 ${open ? 'rotate-180' : ''}`}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                        <path d="M6 8L1 3h10L6 8z" />
                    </svg>
                </span>
            </button>

            {/* Expandable body */}
            {open && (
                <div className="px-5 pb-5 space-y-4 border-t border-line">
                    {/* Theme chip */}
                    <div className="pt-4">
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-brand bg-brand-soft px-3 py-1 rounded-full">
                            <Sparkles className="w-3 h-3" /> {arc.theme}
                        </span>
                    </div>

                    {/* Narrative */}
                    <div className="bg-brand-soft rounded-xl px-4 py-3 flex gap-2.5">
                        <Sparkles className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                        <p className="text-ink-soft text-sm italic leading-relaxed">"{arc.narrative}"</p>
                    </div>

                    {/* Weekly goals */}
                    <div>
                        <p className="text-ink-muted text-[10px] font-bold uppercase tracking-widest mb-2">Target Arc</p>
                        <ul className="space-y-2">
                            {arc.weeklyGoals.map((goal, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-ink-soft">
                                    {isActive
                                        ? <Circle className="w-4 h-4 text-brand/40 mt-0.5 shrink-0" />
                                        : <CheckCircle2 className="w-4 h-4 text-success/60 mt-0.5 shrink-0" />
                                    }
                                    <span>{goal}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Progress bar — only for active */}
                    {isActive && (
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-ink-muted text-[10px] font-bold uppercase tracking-widest">Waktu Berjalan</span>
                                <span className="text-ink-soft text-[10px] font-extrabold">
                                    {daysRemaining > 0 ? `${daysRemaining} hari tersisa` : 'Berakhir hari ini'}
                                </span>
                            </div>
                            <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden border border-line">
                                <div
                                    className="h-full rounded-full transition-all duration-700"
                                    style={{
                                        width: `${progressPct}%`,
                                        background: 'linear-gradient(90deg, #4f7cff 0%, #38bdf8 100%)',
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}
        </GlassCard>
    );
}
