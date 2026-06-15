'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, Circle, CheckCircle2, Sparkles, ExternalLink } from 'lucide-react';
import type { QuestStatus, StoryArc } from '@/types';

interface ArcQuest {
    id: string;
    title: string;
    status: QuestStatus;
}

interface Props {
    arc: StoryArc | null;
    loading: boolean;
    generating: boolean;
    daysRemaining: number;
    progressPct: number;
    justCompleted: StoryArc | null;
    onDismissCompleted: () => void;
    arcQuests?: ArcQuest[];
}

export function ArcCard({
    arc, loading, generating, daysRemaining, progressPct,
    justCompleted, onDismissCompleted,
    arcQuests = [],
}: Props) {

    // Arc completion celebration
    if (justCompleted) {
        return (
            <section className="rounded-card shadow-card bg-surface glass">
                <div className="px-5 py-8 text-center space-y-3">
                    <div className="text-4xl">🎉</div>
                    <h2 className="font-extrabold text-lg text-ink">{justCompleted.title} Selesai!</h2>
                    <p className="text-ink-muted text-sm max-w-xs mx-auto leading-relaxed">
                        Chapter ini telah selesai. Buka Story Arc untuk menyusun arc petualangan baru.
                    </p>
                    <div className="flex items-center justify-center gap-3 mt-2">
                        <button
                            onClick={onDismissCompleted}
                            className="bg-surface-2 text-ink-muted border border-line hover:bg-surface transition px-4 py-2 rounded-xl font-bold text-sm"
                        >
                            Tutup
                        </button>
                        <Link
                            href="/story-arc"
                            onClick={onDismissCompleted}
                            className="bg-brand text-white hover:bg-brand-hover transition px-5 py-2 rounded-xl font-bold text-sm shadow-card inline-flex items-center gap-1.5"
                        >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Buka Story Arc
                        </Link>
                    </div>
                </div>
            </section>
        );
    }

    // Loading / generating skeleton
    if (loading || (generating && !arc)) {
        return (
            <section className="rounded-card shadow-card bg-surface glass px-5 py-4">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-xl bg-surface-2 animate-pulse shrink-0" />
                    <div className="space-y-2 flex-1">
                        <div className="h-3 bg-surface-2 rounded animate-pulse w-24" />
                        <div className="h-4 bg-surface-2 rounded animate-pulse w-48" />
                    </div>
                </div>
                <div className="h-1.5 bg-surface-2 rounded-full animate-pulse mb-4" />
                <div className="space-y-2">
                    <div className="h-3 bg-surface-2 rounded animate-pulse w-full" />
                    <div className="h-3 bg-surface-2 rounded animate-pulse w-4/5" />
                </div>
                <p className="text-ink-muted text-xs mt-4">Game Master sedang menyusun arc petualanganmu...</p>
            </section>
        );
    }

    if (!arc) return null;

    return (
        <section className="rounded-card shadow-card bg-surface glass">
            {/* Header */}
            <div className="px-5 pt-4 pb-3 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-brand-soft flex items-center justify-center shrink-0">
                        <BookOpen className="w-4 h-4 text-brand" />
                    </div>
                    <div>
                        <p className="text-ink-muted text-[10px] font-bold uppercase tracking-widest">Story Arc</p>
                        <h2 className="text-ink font-extrabold text-base leading-tight">{arc.title}</h2>
                    </div>
                </div>
                <Link
                    href="/story-arc"
                    className="p-1.5 text-ink-muted hover:text-brand hover:bg-brand-soft rounded-lg transition-colors"
                    title="Kelola Story Arc"
                >
                    <ExternalLink className="w-4 h-4" />
                </Link>
            </div>

            {/* Progress bar */}
            <div className="px-5 pb-4">
                <div className="flex items-center justify-between mb-1.5">
                    <span className="text-ink-muted text-[10px] font-bold uppercase tracking-widest">Progress Arc</span>
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

            <div className="border-t border-line mx-5" />

            {/* Body */}
            <div className="px-5 py-4 space-y-4">
                {/* GM Narrative */}
                <div className="bg-brand-soft rounded-xl px-4 py-3 flex gap-2.5">
                    <Sparkles className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                    <p className="text-ink-soft text-sm italic leading-relaxed">"{arc.narrative}"</p>
                </div>

                {/* Weekly Goals */}
                <div>
                    <p className="text-ink-muted text-[10px] font-bold uppercase tracking-widest mb-2.5">Target Arc</p>
                    <ul className="space-y-2">
                        {arc.weeklyGoals.map((goal, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-ink-soft">
                                <Circle className="w-4 h-4 text-brand/40 mt-0.5 shrink-0" />
                                <span>{goal}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Quest list */}
                {arcQuests.length > 0 && (
                    <div>
                        <p className="text-ink-muted text-[10px] font-bold uppercase tracking-widest mb-2.5">Quest Arc Ini</p>
                        <ul className="space-y-1.5">
                            {arcQuests.map((q) => {
                                const done   = q.status === 'approved';
                                const missed = q.status === 'missed' || q.status === 'rejected';
                                return (
                                    <li key={q.id} className="flex items-center gap-2">
                                        {done
                                            ? <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
                                            : missed
                                                ? <Circle className="w-3.5 h-3.5 text-danger/40 shrink-0" />
                                                : <Circle className="w-3.5 h-3.5 text-brand/40 shrink-0" />
                                        }
                                        <span className={`text-xs leading-snug truncate ${done ? 'text-ink-muted line-through' : 'text-ink-soft'}`}>
                                            {q.title}
                                        </span>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                )}

                {/* Footer */}
                <div className="pt-2 border-t border-line">
                    <div className="flex items-center gap-2">
                        <span className="text-brand font-extrabold text-lg">{arc.questsCompleted}</span>
                        <span className="text-ink-muted text-xs">quest selesai dalam arc ini</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
