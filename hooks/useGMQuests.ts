'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import type { Quest } from '@/types';

/** GM quest management: realtime list of quests created by this GM + delete. */
export function useGMQuests() {
    const { profile } = useAuth();
    const [quests, setQuests] = useState<Quest[]>([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState({ show: false, message: '' });

    useEffect(() => {
        if (profile && profile.role === 'gm') {
            const q = query(collection(db, 'quests'), where('createdBy', '==', profile.uid), orderBy('createdAt', 'desc'));
            const unsubscribe = onSnapshot(q, (snap) => {
                setQuests(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Quest)));
                setLoading(false);
            });
            return () => unsubscribe();
        } else {
            setLoading(false);
        }
    }, [profile]);

    const remove = async (questId: string) => {
        if (!window.confirm('Yakin ingin menghapus quest ini secara permanen?')) return;
        try {
            await deleteDoc(doc(db, 'quests', questId));
            setToast({ show: true, message: 'Quest berhasil dihapus dari sistem!' });
        } catch (error) {
            console.error('Gagal menghapus quest:', error);
            alert('Gagal menghapus quest. Coba lagi.');
        }
    };

    return { quests, loading, toast, setToast, remove };
}
