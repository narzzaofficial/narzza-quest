'use client';

import { useDashboard } from '@/hooks/useDashboard';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { HeroDashboard }    from '@/components/dashboard/HeroDashboard';
import { GMDashboard }      from '@/components/dashboard/GMDashboard';

export default function DashboardPage() {
    const d = useDashboard();

    if (d.loading || !d.profile) return <DashboardSkeleton />;
    if (d.profile.role === 'gm') return <GMDashboard d={d} />;
    return <HeroDashboard d={d} />;
}
