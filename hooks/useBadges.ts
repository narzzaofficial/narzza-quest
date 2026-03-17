'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';

export interface BadgeCounts {
    questBoard: number;
    warRoom: number;
    arena: number;
    network: number;
    notifications: number;
    wallet: number;
    roadmap: number;
    guildQuest: number;  // hero: open guild quests not yet claimed
    // GM-only
    manageQuests: number;
    reviewSubmissions: number;
    encourage: number;
}

const DEFAULT_BADGES: BadgeCounts = {
    questBoard: 0,
    warRoom: 0,
    arena: 0,
    network: 0,
    notifications: 0,
    wallet: 0,
    roadmap: 0,
    guildQuest: 0,
    manageQuests: 0,
    reviewSubmissions: 0,
    encourage: 0,
};

export function useBadges(): BadgeCounts {
    const { profile } = useAuth();
    const [badges, setBadges] = useState<BadgeCounts>(DEFAULT_BADGES);

    useEffect(() => {
        if (!profile?.uid) return;

        const unsubscribers: (() => void)[] = [];
        const uid = profile.uid;

        // ── 1. Notifications (unread) ─────────────────────────────────────
        const notifQ = query(
            collection(db, 'notifications'),
            where('toUid', '==', uid),
            where('isRead', '==', false)
        );
        unsubscribers.push(
            onSnapshot(notifQ, (snap) => {
                setBadges(prev => ({ ...prev, notifications: snap.docs.length }));
            })
        );

        // ── 2. Network – pending connection requests ───────────────────────
        const networkQ = query(
            collection(db, 'connections'),
            where('toUid', '==', uid),
            where('status', '==', 'pending')
        );
        unsubscribers.push(
            onSnapshot(networkQ, (snap) => {
                setBadges(prev => ({ ...prev, network: snap.docs.length }));
            })
        );

        // ── PLAYER-only badges ─────────────────────────────────────────────
        if (profile.role === 'player') {
            // Quest Board – quest baru yang belum dimulai (status pending)
            const questBoardQ = query(
                collection(db, 'quests'),
                where('assignedTo', '==', uid),
                where('status', '==', 'pending')
            );
            unsubscribers.push(
                onSnapshot(questBoardQ, (snap) => {
                    setBadges(prev => ({ ...prev, questBoard: snap.docs.length }));
                })
            );

            // War Room – quest yang sudah di-submit, menunggu GM review
            const warRoomQ = query(
                collection(db, 'quests'),
                where('assignedTo', '==', uid),
                where('status', '==', 'submitted')
            );
            unsubscribers.push(
                onSnapshot(warRoomQ, (snap) => {
                    setBadges(prev => ({ ...prev, warRoom: snap.docs.length }));
                })
            );

            // Wallet – GM sudah upload bukti transfer, menunggu konfirmasi player
            const walletQ = query(
                collection(db, 'withdrawals'),
                where('heroUid', '==', uid),
                where('status', '==', 'transfer_submitted')
            );
            unsubscribers.push(
                onSnapshot(walletQ, (snap) => {
                    setBadges(prev => ({ ...prev, wallet: snap.docs.length }));
                })
            );

            // Guild Quest – open guild quests from linked GMs that hero hasn't claimed
            if (profile.partnerIds && profile.partnerIds.length > 0) {
                const gmUids = profile.partnerIds.slice(0, 10); // Firestore 'in' max 10
                const guildQuestQ = query(
                    collection(db, 'guildQuests'),
                    where('createdBy', 'in', gmUids),
                    where('status', '==', 'open')
                );
                unsubscribers.push(
                    onSnapshot(guildQuestQ, (snap) => {
                        // Count only those NOT yet claimed by this hero
                        const notClaimed = snap.docs.filter(d => {
                            const claimedBy: string[] = d.data().claimedBy || [];
                            return !claimedBy.includes(uid);
                        }).length;
                        setBadges(prev => ({ ...prev, guildQuest: notClaimed }));
                    })
                );
            }
        }

        // ── GM-only badges ─────────────────────────────────────────────────
        if (profile.role === 'gm') {
            // Review Submissions – quest yang sudah di-submit oleh hero
            const reviewQ = query(
                collection(db, 'quests'),
                where('createdBy', '==', uid),
                where('status', '==', 'submitted')
            );
            unsubscribers.push(
                onSnapshot(reviewQ, (snap) => {
                    setBadges(prev => ({ ...prev, reviewSubmissions: snap.docs.length }));
                })
            );

            // Manage Quests – quests flagged needsReview
            const gmQuestQ = query(
                collection(db, 'quests'),
                where('createdBy', '==', uid),
                where('needsReview', '==', true)
            );
            unsubscribers.push(
                onSnapshot(gmQuestQ, (snap) => {
                    setBadges(prev => ({ ...prev, manageQuests: snap.docs.length }));
                })
            );

            // Encourage – heroes that need encouragement
            const encourageQ = query(
                collection(db, 'users'),
                where('role', '==', 'player'),
                where('needsEncouragement', '==', true)
            );
            unsubscribers.push(
                onSnapshot(encourageQ, (snap) => {
                    setBadges(prev => ({ ...prev, encourage: snap.docs.length }));
                })
            );

            // Roadmap – quest aktif (pending/in_progress) di kalender GM yang deadlinenya
            // sudah lewat atau hari ini (overdue/urgent)
            const today = new Date();
            today.setHours(23, 59, 59, 999);
            const roadmapQ = query(
                collection(db, 'quests'),
                where('createdBy', '==', uid),
                where('status', 'in', ['pending', 'in_progress'])
            );
            unsubscribers.push(
                onSnapshot(roadmapQ, (snap) => {
                    // Hitung yang deadline-nya sudah lewat
                    const overdueCount = snap.docs.filter(d => {
                        const deadline = d.data().deadline;
                        if (!deadline) return false;
                        return new Date(deadline) <= today;
                    }).length;
                    setBadges(prev => ({ ...prev, roadmap: overdueCount }));
                })
            );

            // Payouts/Wallet GM – withdrawal request pending dari hero
            const payoutQ = query(
                collection(db, 'withdrawals'),
                where('gmUid', '==', uid),
                where('status', '==', 'pending')
            );
            unsubscribers.push(
                onSnapshot(payoutQ, (snap) => {
                    // Reuse questBoard key for GM's payout alerts
                    setBadges(prev => ({ ...prev, questBoard: snap.docs.length }));
                })
            );
        }

        return () => {
            unsubscribers.forEach(unsub => unsub());
        };
    }, [profile]);

    return badges;
}
