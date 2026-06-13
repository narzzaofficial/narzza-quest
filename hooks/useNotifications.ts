'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot, limit, doc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { markNotificationRead } from '@/lib/db';
import type { Notification } from '@/types';

/** Notifications logic: realtime list + mark read / mark all read. */
export function useNotifications() {
    const { profile } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!profile) {
            setLoading(false);
            return;
        }
        const q = query(
            collection(db, 'notifications'),
            where('toUid', '==', profile.uid),
            orderBy('createdAt', 'desc'),
            limit(30)
        );
        const unsubscribe = onSnapshot(q, (snap) => {
            setNotifications(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Notification)));
            setLoading(false);
        });
        return () => unsubscribe();
    }, [profile]);

    const markRead = async (id: string, isRead: boolean) => {
        if (isRead) return;
        try {
            await markNotificationRead(id);
        } catch (error) {
            console.error('Gagal menandai dibaca:', error);
        }
    };

    const markAllRead = async () => {
        const unread = notifications.filter((n) => !n.isRead);
        if (unread.length === 0) return;
        try {
            const batch = writeBatch(db);
            unread.forEach((notif) => batch.update(doc(db, 'notifications', notif.id), { isRead: true }));
            await batch.commit();
        } catch (error) {
            console.error('Gagal menandai semua dibaca:', error);
        }
    };

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return { notifications, loading, unreadCount, markRead, markAllRead };
}
