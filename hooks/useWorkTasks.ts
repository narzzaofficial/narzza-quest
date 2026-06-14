'use client';

import { useCallback, useEffect, useState } from 'react';
import { createWorkTask, updateWorkTask, deleteWorkTask, subscribeToWorkTasks } from '@/lib/db';
import type { WorkTask, WorkTaskStatus } from '@/types';

export function useWorkTasks(uid: string | undefined) {
    const [tasks, setTasks] = useState<WorkTask[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!uid) { setLoading(false); return; }
        const unsub = subscribeToWorkTasks(uid, (data) => {
            setTasks(data);
            setLoading(false);
        });
        return () => unsub();
    }, [uid]);

    const add = useCallback(async (data: Omit<WorkTask, 'id' | 'uid' | 'createdAt' | 'updatedAt'>) => {
        if (!uid) return;
        setSaving(true);
        setError(null);
        try {
            await createWorkTask(uid, data);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Gagal menyimpan task.');
        } finally {
            setSaving(false);
        }
    }, [uid]);

    const update = useCallback(async (id: string, data: Partial<WorkTask>) => {
        try {
            await updateWorkTask(id, data);
            if (data.status === 'done') {
                await updateWorkTask(id, { completedAt: new Date().toISOString() });
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Gagal update task.');
        }
    }, []);

    const setStatus = useCallback((id: string, status: WorkTaskStatus) => update(id, { status }), [update]);

    const remove = useCallback(async (id: string) => {
        try {
            await deleteWorkTask(id);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Gagal hapus task.');
        }
    }, []);

    const byStatus = (status: WorkTaskStatus) => tasks.filter(t => t.status === status);

    return {
        tasks,
        loading,
        saving,
        error,
        add,
        update,
        setStatus,
        remove,
        todo: byStatus('todo'),
        inProgress: byStatus('in_progress'),
        done: byStatus('done'),
        blocked: byStatus('blocked'),
    };
}
