'use client';

import { Skeleton } from '@/components/ui/Skeleton';
import GlassCard from '@/components/ui/GlassCard';

export function DashboardSkeleton() {
    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Skeleton className="w-16 h-16 rounded-2xl" />
                <div className="space-y-2 flex-1 max-w-sm">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
            </div>
            
            <GlassCard className="p-6">
                <Skeleton className="h-8 w-1/3 mb-4" />
                <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                </div>
            </GlassCard>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3].map(i => (
                    <GlassCard key={i} className="p-5 space-y-4">
                        <Skeleton className="h-6 w-1/2" />
                        <Skeleton className="h-16 w-full" />
                        <div className="flex justify-between">
                            <Skeleton className="h-4 w-1/4" />
                            <Skeleton className="h-4 w-1/4" />
                        </div>
                    </GlassCard>
                ))}
            </div>
        </div>
    );
}
