'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { subscribeToSubmissions, approveQuest, rejectQuest, getUserProfile, getLinkedProfiles } from '@/lib/db';
import type { Quest } from '@/types';

/** GM review logic: pending submissions + approve/reject with note. */
export function useGMReview() {
    const { profile } = useAuth();
    const [submissions, setSubmissions] = useState<Quest[]>([]);
    const [loading, setLoading] = useState(true);
    const [heroMap, setHeroMap] = useState<Record<string, string>>({});
    const [reviewingId, setReviewingId] = useState<string | null>(null);
    const [reviewNote, setReviewNote] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '' });

    useEffect(() => {
        if (profile && profile.role === 'gm') {
            if (profile.partnerIds && profile.partnerIds.length > 0) {
                getLinkedProfiles(profile.partnerIds).then((heroes) => {
                    const map: Record<string, string> = {};
                    heroes.forEach((h) => { map[h.uid] = h.displayName; });
                    setHeroMap(map);
                });
            }
            const unsubscribe = subscribeToSubmissions(profile.uid, (subs) => {
                setSubmissions(subs);
                setLoading(false);
            });
            return () => unsubscribe();
        } else {
            setLoading(false);
        }
    }, [profile]);

    const approve = async (quest: Quest) => {
        setIsProcessing(true);
        try {
            const heroProfile = await getUserProfile(quest.assignedTo);
            if (!heroProfile) throw new Error('Profil Hero tidak ditemukan');
            const result = await approveQuest(quest.id, quest, heroProfile, reviewNote || 'Kerja bagus! Terus pertahankan fokusmu.', 0);
            const bounty = quest.moneyReward ? ` & Rp ${quest.moneyReward.toLocaleString('id-ID')}` : '';
            setToast({ show: true, message: `Sukses! ${heroMap[quest.assignedTo] || 'Hero'} dapat +${result.expEarned} EXP${bounty}.` });
            setReviewingId(null);
            setReviewNote('');
        } catch (error) {
            console.error('Gagal approve:', error);
            alert('Terjadi kesalahan saat menyetujui quest.');
        } finally {
            setIsProcessing(false);
        }
    };

    const reject = async (quest: Quest) => {
        if (!reviewNote.trim()) {
            alert('Tuliskan alasan penolakan agar Hero bisa memperbaikinya!');
            return;
        }
        setIsProcessing(true);
        try {
            await rejectQuest(quest.id, reviewNote, profile ? { toUid: quest.assignedTo, fromUid: profile.uid, fromName: profile.displayName, questTitle: quest.title } : undefined);
            setToast({ show: true, message: 'Quest dikembalikan ke Hero untuk direvisi.' });
            setReviewingId(null);
            setReviewNote('');
        } catch (error) {
            console.error('Gagal reject:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    return { profile, submissions, loading, heroMap, reviewingId, setReviewingId, reviewNote, setReviewNote, isProcessing, toast, setToast, approve, reject };
}
