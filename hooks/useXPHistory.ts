'use client';

import { useCallback, useEffect, useState } from 'react';
import { getJournalsRange, getMissedQuestsInRange } from '@/lib/db';
import { localDateStr, todayLocal, daysAgoLocal } from '@/lib/dateUtils';
import type { JournalEntry } from '@/types';

export interface DayXP {
    date: string; // YYYY-MM-DD
    earned: number;
    penalty: number;
    net: number;
    entries: JournalEntry[];
    missedTitles: string[];
}

export function useXPHistory(uid: string | undefined, daysBack = 14) {
    const [days,    setDays]    = useState<DayXP[]>([]);
    const [loading, setLoading] = useState(false);

    const load = useCallback(async () => {
        if (!uid) return;
        setLoading(true);
        try {
            const today = todayLocal();
            const from  = daysAgoLocal(daysBack);

            const [journals, missedList] = await Promise.all([
                getJournalsRange(uid, from, today),
                getMissedQuestsInRange(uid, from, today),
            ]);

            // Build full date scaffold (local dates) so zero-XP days still appear
            const map: Record<string, { entries: JournalEntry[]; earned: number; penalty: number; missedTitles: string[] }> = {};
            for (let i = 0; i <= daysBack; i++) {
                const d = daysAgoLocal(i);
                if (!map[d]) map[d] = { entries: [], earned: 0, penalty: 0, missedTitles: [] };
            }

            for (const j of journals) {
                const date = localDateStr(j.createdAt);
                if (!map[date]) map[date] = { entries: [], earned: 0, penalty: 0, missedTitles: [] };
                map[date].entries.push(j);
                map[date].earned += j.expEarned ?? 0;
            }
            for (const m of missedList) {
                if (!map[m.date]) map[m.date] = { entries: [], earned: 0, penalty: 0, missedTitles: [] };
                map[m.date].penalty      += m.penalty;
                map[m.date].missedTitles.push(m.questTitle);
            }

            const result: DayXP[] = Object.entries(map)
                .map(([date, v]) => ({ date, ...v, net: v.earned - v.penalty }))
                .sort((a, b) => b.date.localeCompare(a.date));

            setDays(result);
        } finally {
            setLoading(false);
        }
    }, [uid, daysBack]);

    useEffect(() => { load(); }, [load]);

    const totalEarned  = days.reduce((s, d) => s + d.earned,  0);
    const totalPenalty = days.reduce((s, d) => s + d.penalty, 0);
    const totalNet     = totalEarned - totalPenalty;
    const maxAbs       = Math.max(...days.map((d) => Math.max(d.earned, d.penalty)), 1);

    return { days, loading, totalEarned, totalPenalty, totalNet, maxAbs, reload: load };
}
