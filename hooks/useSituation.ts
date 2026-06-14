'use client';

import { useCallback, useEffect, useState } from 'react';
import { getSituation, saveSituation } from '@/lib/db';
import type { UserSituation } from '@/types';

const DEFAULT: Omit<UserSituation, 'uid' | 'updatedAt'> = {
    currentStatus: 'normal',
    weekFocus: '',
    workload: 'medium',
    activeProjects: [],
    contextNote: '',
};

export function useSituation(uid: string | undefined) {
    const [situation, setSituation] = useState<UserSituation | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!uid) { setLoading(false); return; }
        getSituation(uid)
            .then(data => setSituation(data ?? { uid, ...DEFAULT, updatedAt: '' }))
            .catch(() => setSituation({ uid, ...DEFAULT, updatedAt: '' }))
            .finally(() => setLoading(false));
    }, [uid]);

    const save = useCallback(async (data: Omit<UserSituation, 'uid' | 'updatedAt'>) => {
        if (!uid) return;
        setSaving(true);
        setError(null);
        try {
            await saveSituation(uid, data);
            setSituation({ uid, ...data, updatedAt: new Date().toISOString() });
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Gagal menyimpan situasi.');
        } finally {
            setSaving(false);
        }
    }, [uid]);

    return { situation, loading, saving, error, save };
}
