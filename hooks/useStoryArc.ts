'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
    subscribeToActiveArc,
    createArc,
    completeArc,
    getArcHistory,
    updateArcQuestsCompleted,
} from '@/lib/db';
import type { Quest, StoryArc, UserProfile, AIMemory } from '@/types';
import { formatGoal, hasGoal } from '@/constants/goal';

interface UseStoryArcOptions {
    profile: UserProfile | null;
    memory: AIMemory | null;
    approvedQuests: Quest[]; // all approved AI quests — filtered by arc.startDate internally
}

export function useStoryArc({ profile, memory, approvedQuests }: UseStoryArcOptions) {
    const [arc, setArc] = useState<StoryArc | null>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [justCompleted, setJustCompleted] = useState<StoryArc | null>(null);
    const generatingRef = useRef(false);

    useEffect(() => {
        if (!profile?.uid) { setLoading(false); return; }
        const unsub = subscribeToActiveArc(profile.uid, (activeArc) => {
            setArc(activeArc);
            setLoading(false);
        });
        return () => unsub();
    }, [profile?.uid]);

    // Sync approved quest count (only quests approved since this arc started)
    useEffect(() => {
        if (!arc) return;
        const count = approvedQuests.filter(q => {
            const approvedDate = (q.reviewedAt || q.updatedAt || '').split('T')[0];
            return approvedDate >= arc.startDate;
        }).length;
        if (arc.questsCompleted === count) return;
        updateArcQuestsCompleted(arc.id, count).catch(() => {});
    }, [arc, approvedQuests]);

    const generateNewArc = useCallback(async (isFirst = false) => {
        if (!profile || generatingRef.current) return;
        generatingRef.current = true;
        setGenerating(true);
        try {
            const history = await getArcHistory(profile.uid);

            // Complete ALL active arcs before creating a new one (avoids orphaned arcs)
            await Promise.all(
                history
                    .filter(a => a.status === 'active')
                    .map(a => completeArc(a.id).catch(() => {}))
            );

            const completedHistory = history
                .filter(a => a.status === 'completed')
                .sort((a, b) => a.arcNumber - b.arcNumber);

            const arcNumber = history.length + 1;
            const previousArc = completedHistory[completedHistory.length - 1] ?? null;
            const arcHistory = completedHistory.map(a => ({
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
            if (!res.ok) throw new Error(draft?.error || 'Gagal generate arc.');

            const newArc = await createArc(profile.uid, draft, arcNumber);
            setArc(newArc);

            if (!isFirst) {
                setJustCompleted(null); // clear completion modal after new arc starts
            }
        } catch (e) {
            console.error('Failed to generate arc:', e);
        } finally {
            setGenerating(false);
            generatingRef.current = false;
        }
    }, [profile, memory]);

    // Auto-generate first arc only after user has set their goal
    useEffect(() => {
        if (!loading && !arc && !generating && profile && hasGoal(profile.goal)) {
            generateNewArc(true);
        }
    }, [loading, arc, generating, profile, generateNewArc]);

    // Check if active arc has expired → complete it + trigger new one
    useEffect(() => {
        if (!arc || arc.status !== 'active') return;
        const today = new Date().toISOString().split('T')[0];
        if (today <= arc.endDate) return;

        // Arc expired — complete it
        completeArc(arc.id).then(() => {
            setJustCompleted(arc);
            generateNewArc(false);
        }).catch(() => {});
    }, [arc, generateNewArc]);

    const daysRemaining = arc
        ? Math.max(0, Math.ceil((new Date(arc.endDate).getTime() - Date.now()) / 86_400_000))
        : 0;

    const daysTotal = 14;
    const daysElapsed = arc ? daysTotal - daysRemaining : 0;
    const progressPct = arc ? Math.min(100, (daysElapsed / daysTotal) * 100) : 0;

    return {
        arc,
        loading,
        generating,
        justCompleted,
        daysRemaining,
        progressPct,
        generateNewArc,
        dismissCompleted: () => setJustCompleted(null),
    };
}
