'use client';

import { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import type { UserProfile } from '@/types';

/** Top 50 users by EXP. */
export function useLeaderboard() {
    const { profile, loading: authLoading } = useAuth();
    const [leaders, setLeaders] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const q = query(collection(db, 'users'), orderBy('exp', 'desc'), limit(50));
                const snap = await getDocs(q);
                setLeaders(snap.docs.map((d) => d.data() as UserProfile));
            } catch (error) {
                console.error('Gagal menarik data leaderboard:', error);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    return { profile, loading: authLoading || loading, leaders };
}
