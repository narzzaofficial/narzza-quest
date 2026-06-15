'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useOfflineQueueStatus } from '@/hooks/useOfflineQueueStatus';
import { getLinkedProfiles, getJournals, getMissedQuestsInRange } from '@/lib/db';
import { localDateStr, todayLocal, daysAgoLocal } from '@/lib/dateUtils';
import type { UserProfile, JournalEntry } from '@/types';

export interface ActivityPoint {
    day: string;     // Short weekday label, e.g. "Sen"
    date: string;    // YYYY-MM-DD
    exp: number;     // XP earned (positive)
    penalty: number; // XP lost from missed quests (stored as positive, rendered as negative)
    net: number;     // exp - penalty
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
    const [penalties, setPenalties] = useState<Array<{ date: string; penalty: number }>>([]);

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
            const from7d = daysAgoLocal(6);
            const today  = todayLocal();
            Promise.all([
                getJournals(profile.uid),
                getMissedQuestsInRange(profile.uid, from7d, today),
            ]).then(([jnls, missed]) => {
                setJournals(jnls);
                setPenalties(missed);
            }).catch(() => setJournals([]));
        }
    }, [profile]);

    // Aggregate journal entries + missed-quest penalties into the last 7 days (local time)
    const activity7d = useMemo<ActivityPoint[]>(() => {
        const fmt = new Intl.DateTimeFormat('id-ID', { weekday: 'short' });
        const days: ActivityPoint[] = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            days.push({ day: fmt.format(d), date: localDateStr(d), exp: 0, penalty: 0, net: 0, hours: 0 });
        }
        const idx = new Map(days.map((p, i) => [p.date, i]));
        for (const j of journals) {
            const i = idx.get(localDateStr(j.createdAt || ''));
            if (i === undefined) continue;
            days[i].exp   += j.expEarned || 0;
            days[i].hours += (j.timeWorkedSeconds || 0) / 3600;
        }
        for (const p of penalties) {
            const i = idx.get(p.date);
            if (i === undefined) continue;
            days[i].penalty += p.penalty;
        }
        return days.map((p) => ({ ...p, net: p.exp - p.penalty, hours: Number(p.hours.toFixed(1)) }));
    }, [journals, penalties]);

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
