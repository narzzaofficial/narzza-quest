'use client';

import { useEffect, useState, useCallback } from 'react';
import { subscribeToGMMessages, markGMMessageRead, markAllGMMessagesRead } from '@/lib/db';
import type { GMMessage } from '@/types';

export function useGMMessages(uid: string | undefined) {
    const [messages, setMessages] = useState<GMMessage[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!uid) { setLoading(false); return; }

        const unsub = subscribeToGMMessages(uid, (msgs) => {
            setMessages(msgs);
            setLoading(false);
        });

        return () => unsub();
    }, [uid]);

    const unread = messages.filter((m) => !m.isRead);
    const unreadCount = unread.length;
    const latestHighPriority = unread.find((m) => m.priority === 'high') ?? null;

    const markRead = useCallback(
        (messageId: string) => {
            if (!uid) return;
            markGMMessageRead(uid, messageId);
        },
        [uid]
    );

    const markAllRead = useCallback(() => {
        if (!uid) return;
        markAllGMMessagesRead(uid);
    }, [uid]);

    return { messages, unreadCount, latestHighPriority, loading, markRead, markAllRead };
}
