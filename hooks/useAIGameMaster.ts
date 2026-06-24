'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAIQuests } from '@/hooks/useAIQuests';
import { useStoryArc } from '@/hooks/useStoryArc';
import { useSituation } from '@/hooks/useSituation';
import { useWorkTasks } from '@/hooks/useWorkTasks';
import { useActivityLog } from '@/hooks/useActivityLog';
import {
    subscribeToQuests,
    getJournals,
    getAIMemory,
    saveAIMemory,
    getDailyReview,
    saveDailyReview,
} from '@/lib/db';
import { isAIQuest } from '@/constants/ai';
import { formatGoal } from '@/constants/goal';
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
    const situation = useSituation(profile?.uid);
    const workTasks = useWorkTasks(profile?.uid);
    const activityLog = useActivityLog(profile?.uid);

    const [allQuests, setAllQuests] = useState<Quest[]>([]);
    const [journals, setJournals] = useState<JournalEntry[]>([]);
    const [goals, setGoals] = useState('');

    const [memory, setMemory] = useState<AIMemory | null>(null);
    const [memoryLoading, setMemoryLoading] = useState(false);
    const [memoryError, setMemoryError] = useState<string | null>(null);

    const [review, setReview] = useState<DailyReview | null>(null);
    const [reviewLoading, setReviewLoading] = useState(false);
    const [reviewError, setReviewError] = useState<string | null>(null);

    // Track whether initial async fetches are done — auto-review must wait for both
    const [reviewFetching, setReviewFetching] = useState(true);
    const [journalsFetching, setJournalsFetching] = useState(true);

    useEffect(() => {
        if (!profile?.uid) return;
        const unsub = subscribeToQuests(profile.uid, setAllQuests);
        setJournalsFetching(true);
        getJournals(profile.uid)
            .then(setJournals)
            .catch(() => {})
            .finally(() => setJournalsFetching(false));
        getAIMemory(profile.uid).then(setMemory).catch(() => {});
        setReviewFetching(true);
        getDailyReview(profile.uid, todayKey())
            .then(setReview)
            .catch(() => {})
            .finally(() => setReviewFetching(false));
        return () => unsub();
    }, [profile?.uid]);

    const aiQuests = useMemo(() => allQuests.filter((q) => isAIQuest(q.createdBy)), [allQuests]);
    const active = useMemo(() => aiQuests.filter((q) => ACTIVE_STATUSES.includes(q.status)), [aiQuests]);
    const completed = useMemo(() => aiQuests.filter((q) => q.status === 'approved'), [aiQuests]);

    // Phase 4 — completion rate last 7 days
    const completionRate7d = useMemo(() => {
        const sevenDaysAgo = new Date(Date.now() - 7 * 86_400_000).toISOString();
        const recent = aiQuests.filter((q) => (q.createdAt || '') >= sevenDaysAgo);
        if (recent.length === 0) return undefined;
        const approvedRecent = recent.filter((q) => q.status === 'approved').length;
        return approvedRecent / recent.length;
    }, [aiQuests]);

    // Phase 3 — Story Arc (filters by arc.startDate internally)
    const storyArc = useStoryArc({ profile: profile ?? null, memory, approvedQuests: completed });

    // Build life context snapshot for quest generation
    const lifeContext = useMemo(() => {
        const s = situation.situation;
        const activeTasks = workTasks.tasks
            .filter(t => t.status !== 'done')
            .slice(0, 5)
            .map(t => `${t.title} [${t.priority}]`);

        const activityMins = activityLog.entries.reduce((acc, e) => {
            const mins = activityLog.getDurationMinutes(e);
            acc[e.category] = (acc[e.category] ?? 0) + mins;
            return acc;
        }, {} as Record<string, number>);
        const todayActivitiesSummary = Object.entries(activityMins)
            .map(([cat, mins]) => `${cat} ${Math.round(mins)}m`)
            .join(', ') || undefined;

        return {
            situationStatus: s?.currentStatus,
            workload: s?.workload,
            weekFocus: s?.weekFocus || undefined,
            activeWorkTasks: activeTasks.length > 0 ? activeTasks : undefined,
            todayActivitiesSummary,
        };
    }, [situation.situation, workTasks.tasks, activityLog.entries, activityLog.getDurationMinutes]);

    // Arc-driven generation — North Star is captured in the arc, not passed directly
    const generate = useCallback(
        () => {
            return aiq.generate(
                memory?.summary,
                completionRate7d,
                storyArc.arc?.theme,
                storyArc.arc?.narrative,
                storyArc.arc?.weeklyGoals,
                lifeContext,
            );
        },
        [aiq, memory?.summary, completionRate7d, storyArc.arc, lifeContext]
    );

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
                    goals: [formatGoal(profile.goal), goals].filter(Boolean).join(' — ') || undefined,
                    previousSummary: memory?.summary,
                    aiSettings: profile.aiSettings,
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
                    goalSummary: formatGoal(profile.goal) || undefined,
                    aiSettings: profile.aiSettings,
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

    // Auto daily review: only run after journals AND existing review are fully loaded
    const autoReviewRef = useRef(false);
    useEffect(() => {
        if (reviewFetching || journalsFetching) return; // wait for initial loads
        if (review || reviewLoading || autoReviewRef.current || !profile || completed.length === 0) return;
        autoReviewRef.current = true;
        runDailyReview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [review, reviewLoading, reviewFetching, journalsFetching, profile, completed.length]);

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
        // phase 3 — story arc
        storyArc,
        // phase 4 — dynamic difficulty
        completionRate7d,
    };
}
