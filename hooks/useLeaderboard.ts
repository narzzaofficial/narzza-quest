'use client';

import { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { getCumulativeExp } from '@/lib/leveling';
import type { UserProfile } from '@/types';

export function useLeaderboard() {
    const { profile, loading: authLoading } = useAuth();
    const [leaders, setLeaders] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                // Fetch by level desc so Firestore single-field index works.
                // Within same level, getCumulativeExp sorts correctly by in-level exp.
                const q = query(collection(db, 'users'), orderBy('level', 'desc'), limit(100));
                const snap = await getDocs(q);
                const users = snap.docs.map((d) => d.data() as UserProfile);

                // Re-sort client-side by true cumulative EXP (level thresholds + in-level exp)
                users.sort((a, b) => getCumulativeExp(b) - getCumulativeExp(a));

                setLeaders(users.slice(0, 50));
            } catch (error) {
                console.error('Gagal menarik data leaderboard:', error);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    return { profile, loading: authLoading || loading, leaders };
}
