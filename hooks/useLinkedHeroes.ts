'use client';

import { useEffect, useState } from 'react';
import { getLinkedProfiles } from '@/lib/db';
import type { UserProfile } from '@/types';

/** Heroes linked to a GM's account, with a selectable "current hero" — shared by Encourage and Hero Profile pages. */
export function useLinkedHeroes(profile: UserProfile | null | undefined) {
    const [heroes, setHeroes] = useState<UserProfile[]>([]);
    const [selectedHeroId, setSelectedHeroId] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!profile?.partnerIds || profile.partnerIds.length === 0) {
            setLoading(false);
            return;
        }
        getLinkedProfiles(profile.partnerIds)
            .then((data) => {
                const players = data.filter((p) => p.role === 'player');
                setHeroes(players);
                if (players.length > 0) setSelectedHeroId(players[0].uid);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [profile]);

    const selectedHero = heroes.find((h) => h.uid === selectedHeroId);

    return { heroes, selectedHeroId, setSelectedHeroId, selectedHero, loading };
}
