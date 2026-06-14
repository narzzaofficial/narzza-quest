'use client';

import { useEffect, useRef, useState } from 'react';
import type { UserProfile } from '@/types';

export type MilestoneType =
    | 'level_up'
    | 'streak_7'
    | 'streak_14'
    | 'streak_30'
    | 'streak_100'
    | 'first_quest';

export interface Milestone {
    type: MilestoneType;
    level?: number;
    title?: string;
    streak?: number;
}

const STREAK_MILESTONES = [7, 14, 30, 100] as const;

function seenKey(tag: string) {
    return `ms_seen_${tag}`;
}

function hasSeen(key: string): boolean {
    try { return localStorage.getItem(key) === '1'; } catch { return false; }
}

function markSeen(key: string): void {
    try { localStorage.setItem(key, '1'); } catch { /* safari private */ }
}

export function useMilestone(profile: UserProfile | null) {
    const [queue, setQueue] = useState<Milestone[]>([]);
    const prevLevelRef = useRef<number | null>(null);
    const prevStreakRef = useRef<number | null>(null);
    const prevTotalRef = useRef<number | null>(null);
    const initRef = useRef(false);

    useEffect(() => {
        if (!profile) return;

        const { level, streak, totalQuestsCompleted, title } = profile;

        // On first render — just record baseline, no triggers
        if (!initRef.current) {
            prevLevelRef.current = level;
            prevStreakRef.current = streak;
            prevTotalRef.current = totalQuestsCompleted;
            initRef.current = true;
            return;
        }

        const prevLevel = prevLevelRef.current ?? level;
        const prevStreak = prevStreakRef.current ?? streak;
        const prevTotal = prevTotalRef.current ?? totalQuestsCompleted;
        const pending: Milestone[] = [];

        // First quest
        if (prevTotal === 0 && totalQuestsCompleted >= 1) {
            const key = seenKey('first_quest');
            if (!hasSeen(key)) { markSeen(key); pending.push({ type: 'first_quest' }); }
        }

        // Level up
        if (level > prevLevel) {
            const key = seenKey(`level_${level}`);
            if (!hasSeen(key)) { markSeen(key); pending.push({ type: 'level_up', level, title }); }
        }

        // Streak milestones
        for (const ms of STREAK_MILESTONES) {
            if (prevStreak < ms && streak >= ms) {
                const key = seenKey(`streak_${ms}`);
                if (!hasSeen(key)) {
                    markSeen(key);
                    pending.push({ type: `streak_${ms}` as MilestoneType, streak });
                    break; // one at a time
                }
            }
        }

        if (pending.length > 0) {
            setQueue(prev => [...prev, ...pending]);
        }

        prevLevelRef.current = level;
        prevStreakRef.current = streak;
        prevTotalRef.current = totalQuestsCompleted;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [profile?.level, profile?.streak, profile?.totalQuestsCompleted]);

    const current = queue[0] ?? null;
    const dismiss = () => setQueue(prev => prev.slice(1));

    return { milestone: current, dismiss };
}
