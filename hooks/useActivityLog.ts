'use client';

import { useCallback, useEffect, useState } from 'react';
import {
    logActivity,
    endCurrentActivity,
    subscribeToTodayActivities,
} from '@/lib/db';
import type { ActivityEntry, ActivityCategory } from '@/types';

function todayStr() {
    return new Date().toISOString().split('T')[0];
}

export function useActivityLog(uid: string | undefined) {
    const [entries, setEntries] = useState<ActivityEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!uid) { setLoading(false); return; }
        const unsub = subscribeToTodayActivities(uid, todayStr(), (data) => {
            setEntries(data);
            setLoading(false);
        });
        return () => unsub();
    }, [uid]);

    const currentActivity = entries.find(e => e.endTime === null || e.endTime === undefined) ?? null;

    const switchActivity = useCallback(async (
        data: { title: string; category: ActivityCategory; mood: 1|2|3|4|5; energy: 1|2|3|4|5; note?: string }
    ) => {
        if (!uid) return;
        setSaving(true);
        setError(null);
        try {
            await logActivity(uid, data);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Gagal menyimpan aktivitas.');
        } finally {
            setSaving(false);
        }
    }, [uid]);

    const stopCurrent = useCallback(async () => {
        if (!uid) return;
        setSaving(true);
        try {
            await endCurrentActivity(uid);
        } finally {
            setSaving(false);
        }
    }, [uid]);

    // Duration helpers
    const getDurationMinutes = (entry: ActivityEntry): number => {
        const end = entry.endTime ? new Date(entry.endTime) : new Date();
        return Math.round((end.getTime() - new Date(entry.startTime).getTime()) / 60_000);
    };

    return {
        entries,
        currentActivity,
        loading,
        saving,
        error,
        switchActivity,
        stopCurrent,
        getDurationMinutes,
    };
}
