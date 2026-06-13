'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { sendPartnerRequest, acceptPartnerRequest, rejectPartnerRequest, getLinkedProfiles } from '@/lib/db';
import type { UserProfile } from '@/types';

/** Network logic: invite by email, accept/reject incoming request, list members. */
export function useNetwork() {
    const { profile, loading, refreshProfile } = useAuth();
    const [partnerEmail, setPartnerEmail] = useState('');
    const [linkedPartners, setLinkedPartners] = useState<UserProfile[]>([]);
    const [isLinking, setIsLinking] = useState(false);
    const [loadingPartners, setLoadingPartners] = useState(true);
    const [toast, setToast] = useState({ show: false, message: '' });

    useEffect(() => {
        if (profile?.partnerIds && profile.partnerIds.length > 0) {
            getLinkedProfiles(profile.partnerIds).then((partners) => {
                setLinkedPartners(partners);
                setLoadingPartners(false);
            });
        } else {
            setLoadingPartners(false);
        }
    }, [profile]);

    const notify = (message: string) => setToast({ show: true, message });

    const sendRequest = async () => {
        if (!profile || !partnerEmail.trim()) return;
        if (partnerEmail === profile.email) {
            alert('Tidak bisa mengirim request ke diri sendiri!');
            return;
        }
        setIsLinking(true);
        try {
            const successId = await sendPartnerRequest(profile.uid, partnerEmail);
            if (successId) {
                notify('Undangan berhasil dikirim! Menunggu konfirmasi.');
                setPartnerEmail('');
            } else {
                alert('Email tidak ditemukan di sistem. Pastikan dia sudah mendaftar.');
            }
        } catch (error) {
            console.error('Gagal mengirim request:', error);
            alert('Terjadi kesalahan. Coba lagi nanti.');
        } finally {
            setIsLinking(false);
        }
    };

    const accept = async () => {
        if (!profile?.pendingPartnerRequest) return;
        setIsLinking(true);
        try {
            await acceptPartnerRequest(profile.uid, profile.pendingPartnerRequest.uid);
            notify('🎉 Berhasil terhubung dengan anggota baru!');
            await refreshProfile();
        } catch (error) {
            console.error('Gagal menerima:', error);
        } finally {
            setIsLinking(false);
        }
    };

    const reject = async () => {
        if (!profile?.pendingPartnerRequest) return;
        setIsLinking(true);
        try {
            await rejectPartnerRequest(profile.uid);
            await refreshProfile();
        } catch (error) {
            console.error('Gagal menolak:', error);
        } finally {
            setIsLinking(false);
        }
    };

    return {
        profile,
        loading,
        partnerEmail,
        setPartnerEmail,
        linkedPartners,
        loadingPartners,
        isLinking,
        toast,
        setToast,
        sendRequest,
        accept,
        reject,
    };
}
