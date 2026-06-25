'use client';

import { useState } from 'react';
import { auth } from '@/lib/firebase';

/** Telegram bot linking: generate/redeem code + deep link. */
export function useTelegramConnector() {
    const [isActivating, setIsActivating] = useState(false);
    const [isDisconnecting, setIsDisconnecting] = useState(false);
    const [code, setCode] = useState('');

    async function activate(): Promise<void> {
        setIsActivating(true);
        setCode('');
        try {
            const token = await auth.currentUser?.getIdToken();
            const res = await fetch('/api/telegram/activate', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || 'Gagal generate kode.');
            setCode(data.code);
        } finally {
            setIsActivating(false);
        }
    }

    async function disconnect(): Promise<void> {
        setIsDisconnecting(true);
        try {
            const token = await auth.currentUser?.getIdToken();
            const res = await fetch('/api/telegram/disconnect', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || 'Gagal memutuskan Telegram.');
            setCode('');
        } finally {
            setIsDisconnecting(false);
        }
    }

    const deepLink = code ? `https://t.me/${process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME}?start=${code}` : '';

    return { isActivating, isDisconnecting, code, deepLink, activate, disconnect };
}
