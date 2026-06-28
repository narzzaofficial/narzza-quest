'use client';

import React, { useEffect, useState } from 'react';
import { BookMarked, CheckCircle2, Loader2, Trophy, BookOpen, Sparkles, RefreshCw, Lock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useStoryArcManager } from '@/hooks/useStoryArcManager';
import { subscribeToQuests } from '@/lib/db';
import { isAIQuest } from '@/constants/ai';
import PageHeader from '@/components/ui/PageHeader';
import GlassCard from '@/components/ui/GlassCard';
import StatTile from '@/components/ui/StatTile';
import { ArcHistoryCard } from '@/components/story-arc/ArcHistoryCard';
import OnboardingTour from '@/components/system/OnboardingTour';
import { useOnboardingTour } from '@/hooks/useOnboardingTour';
import { STORY_ARC_TOUR_STEPS } from '@/constants/onboardingTours';
import { DUMMY_STORY_ARC } from '@/constants/onboardingPreviewData';
import Badge from '@/components/ui/Badge';
import type { Quest } from '@/types';

const ACTIVE_STATUSES = ['pending', 'in_progress', 'submitted', 'active'];

export default function StoryArcPage() {
    const { profile } = useAuth();
    const {
        arcs, loading, activeArc, generating, error,
        generateNewArc, latestArcNum, deleteLatestArc,
    } = useStoryArcManager(profile ?? null);
    const [quests, setQuests] = useState<Quest[]>([]);

    useEffect(() => {
        if (!profile?.uid) return;
        return subscribeToQuests(profile.uid, setQuests);
    }, [profile?.uid]);

    const activeQuestCount = quests.filter(
        q => isAIQuest(q.createdBy) && ACTIVE_STATUSES.includes(q.status)
    ).length;

    // All arcs sorted newest first for display
    const sortedArcs   = [...arcs].sort((a, b) => b.arcNumber - a.arcNumber);
    const completedArcs = sortedArcs.filter(a => a.status === 'completed');
    const totalQuests  = arcs.reduce((sum, a) => sum + a.questsCompleted, 0);
    const { run: isOnboarding } = useOnboardingTour('story-arc', STORY_ARC_TOUR_STEPS);
    const showDummyHistory = isOnboarding && sortedArcs.length === 0;

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-brand animate-spin" />
            </div>
        );
    }

    const canGenerate = !activeArc && !generating;
    // Lock only applies when there were previous arcs — orphaned quests shouldn't block fresh start
    const isLocked    = arcs.length > 0 && activeQuestCount > 0;

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
            <OnboardingTour tourKey="story-arc" steps={STORY_ARC_TOUR_STEPS} />
            <div data-tour="story-arc-header">
                <PageHeader
                    icon={<BookMarked className="w-6 h-6 text-white" />}
                    title="Story Arc"
                    subtitle="Setiap arc adalah chapter 14 hari dalam hidupmu — dibuat AI Game Master dari tujuan & konteksmu."
                    grad="brand"
                />
            </div>

            <div data-tour="story-arc-stats" className="grid grid-cols-3 gap-2 sm:gap-4">
                <StatTile icon={BookOpen}     label="Total Arc"          value={arcs.length}  grad="brand" />
                <StatTile icon={Trophy}       label="Quest Diselesaikan" value={totalQuests}       grad="amber" />
                <StatTile icon={CheckCircle2} label="Arc Selesai"        value={completedArcs.length} grad="green" />
            </div>

            {/* Generate / status panel */}
            <GlassCard data-tour="story-arc-generate" className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1">
                        <p className="text-brand text-[10px] uppercase tracking-widest font-bold">AI Game Master</p>
                        <h3 className="text-ink font-extrabold text-base">
                            {activeArc ? 'Arc Aktif Sedang Berjalan' : 'Belum Ada Arc Aktif'}
                        </h3>
                        <p className="text-ink-soft text-sm mt-0.5">
                            {activeArc
                                ? 'Selesaikan arc ini atau tunggu 14 hari untuk membuka arc baru.'
                                : 'Generate arc baru agar AI Game Master bisa menyusun chapter berikutnya.'}
                        </p>
                    </div>

                    {canGenerate ? (
                        isLocked ? (
                            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-surface-2 border border-line text-ink-muted text-sm font-bold">
                                <Lock className="w-4 h-4 shrink-0" />
                                <span>Selesaikan {activeQuestCount} quest aktif dulu</span>
                            </div>
                        ) : (
                            <button
                                onClick={generateNewArc}
                                disabled={generating}
                                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-brand text-white font-bold shadow-card hover:bg-brand-hover transition-colors disabled:opacity-60 shrink-0"
                            >
                                <Sparkles className="w-4 h-4" />
                                Generate Arc Baru
                            </button>
                        )
                    ) : generating ? (
                        <div className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-surface-2 text-ink-muted font-bold text-sm shrink-0">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Menyusun arc...
                        </div>
                    ) : (
                        <div className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-surface-2 border border-line text-ink-muted text-sm font-bold shrink-0">
                            <RefreshCw className="w-4 h-4" />
                            Arc sedang aktif
                        </div>
                    )}
                </div>

                {error && (
                    <p className="mt-3 text-sm text-danger font-semibold">⚠ {error}</p>
                )}
            </GlassCard>

            {showDummyHistory ? (
                <div data-tour="story-arc-history" className="relative space-y-3">
                    <div className="flex items-center gap-2">
                        <p className="text-ink-muted text-[10px] uppercase tracking-widest font-bold">Semua Chapter</p>
                        <Badge variant="B">Contoh</Badge>
                    </div>
                    <div className="relative">
                        <div className="absolute left-5 top-3 bottom-3 w-px bg-line" />
                        <div className="space-y-3">
                            <div className="relative pl-12">
                                <div className="absolute left-3.5 top-5 w-2.5 h-2.5 rounded-full border-2 bg-brand border-brand" />
                                <ArcHistoryCard arc={DUMMY_STORY_ARC} defaultOpen />
                            </div>
                        </div>
                    </div>
                </div>
            ) : sortedArcs.length === 0 ? (
                <GlassCard data-tour="story-arc-history" className="p-12 text-center">
                    <BookOpen className="w-8 h-8 text-ink-muted mx-auto mb-3" />
                    <p className="text-ink font-bold">Belum ada arc</p>
                    <p className="text-ink-soft text-sm mt-1">Generate arc pertamamu di atas.</p>
                </GlassCard>
            ) : (
                <div data-tour="story-arc-history" className="space-y-3">
                    <p className="text-ink-muted text-[10px] uppercase tracking-widest font-bold">
                        Semua Chapter · {sortedArcs.length} arc
                    </p>
                    <div className="relative">
                        <div className="absolute left-5 top-3 bottom-3 w-px bg-line" />
                        <div className="space-y-3">
                            {sortedArcs.map((arc) => (
                                <div key={arc.id} className="relative pl-12">
                                    <div className={`absolute left-3.5 top-5 w-2.5 h-2.5 rounded-full border-2 ${
                                        arc.status === 'active'
                                            ? 'bg-brand border-brand'
                                            : 'bg-brand/30 border-brand/50'
                                    }`} />
                                    <ArcHistoryCard
                                        arc={arc}
                                        defaultOpen={arc.status === 'active'}
                                        isDeletable={arc.arcNumber === latestArcNum}
                                        onDelete={deleteLatestArc}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
