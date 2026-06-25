'use client';

import { useAuth } from '@/hooks/useAuth';
import { useOfflineSync } from '@/hooks/useOfflineSync';

export default function OfflineSyncManager() {
    const { user } = useAuth();
    useOfflineSync(user);
    return null;
}
