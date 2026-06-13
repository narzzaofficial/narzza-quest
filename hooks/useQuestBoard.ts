'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { subscribeToQuests, getLinkedProfiles, processExpiredQuestsForPlayer } from '@/lib/db';
import { getOfflineItems } from '@/lib/offlineQueue';
import type { Quest } from '@/types';

export const QUEST_FILTERS = ['All', 'Available', 'Active', 'Completed'] as const;
export type QuestFilter = (typeof QUEST_FILTERS)[number];

/** All Quest Board logic: realtime quests, GM names, deadline sweep, offline queue, filtering. */
export function useQuestBoard() {
    const { profile, refreshProfile } = useAuth();
    const [quests, setQuests] = useState<Quest[]>([]);
    const [activeFilter, setActiveFilter] = useState<QuestFilter>('All');
    const [loading, setLoading] = useState(true);
    const [gmMap, setGmMap] = useState<Record<string, string>>({});
    const [queuedSubmitQuestIds, setQueuedSubmitQuestIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (profile && profile.role === 'player') {
            const unsubscribe = subscribeToQuests(profile.uid, (fetched) => {
                setQuests(fetched);
                setLoading(false);

                const gmUids = [...new Set(fetched.map((q) => q.createdBy).filter(Boolean))];
                if (gmUids.length > 0) {
                    getLinkedProfiles(gmUids).then((gms) => {
                        const map: Record<string, string> = {};
                        gms.forEach((gm) => { map[gm.uid] = gm.displayName; });
                        setGmMap(map);
                    });
                }
            });
            return () => unsubscribe();
        }
    }, [profile]);

    useEffect(() => {
        const sweep = async () => {
            if (!profile || profile.role !== 'player') return;
            const result = await processExpiredQuestsForPlayer(profile);
            if (result.missedCount > 0) await refreshProfile();
        };
        void sweep();
    }, [profile, refreshProfile]);

    useEffect(() => {
        const sync = async () => {
            const items = await getOfflineItems();
            setQueuedSubmitQuestIds(
                new Set(items.filter((i) => i.type === 'submit_quest').map((i) => i.questId))
            );
        };
        const onUpdate = () => { void sync(); };
        void sync();
        window.addEventListener('offline-queue-updated', onUpdate as EventListener);
        window.addEventListener('online', onUpdate);
        return () => {
            window.removeEventListener('offline-queue-updated', onUpdate as EventListener);
            window.removeEventListener('online', onUpdate);
        };
    }, []);

    const filtered = useMemo(
        () =>
            quests.filter((q) => {
                const queued = queuedSubmitQuestIds.has(q.id);
                if (activeFilter === 'All') return true;
                if (activeFilter === 'Available')
                    return q.status === 'pending' && !queued && new Date(q.deadline).getTime() > Date.now();
                if (activeFilter === 'Active') return q.status === 'in_progress' && !queued;
                if (activeFilter === 'Completed')
                    return ['submitted', 'approved', 'missed'].includes(q.status) || queued;
                return true;
            }),
        [quests, activeFilter, queuedSubmitQuestIds]
    );

    return {
        profile,
        quests: filtered,
        loading,
        activeFilter,
        setActiveFilter,
        gmMap,
        queuedSubmitQuestIds,
        hearts: profile?.hearts ?? 5,
    };
}
