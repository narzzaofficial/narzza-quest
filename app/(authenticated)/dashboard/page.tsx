'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { useDashboard } from '@/hooks/useDashboard';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { HeroDashboard }    from '@/components/dashboard/HeroDashboard';
import { GMDashboard }      from '@/components/dashboard/GMDashboard';

export default function DashboardPage() {
    const d = useDashboard();
    const { profile, loading } = d;
    const router = useRouter();
    const nudgeFired = useRef(false);

    useEffect(() => {
        if (profile && profile.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL) {
            router.push('/superadmin');
        }
    }, [profile, router]);

    // Fire-and-forget: brutal nudge via Telegram if user opens dashboard with no activity today
    useEffect(() => {
        if (!profile?.uid || !profile.telegramChatId || nudgeFired.current) return;
        nudgeFired.current = true;
        fetch('/api/telegram/dashboard-nudge', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid: profile.uid }),
        }).catch(() => { /* silent — notification is best-effort */ });
    }, [profile?.uid, profile?.telegramChatId]);

    if (loading || !profile) return <DashboardSkeleton />;
    if (profile.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL) return null;
    if (profile.role === 'gm') return <GMDashboard d={d} />;
    return <HeroDashboard d={d} />;
}
