'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAIQuests } from '@/hooks/useAIQuests';
import {
    subscribeToQuests,
    getJournals,
    getAIMemory,
    saveAIMemory,
    getDailyReview,
    saveDailyReview,
} from '@/lib/db';
import { isAIQuest } from '@/constants/ai';
import type { AIMemory, DailyReview, JournalEntry, Quest } from '@/types';

const ACTIVE_STATUSES: Quest['status'][] = ['pending', 'in_progress', 'submitted', 'active'];

function todayKey(): string {
    return new Date().toISOString().split('T')[0];
}

/**
 * Orchestrates the AI Game Master page: quest generation (memory-aware),
 * the realtime list of AI quests, plus AI Memory and Daily Review (Fase 2).
 */
export function useAIGameMaster() {
    const { profile } = useAuth();
    const aiq = useAIQuests(profile);

    const [allQuests, setAllQuests] = useState<Quest[]>([]);
    const [journals, setJournals] = useState<JournalEntry[]>([]);
    const [goals, setGoals] = useState('');

    const [memory, setMemory] = useState<AIMemory | null>(null);
    const [memoryLoading, setMemoryLoading] = useState(false);
    const [memoryError, setMemoryError] = useState<string | null>(null);

    const [review, setReview] = useState<DailyReview | null>(null);
    const [reviewLoading, setReviewLoading] = useState(false);
    const [reviewError, setReviewError] = useState<string | null>(null);

    useEffect(() => {
        if (!profile?.uid) return;
        const unsub = subscribeToQuests(profile.uid, setAllQuests);
        getJournals(profile.uid).then(setJournals).catch(() => {});
        getAIMemory(profile.uid).then(setMemory).catch(() => {});
        getDailyReview(profile.uid, todayKey()).then(setReview).catch(() => {});
        return () => unsub();
    }, [profile?.uid]);

    const aiQuests = useMemo(() => allQuests.filter((q) => isAIQuest(q.createdBy)), [allQuests]);
    const active = useMemo(() => aiQuests.filter((q) => ACTIVE_STATUSES.includes(q.status)), [aiQuests]);
    const completed = useMemo(() => aiQuests.filter((q) => q.status === 'approved'), [aiQuests]);

    // Memory-aware generation
    const generate = useCallback((g?: string) => aiq.generate(g, memory?.summary), [aiq, memory?.summary]);

    const refreshMemory = useCallback(async () => {
        if (!profile) return;
        setMemoryLoading(true);
        setMemoryError(null);
        try {
            const res = await fetch('/api/ai/update-memory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    displayName: profile.displayName,
                    level: profile.level,
                    title: profile.title,
                    streak: profile.streak,
                    totalQuestsCompleted: profile.totalQuestsCompleted,
                    totalHoursWorked: profile.totalHoursWorked,
                    recentQuestTitles: allQuests.slice(0, 8).map((q) => q.title),
                    recentJournalTitles: journals.slice(0, 8).map((j) => j.questTitle || '').filter(Boolean),
                    goals: goals || undefined,
                    previousSummary: memory?.summary,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || 'Gagal update memory.');
            const insights: string[] = data.insights || [];
            await saveAIMemory(profile.uid, { summary: data.summary, insights });
            setMemory({ uid: profile.uid, summary: data.summary, insights, updatedAt: new Date().toISOString() });
        } catch (e) {
            setMemoryError(e instanceof Error ? e.message : 'Gagal update memory.');
        } finally {
            setMemoryLoading(false);
        }
    }, [profile, allQuests, journals, goals, memory?.summary]);

    const runDailyReview = useCallback(async () => {
        if (!profile) return;
        setReviewLoading(true);
        setReviewError(null);
        try {
            const today = todayKey();
            const todays = journals.filter((j) => (j.createdAt || '').split('T')[0] === today);
            const expEarnedToday = todays.reduce((s, j) => s + (j.expEarned || 0), 0);

            const res = await fetch('/api/ai/daily-review', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    displayName: profile.displayName,
                    level: profile.level,
                    streak: profile.streak,
                    questsCompletedToday: todays.length,
                    expEarnedToday,
                    completedTitles: todays.map((j) => j.questTitle || '').filter(Boolean),
                    memorySummary: memory?.summary,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || 'Gagal generate review.');

            const payload = {
                summary: data.summary,
                wins: data.wins || [],
                focus: data.focus || [],
                encouragement: data.encouragement || '',
                questsCompleted: todays.length,
                expEarned: expEarnedToday,
            };
            await saveDailyReview(profile.uid, today, payload);
            setReview({ uid: profile.uid, date: today, createdAt: new Date().toISOString(), ...payload });
        } catch (e) {
            setReviewError(e instanceof Error ? e.message : 'Gagal generate review.');
        } finally {
            setReviewLoading(false);
        }
    }, [profile, journals, memory?.summary]);

    return {
        profile,
        goals,
        setGoals,
        aiQuests,
        active,
        completed,
        // generation
        generating: aiq.generating,
        error: aiq.error,
        createdCount: aiq.createdCount,
        generate,
        // memory
        memory,
        memoryLoading,
        memoryError,
        refreshMemory,
        // daily review
        review,
        reviewLoading,
        reviewError,
        runDailyReview,
    };
}
