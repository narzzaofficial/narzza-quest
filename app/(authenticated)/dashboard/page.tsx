'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useDashboard } from '@/hooks/useDashboard';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { HeroDashboard }    from '@/components/dashboard/HeroDashboard';
import { GMDashboard }      from '@/components/dashboard/GMDashboard';

export default function DashboardPage() {
    const d = useDashboard();
    const { profile, loading } = d;
    const router = useRouter();

    useEffect(() => {
        if (profile && profile.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL) {
            router.push('/superadmin');
        }
    }, [profile, router]);

    if (loading || !profile) return <DashboardSkeleton />;
    if (profile.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL) return null;
    if (profile.role === 'gm') return <GMDashboard d={d} />;
    return <HeroDashboard d={d} />;
}
