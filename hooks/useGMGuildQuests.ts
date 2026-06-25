'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { subscribeToGMGuildQuests } from '@/lib/db';
import type { GuildQuest } from '@/types';

/** GM Guild Quest board: realtime list of open quests this GM has published. */
export function useGMGuildQuests() {
    const { profile } = useAuth();
    const [quests, setQuests] = useState<GuildQuest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!profile || profile.role !== 'gm') return;
        const unsub = subscribeToGMGuildQuests(profile.uid, (qs) => {
            setQuests(qs);
            setLoading(false);
        });
        return () => unsub();
    }, [profile]);

    return { quests, loading };
}
