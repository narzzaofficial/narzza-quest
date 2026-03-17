'use client';

import { useEffect, useRef } from 'react';
import { auth } from '@/lib/firebase';
import { getOfflineItems, markOfflineItemFailed, removeOfflineItem } from '@/lib/offlineQueue';
import { useAuth } from '@/hooks/useAuth';

export default function OfflineSyncManager() {
    const { user } = useAuth();
    const syncingRef = useRef(false);

    useEffect(() => {
        const syncQueue = async () => {
            if (!user || syncingRef.current || !navigator.onLine) return;
            syncingRef.current = true;

            try {
                const items = await getOfflineItems();
                const sorted = items
                    .filter((item) => typeof item.id === 'number')
                    .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));

                for (const item of sorted) {
                    if (typeof item.id !== 'number') continue;
                    if ((item.nextRetryAt || 0) > Date.now()) continue;
                    const freshToken = await auth.currentUser?.getIdToken();
                    const idToken = freshToken || item.idToken;
                    if (!idToken) continue;

                    try {
                        if (item.type === 'accept_quest') {
                            const acceptRes = await fetch('/api/offline/quest/accept', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ questId: item.questId, idToken }),
                            });
                            if (!acceptRes.ok) throw new Error('Gagal sinkronisasi accept quest.');
                            await removeOfflineItem(item.id);
                            continue;
                        }

                        const uploadedUrls: string[] = [];
                        for (const file of item.files) {
                            const formData = new FormData();
                            const uploadFile = new File([file.blob], file.name, {
                                type: file.type,
                                lastModified: file.lastModified,
                            });
                            formData.append('file', uploadFile);
                            formData.append('questId', item.questId);

                            const response = await fetch('/api/upload', { method: 'POST', body: formData });
                            if (!response.ok) throw new Error('Upload gagal saat sinkronisasi offline queue.');
                            const result = await response.json();
                            uploadedUrls.push(result.url);
                        }

                        const submitRes = await fetch('/api/offline/quest/submit', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                questId: item.questId,
                                submissionNote: item.submissionNote,
                                urls: uploadedUrls,
                                idToken,
                            }),
                        });
                        if (!submitRes.ok) throw new Error('Gagal sinkronisasi submit quest.');
                        await removeOfflineItem(item.id);
                    } catch (itemError) {
                        console.error('Offline sync item failed:', itemError);
                        await markOfflineItemFailed(item.id, item.retryCount || 0);
                    }
                }
            } catch (error) {
                console.error('Offline queue sync error:', error);
            } finally {
                syncingRef.current = false;
            }
        };

        const runSync = () => { void syncQueue(); };
        const handleVisibility = () => {
            if (document.visibilityState === 'visible') runSync();
        };
        runSync();
        window.addEventListener('online', runSync);
        document.addEventListener('visibilitychange', handleVisibility);

        return () => {
            window.removeEventListener('online', runSync);
            document.removeEventListener('visibilitychange', handleVisibility);
        };
    }, [user]);

    return null;
}
