'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useOfflineQueueStatus } from '@/hooks/useOfflineQueueStatus';
import { getLinkedProfiles, getJournals } from '@/lib/db';
import type { UserProfile, JournalEntry } from '@/types';

export interface ActivityPoint {
    /** Short weekday label, e.g. "Sen" */
    day: string;
    /** ISO date key (YYYY-MM-DD) */
    date: string;
    exp: number;
    hours: number;
}

/**
 * All dashboard logic lives here (per project convention: app/ = UI only).
 * Handles auth redirect, GM partner loading, hero journal loading, and
 * derived/aggregated values for the UI.
 */
export function useDashboard() {
    const { user, profile, loading } = useAuth();
    const { pendingCount } = useOfflineQueueStatus();
    const router = useRouter();

    const [linkedPartners, setLinkedPartners] = useState<UserProfile[]>([]);
    const [journals, setJournals] = useState<JournalEntry[]>([]);

    // Redirect unauthenticated users
    useEffect(() => {
        if (!loading && !user) router.push('/login');
    }, [user, loading, router]);

    // Role-specific data loading
    useEffect(() => {
        if (!profile) return;

        if (profile.role === 'gm' && profile.partnerIds && profile.partnerIds.length > 0) {
            getLinkedProfiles(profile.partnerIds)
                .then((partners) => setLinkedPartners(partners.filter((p) => p.role === 'player')))
                .catch(() => setLinkedPartners([]));
        }

        if (profile.role === 'player') {
            getJournals(profile.uid)
                .then(setJournals)
                .catch(() => setJournals([]));
        }
    }, [profile]);

    // Aggregate journal entries into the last 7 days (real activity data)
    const activity7d = useMemo<ActivityPoint[]>(() => {
        const fmt = new Intl.DateTimeFormat('id-ID', { weekday: 'short' });
        const days: ActivityPoint[] = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setHours(0, 0, 0, 0);
            d.setDate(d.getDate() - i);
            days.push({ day: fmt.format(d), date: d.toISOString().split('T')[0], exp: 0, hours: 0 });
        }
        const idx = new Map(days.map((p, i) => [p.date, i]));
        for (const j of journals) {
            const key = (j.createdAt || '').split('T')[0];
            const i = idx.get(key);
            if (i === undefined) continue;
            days[i].exp += j.expEarned || 0;
            days[i].hours += (j.timeWorkedSeconds || 0) / 3600;
        }
        return days.map((p) => ({ ...p, hours: Number(p.hours.toFixed(1)) }));
    }, [journals]);

    const expPercent = profile
        ? Math.min(100, Math.round(((profile.exp || 0) / (profile.expToNextLevel || 100)) * 100))
        : 0;
    const expRemaining = profile ? Math.max(0, (profile.expToNextLevel || 100) - (profile.exp || 0)) : 0;
    const streak = profile?.streak || 0;
    const streakColor =
        streak >= 7 ? 'var(--color-danger)' : streak >= 3 ? 'var(--color-xp)' : 'var(--color-ink-muted)';
    const hasPartner = !!(profile?.partnerIds && profile.partnerIds.length > 0);

    return {
        user,
        profile,
        loading,
        pendingCount,
        // GM
        linkedPartners,
        hasPartner,
        // Hero
        activity7d,
        expPercent,
        expRemaining,
        streak,
        streakColor,
    };
}
