'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
    getLinkedProfiles,
    createWithdrawalRequest,
    subscribeToHeroWithdrawals,
    resolveWithdrawal,
} from '@/lib/db';
import type { UserProfile, Withdrawal } from '@/types';

type ToastState = { show: boolean; msg: string; type: 'success' | 'info' | 'error' };

/** Wallet logic: balances per GM, withdrawal requests, and hero confirmation flow. */
export function useWallet() {
    const { profile } = useAuth();
    const [gmProfiles, setGmProfiles] = useState<Record<string, UserProfile>>({});
    const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [toast, setToast] = useState<ToastState>({ show: false, msg: '', type: 'success' });
    const [rejectingId, setRejectingId] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [localBalances, setLocalBalances] = useState<Record<string, number>>({});

    useEffect(() => {
        if (!profile) return;

        if (profile.balances) {
            setLocalBalances(profile.balances);
            const gmUids = Object.keys(profile.balances);
            if (gmUids.length > 0) {
                getLinkedProfiles(gmUids).then((profiles) => {
                    const map: Record<string, UserProfile> = {};
                    profiles.forEach((p) => { map[p.uid] = p; });
                    setGmProfiles(map);
                });
            }
        }

        const unsubscribe = subscribeToHeroWithdrawals(profile.uid, (data) => {
            setWithdrawals(data as Withdrawal[]);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [profile]);

    const totalBalance = Object.values(localBalances).reduce((acc, curr) => acc + (curr || 0), 0);

    const handleWithdraw = async (gmUid: string, amount: number) => {
        if (!profile || amount <= 0) return;
        const gmName = gmProfiles[gmUid]?.displayName || 'Game Master';
        const ok = window.confirm(
            `Kirim tagihan pencairan sebesar Rp ${amount.toLocaleString('id-ID')} ke ${gmName}?\n\nPastikan kamu sudah memberikan nomor rekening/e-wallet-mu ke GM.`
        );
        if (!ok) return;

        setProcessingId(gmUid);
        try {
            await createWithdrawalRequest(profile, gmUid, amount);
            setLocalBalances((prev) => ({ ...prev, [gmUid]: 0 }));
            setToast({ show: true, msg: `Tagihan berhasil dikirim ke ${gmName}!`, type: 'success' });
        } catch (err) {
            console.error(err);
            setToast({ show: true, msg: 'Gagal memproses penarikan.', type: 'error' });
        } finally {
            setProcessingId(null);
        }
    };

    const handleResolve = async (id: string, action: 'approve' | 'reject') => {
        if (action === 'reject' && !rejectReason.trim()) {
            alert('Tuliskan alasan penolakan terlebih dahulu!');
            return;
        }
        setProcessingId(id);
        try {
            const wd = withdrawals.find((w) => w.id === id);
            await resolveWithdrawal(
                id,
                action,
                rejectReason,
                wd && profile ? { heroUid: profile.uid, heroName: profile.displayName, gmUid: wd.gmUid, amount: wd.amount } : undefined
            );
            setToast({
                show: true,
                msg: action === 'approve' ? 'Dana berhasil dikonfirmasi!' : 'Bukti transfer ditolak.',
                type: 'success',
            });
            setRejectingId(null);
            setRejectReason('');
        } catch (error) {
            console.error(error);
            setToast({ show: true, msg: 'Terjadi kesalahan sistem.', type: 'error' });
        } finally {
            setProcessingId(null);
        }
    };

    return {
        profile,
        gmProfiles,
        withdrawals,
        loading,
        processingId,
        toast,
        setToast,
        rejectingId,
        setRejectingId,
        rejectReason,
        setRejectReason,
        localBalances,
        totalBalance,
        handleWithdraw,
        handleResolve,
    };
}
