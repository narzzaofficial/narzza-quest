'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { subscribeToOpenGuildQuests, claimGuildQuest } from '@/lib/db';
import type { GuildQuest } from '@/types';

/** Hero-side Guild Quest logic: open quests from connected GMs + claim. */
export function useGuildQuest() {
    const { profile } = useAuth();
    const [quests, setQuests] = useState<GuildQuest[]>([]);
    const [loading, setLoading] = useState(true);
    const [claimingId, setClaimingId] = useState<string | null>(null);
    const [toast, setToast] = useState({ show: false, msg: '', type: 'success' as 'success' | 'error' | 'info' });

    useEffect(() => {
        if (!profile || profile.role !== 'player') {
            setLoading(false);
            return;
        }
        const unsub = subscribeToOpenGuildQuests(profile.partnerIds || [], (qs) => {
            setQuests(qs);
            setLoading(false);
        });
        return () => unsub();
    }, [profile]);

    const claim = async (gq: GuildQuest) => {
        if (!profile) return;
        setClaimingId(gq.id);
        try {
            const result = await claimGuildQuest(gq.id, profile);
            const msg: Record<typeof result, { msg: string; type: 'success' | 'error' | 'info' }> = {
                claimed: { msg: `Quest "${gq.title}" berhasil diambil! Cek Quest Board-mu.`, type: 'success' },
                already_claimed: { msg: 'Kamu sudah mengambil quest ini sebelumnya!', type: 'info' },
                quota_full: { msg: 'Sayang sekali! Kuota quest ini sudah penuh.', type: 'error' },
                closed: { msg: 'Quest ini sudah ditutup oleh GM.', type: 'error' },
            };
            setToast({ show: true, ...msg[result] });
        } catch (err) {
            console.error(err);
            setToast({ show: true, msg: 'Gagal mengambil quest. Coba lagi.', type: 'error' });
        } finally {
            setClaimingId(null);
        }
    };

    return { profile, quests, loading, claimingId, toast, setToast, claim };
}
