'use client';

import { useCallback, useEffect, useState } from 'react';
import { getPendingOfflineCount } from '@/lib/offlineQueue';

export function useOfflineQueueStatus() {
    const [pendingCount, setPendingCount] = useState(0);

    const refreshPendingCount = useCallback(async () => {
        try {
            const count = await getPendingOfflineCount();
            setPendingCount(count);
        } catch (error) {
            console.error('Gagal membaca status offline queue:', error);
        }
    }, []);

    useEffect(() => {
        const onUpdated = () => { void refreshPendingCount(); };
        const onVisibility = () => {
            if (document.visibilityState === 'visible') onUpdated();
        };
        const initTimer = window.setTimeout(onUpdated, 0);

        window.addEventListener('offline-queue-updated', onUpdated as EventListener);
        window.addEventListener('online', onUpdated);
        document.addEventListener('visibilitychange', onVisibility);

        const interval = window.setInterval(onUpdated, 15000);

        return () => {
            window.removeEventListener('offline-queue-updated', onUpdated as EventListener);
            window.removeEventListener('online', onUpdated);
            document.removeEventListener('visibilitychange', onVisibility);
            window.clearTimeout(initTimer);
            window.clearInterval(interval);
        };
    }, [refreshPendingCount]);

    return { pendingCount, refreshPendingCount };
}
