'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { subscribeToQuests, subscribeToGMCreatedQuests, getLinkedProfiles } from '@/lib/db';
import type { Quest } from '@/types';

/** Calendar data: quests (player-assigned or GM-created) grouped by deadline date. */
export function useCalendar() {
    const { profile, loading } = useAuth();
    const [quests, setQuests] = useState<Quest[]>([]);
    const [isLoadingQuests, setIsLoadingQuests] = useState(true);
    const [heroMap, setHeroMap] = useState<Record<string, string>>({});

    useEffect(() => {
        if (profile?.role === 'gm' && profile.partnerIds && profile.partnerIds.length > 0) {
            getLinkedProfiles(profile.partnerIds).then((heroes) => {
                const map: Record<string, string> = {};
                heroes.forEach((h) => { map[h.uid] = h.displayName; });
                setHeroMap(map);
            });
        }
    }, [profile]);

    useEffect(() => {
        if (!profile) {
            setIsLoadingQuests(false);
            return;
        }
        let unsubscribe: () => void;
        if (profile.role === 'gm') {
            unsubscribe = subscribeToGMCreatedQuests(profile.uid, (q) => { setQuests(q); setIsLoadingQuests(false); });
        } else {
            unsubscribe = subscribeToQuests(profile.uid, (q) => { setQuests(q); setIsLoadingQuests(false); });
        }
        return () => unsubscribe();
    }, [profile]);

    const groupedQuests = useMemo(() => {
        return quests.reduce((acc, quest) => {
            const d = new Date(quest.deadline);
            const localKey = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
            if (!acc[localKey]) acc[localKey] = [];
            acc[localKey].push(quest);
            return acc;
        }, {} as Record<string, Quest[]>);
    }, [quests]);

    return { profile, loading, isLoadingQuests, heroMap, groupedQuests };
}
