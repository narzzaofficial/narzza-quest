'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { subscribeToGMWithdrawals, submitWithdrawalProof } from '@/lib/db';
import type { Withdrawal } from '@/types';

/** GM payouts logic: hero withdrawal bills + upload transfer proof. */
export function useGMPayouts() {
    const { profile } = useAuth();
    const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploadingId, setUploadingId] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [toast, setToast] = useState({ show: false, msg: '', type: 'success' as 'success' | 'info' | 'error' });

    useEffect(() => {
        if (!profile || profile.role !== 'gm') {
            setLoading(false);
            return;
        }
        const unsubscribe = subscribeToGMWithdrawals(profile.uid, (data) => {
            setWithdrawals(data as Withdrawal[]);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [profile]);

    const submitProof = async (id: string) => {
        if (!selectedFile) {
            alert('Harap pilih gambar bukti transfer!');
            return;
        }
        setIsProcessing(true);
        try {
            setUploadProgress('Mengunggah bukti transfer…');
            const formData = new FormData();
            formData.append('file', selectedFile);
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            if (!res.ok) throw new Error(`Gagal upload file ${selectedFile.name}`);
            const data = await res.json();

            setUploadProgress('Menyimpan data transaksi…');
            const wd = withdrawals.find((w) => w.id === id);
            await submitWithdrawalProof(id, data.url, wd && profile ? { heroUid: wd.heroUid, gmUid: profile.uid, gmName: profile.displayName, amount: wd.amount } : undefined);

            setToast({ show: true, msg: 'Bukti transfer berhasil dikirim ke Hero!', type: 'success' });
            setUploadingId(null);
            setSelectedFile(null);
        } catch (error) {
            console.error(error);
            setToast({ show: true, msg: 'Gagal mengirim bukti transfer.', type: 'error' });
        } finally {
            setIsProcessing(false);
            setUploadProgress('');
        }
    };

    const pendingTotal = withdrawals.filter((w) => w.status === 'pending').reduce((acc, curr) => acc + curr.amount, 0);

    return { profile, withdrawals, loading, uploadingId, setUploadingId, selectedFile, setSelectedFile, uploadProgress, isProcessing, toast, setToast, submitProof, pendingTotal };
}
