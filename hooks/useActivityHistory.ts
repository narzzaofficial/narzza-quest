'use client';

import { useCallback, useEffect, useState } from 'react';
import { getActivitiesRange, getHabitLogs } from '@/lib/db';
import { localDateStr, todayLocal, daysAgoLocal } from '@/lib/dateUtils';
import type { ActivityEntry, HabitLog } from '@/types';

export interface DayActivity {
    date: string; // YYYY-MM-DD (UTC)
    entries: ActivityEntry[];
    completedEntries: ActivityEntry[];
    totalMinutes: number;
    avgMood: number | null;
    habitLogs: HabitLog[];
}

function getDurationMinutes(entry: ActivityEntry): number {
    const end = entry.endTime ? new Date(entry.endTime) : new Date();
    return Math.round((end.getTime() - new Date(entry.startTime).getTime()) / 60_000);
}

export function useActivityHistory(uid: string | undefined, daysBack = 14) {
    const [days,    setDays]    = useState<DayActivity[]>([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        if (!uid) { setLoading(false); return; }
        setLoading(true);
        try {
            const today = todayLocal();
            const from  = daysAgoLocal(daysBack);

            const [entries, allHabitLogs] = await Promise.all([
                getActivitiesRange(uid, from, today),
                getHabitLogs(uid, from, today),
            ]);

            // Group activities by local date
            const map: Record<string, ActivityEntry[]> = {};
            for (const e of entries) {
                const date = localDateStr(e.createdAt);
                if (!map[date]) map[date] = [];
                map[date].push(e);
            }

            // Collect all dates that have either activities or habit logs
            const allDates = new Set([
                ...Object.keys(map),
                ...allHabitLogs.map((l) => l.date), // habitLog.date already stored as local YYYY-MM-DD
            ]);

            const result: DayActivity[] = Array.from(allDates)
                .filter((date) => date < today) // today lives in the main timeline
                .map((date) => {
                    const dayEntries   = map[date] ?? [];
                    const completed    = dayEntries.filter((e) => !!e.endTime);
                    const totalMinutes = completed.reduce((s, e) => s + getDurationMinutes(e), 0);
                    const avgMood      = dayEntries.length
                        ? dayEntries.reduce((s, e) => s + e.mood, 0) / dayEntries.length
                        : null;
                    const habitLogs    = allHabitLogs.filter((l) => l.date === date);
                    return { date, entries: dayEntries, completedEntries: completed, totalMinutes, avgMood, habitLogs };
                })
                .sort((a, b) => b.date.localeCompare(a.date));

            setDays(result);
        } finally {
            setLoading(false);
        }
    }, [uid, daysBack]);

    useEffect(() => { load(); }, [load]);

    return { days, loading, reload: load, getDurationMinutes };
}
