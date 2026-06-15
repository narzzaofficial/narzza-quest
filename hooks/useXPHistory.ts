'use client';

import { useCallback, useEffect, useState } from 'react';
import { getJournalsRange } from '@/lib/db';
import type { JournalEntry } from '@/types';

export interface DayXP {
    date: string; // YYYY-MM-DD
    totalXP: number;
    entries: JournalEntry[];
}

export function useXPHistory(uid: string | undefined, daysBack = 14) {
    const [days,    setDays]    = useState<DayXP[]>([]);
    const [loading, setLoading] = useState(false);

    const load = useCallback(async () => {
        if (!uid) return;
        setLoading(true);
        try {
            const today = new Date().toISOString().split('T')[0];
            const from  = new Date(Date.now() - daysBack * 86_400_000).toISOString().split('T')[0];

            const journals = await getJournalsRange(uid, from, today);

            // Build full date range so zero-XP days still appear
            const map: Record<string, JournalEntry[]> = {};
            for (let i = 0; i <= daysBack; i++) {
                const d = new Date(Date.now() - i * 86_400_000).toISOString().split('T')[0];
                map[d] = [];
            }
            for (const j of journals) {
                const date = j.createdAt.split('T')[0];
                if (map[date]) map[date].push(j);
                else map[date] = [j];
            }

            const result: DayXP[] = Object.entries(map)
                .map(([date, entries]) => ({
                    date,
                    totalXP: entries.reduce((s, e) => s + (e.expEarned ?? 0), 0),
                    entries,
                }))
                .sort((a, b) => b.date.localeCompare(a.date));

            setDays(result);
        } finally {
            setLoading(false);
        }
    }, [uid, daysBack]);

    useEffect(() => { load(); }, [load]);

    const totalXP = days.reduce((s, d) => s + d.totalXP, 0);
    const maxXP   = Math.max(...days.map((d) => d.totalXP), 1);

    return { days, loading, totalXP, maxXP, reload: load };
}
