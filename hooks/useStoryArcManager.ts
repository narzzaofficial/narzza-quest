'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
    subscribeToAllArcs,
    deleteArc as dbDeleteArc,
    deleteAIQuestsForArc,
    createArc,
    completeArc,
    getArcHistory,
    getAIMemory,
} from '@/lib/db';
import { formatGoal } from '@/constants/goal';
import type { StoryArc, UserProfile } from '@/types';

/**
 * Manages the full arc list for the Story Arc page.
 * Unlike useStoryArc, this hook does NOT auto-generate arcs —
 * generation is always manual (user-triggered).
 */
export function useStoryArcManager(profile: UserProfile | null) {
    const [arcs, setArcs]           = useState<StoryArc[]>([]);
    const [loading, setLoading]     = useState(true);
    const [generating, setGenerating] = useState(false);
    const [error, setError]         = useState<string | null>(null);
    const generatingRef             = useRef(false);

    useEffect(() => {
        if (!profile?.uid) { setLoading(false); return; }
        const unsub = subscribeToAllArcs(profile.uid, (all) => {
            // Auto-complete orphaned active arcs (keep only the latest active)
            const activeArcs = all.filter(a => a.status === 'active');
            if (activeArcs.length > 1) {
                const sorted = [...activeArcs].sort((a, b) => a.arcNumber - b.arcNumber);
                sorted.slice(0, -1).forEach(a => completeArc(a.id).catch(() => {}));
            }
            setArcs(all);
            setLoading(false);
        });
        return () => unsub();
    }, [profile?.uid]);

    const activeArc    = arcs.find(a => a.status === 'active') ?? null;
    const latestArc    = arcs.length > 0 ? arcs[arcs.length - 1] : null;
    const latestArcNum = latestArc?.arcNumber ?? 0;

    const generateNewArc = useCallback(async () => {
        if (!profile || generatingRef.current) return;
        generatingRef.current = true;
        setGenerating(true);
        setError(null);
        try {
            const memory = await getAIMemory(profile.uid).catch(() => null);
            const history = await getArcHistory(profile.uid);

            // Complete all active arcs before creating a new one
            await Promise.all(
                history
                    .filter(a => a.status === 'active')
                    .map(a => completeArc(a.id).catch(() => {}))
            );

            const completedHistory = history
                .filter(a => a.status === 'completed')
                .sort((a, b) => a.arcNumber - b.arcNumber);

            const arcNumber  = history.length + 1;
            const previousArc = completedHistory[completedHistory.length - 1] ?? null;
            const arcHistory  = completedHistory.map(a => ({
                arcNumber: a.arcNumber,
                title: a.title,
                theme: a.theme,
                questsCompleted: a.questsCompleted,
            }));

            const res = await fetch('/api/ai/generate-arc', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    displayName: profile.displayName,
                    level: profile.level,
                    streak: profile.streak,
                    arcNumber,
                    goalSummary: formatGoal(profile.goal) || undefined,
                    memorySummary: memory?.summary,
                    previousArc: previousArc ? {
                        title: previousArc.title,
                        theme: previousArc.theme,
                        narrative: previousArc.narrative,
                        weeklyGoals: previousArc.weeklyGoals,
                        questsCompleted: previousArc.questsCompleted,
                    } : undefined,
                    arcHistory: arcHistory.length > 0 ? arcHistory : undefined,
                }),
            });

            const draft = await res.json();
            if (!res.ok) throw new Error(draft?.error ?? 'Gagal generate arc.');
            await createArc(profile.uid, draft, arcNumber);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Gagal generate arc.');
        } finally {
            setGenerating(false);
            generatingRef.current = false;
        }
    }, [profile]);

    const deleteLatestArc = useCallback(async () => {
        if (!profile || !latestArc) return;
        setError(null);
        try {
            // Delete arc's quests first, then the arc itself
            await deleteAIQuestsForArc(profile.uid, latestArc.startDate, latestArc.endDate);
            await dbDeleteArc(latestArc.id);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Gagal menghapus arc.');
        }
    }, [profile, latestArc]);

    return {
        arcs,
        loading,
        generating,
        error,
        activeArc,
        latestArcNum,
        generateNewArc,
        deleteLatestArc,
    };
}
