'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLinkedHeroes } from '@/hooks/useLinkedHeroes';
import { sendNotification } from '@/lib/db';
import { BUFF_OPTIONS } from '@/constants/gm';

/** GM "Kirim Semangat" form: hero selection, buff type, message, and send. */
export function useEncourageHero() {
    const { profile } = useAuth();
    const linked = useLinkedHeroes(profile);
    const [message, setMessage] = useState('');
    const [buffType, setBuffType] = useState(BUFF_OPTIONS[0].name);
    const [isSending, setIsSending] = useState(false);
    const [showToast, setShowToast] = useState(false);

    const send = async () => {
        if (!profile || !linked.selectedHeroId || !message.trim()) {
            if (!linked.selectedHeroId) alert('Pilih Hero terlebih dahulu!');
            return;
        }
        setIsSending(true);
        try {
            await sendNotification({
                toUid: linked.selectedHeroId,
                fromUid: profile.uid,
                fromName: profile.displayName,
                type: 'encouragement',
                title: `Mantra Semangat: ${buffType}`,
                message,
            });
            setShowToast(true);
            setMessage('');
        } catch (error) {
            console.error('Gagal mengirim semangat:', error);
            alert('Gagal mengirim pesan. Coba lagi.');
        } finally {
            setIsSending(false);
        }
    };

    return {
        linkedHeroes: linked.heroes,
        loadingHeroes: linked.loading,
        selectedHeroId: linked.selectedHeroId,
        setSelectedHeroId: linked.setSelectedHeroId,
        message,
        setMessage,
        buffType,
        setBuffType,
        isSending,
        showToast,
        setShowToast,
        send,
    };
}
