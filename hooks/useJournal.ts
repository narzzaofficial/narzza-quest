'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getPlayerQuests, getLinkedProfiles } from '@/lib/db';
import { subscribeToPersonalJournals } from '@/lib/journalDb';
import type { Quest, UserProfile, PersonalJournal, TimelineItem } from '@/types';

/** Journal logic: approved quests for the current player (or selected hero, for GM). */
export function useJournal() {
    const { profile, loading } = useAuth();

    const [linkedHeroes, setLinkedHeroes] = useState<UserProfile[]>([]);
    const [selectedHeroId, setSelectedHeroId] = useState('');
    const [completedQuests, setCompletedQuests] = useState<Quest[]>([]);
    const [personalJournals, setPersonalJournals] = useState<PersonalJournal[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    useEffect(() => {
        if (!profile) return;
        if (profile.role === 'gm' && profile.partnerIds && profile.partnerIds.length > 0) {
            getLinkedProfiles(profile.partnerIds).then((heroes) => {
                const players = heroes.filter((h) => h.role === 'player');
                setLinkedHeroes(players);
                if (players.length > 0) setSelectedHeroId(players[0].uid);
                else setIsLoadingData(false);
            });
        } else if (profile.role === 'player') {
            setSelectedHeroId(profile.uid);
        } else {
            setIsLoadingData(false);
        }
    }, [profile]);

    useEffect(() => {
        if (!selectedHeroId) return;
        setIsLoadingData(true);
        
        // Fetch quests
        getPlayerQuests(selectedHeroId)
            .then((quests) => {
                const approved = quests
                    .filter((q) => q.status === 'approved')
                    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
                setCompletedQuests(approved);
                setIsLoadingData(false);
            })
            .catch((err) => {
                console.error('Gagal mengambil jurnal quest:', err);
                setIsLoadingData(false);
            });

        // Subscribe to personal journals
        const unsub = subscribeToPersonalJournals(selectedHeroId, (journals) => {
            setPersonalJournals(journals);
        });

        return () => unsub();
    }, [selectedHeroId]);

    // Build timeline
    const timeline: TimelineItem[] = [
        ...completedQuests.map(q => ({ type: 'quest' as const, data: q, sortDate: new Date(q.updatedAt).getTime() })),
        ...personalJournals
            .filter(j => profile?.role === 'gm' ? j.visibility === 'gm' : true)
            .map(j => ({ type: 'personal' as const, data: j, sortDate: new Date(j.createdAt).getTime() }))
    ].sort((a, b) => b.sortDate - a.sortDate);

    const totalExpEarned = completedQuests.reduce((sum, q) => sum + q.expReward + (q.bonusExp || 0), 0);

    return {
        profile,
        loading,
        linkedHeroes,
        selectedHeroId,
        setSelectedHeroId,
        timeline,
        completedQuests,
        isLoadingData,
        totalExpEarned,
    };
}
