'use client';

import { useCallback, useEffect, useState } from 'react';
import {
    createHabit, deleteHabit, subscribeToHabits,
    toggleHabitLog, getHabitLogs,
} from '@/lib/db';
import type { Habit, HabitLog, ActivityCategory } from '@/types';

function todayStr() {
    return new Date().toISOString().split('T')[0];
}

export function useHabits(uid: string | undefined) {
    const [habits, setHabits] = useState<Habit[]>([]);
    const [todayLogs, setTodayLogs] = useState<HabitLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!uid) { setLoading(false); return; }
        const unsub = subscribeToHabits(uid, async (data) => {
            setHabits(data);
            // Fetch today's logs whenever habits update
            const logs = await getHabitLogs(uid, todayStr(), todayStr());
            setTodayLogs(logs);
            setLoading(false);
        });
        return () => unsub();
    }, [uid]);

    const add = useCallback(async (data: {
        name: string;
        icon: string;
        category: ActivityCategory;
        targetDays?: number[];
    }) => {
        if (!uid) return;
        setSaving(true);
        setError(null);
        try {
            await createHabit(uid, { ...data, targetDays: data.targetDays ?? [] });
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Gagal tambah habit.');
        } finally {
            setSaving(false);
        }
    }, [uid]);

    const remove = useCallback(async (id: string) => {
        try { await deleteHabit(id); }
        catch (e) { setError(e instanceof Error ? e.message : 'Gagal hapus habit.'); }
    }, []);

    const toggle = useCallback(async (habitId: string) => {
        if (!uid) return;
        const today = todayStr();
        const existing = todayLogs.find(l => l.habitId === habitId);
        const next = !existing?.completed;
        // Optimistic update
        setTodayLogs(prev => {
            const without = prev.filter(l => l.habitId !== habitId);
            return [...without, {
                id: `${uid}_${habitId}_${today}`,
                uid, habitId, date: today,
                completed: next,
                createdAt: new Date().toISOString(),
            }];
        });
        await toggleHabitLog(uid, habitId, today, next).catch(() => {
            // Revert on error
            setTodayLogs(prev => {
                const without = prev.filter(l => l.habitId !== habitId);
                return existing ? [...without, existing] : without;
            });
        });
    }, [uid, todayLogs]);

    const isCompleted = (habitId: string) =>
        todayLogs.find(l => l.habitId === habitId)?.completed ?? false;

    const todayCount = todayLogs.filter(l => l.completed).length;
    const todayTotal = habits.length;

    return {
        habits,
        todayLogs,
        loading,
        saving,
        error,
        add,
        remove,
        toggle,
        isCompleted,
        todayCount,
        todayTotal,
    };
}
