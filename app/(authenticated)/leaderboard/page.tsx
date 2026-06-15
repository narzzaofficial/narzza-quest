'use client';

import React from 'react';
import { Trophy, Loader2 } from 'lucide-react';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/ui/EmptyState';
import { LeaderRow } from '@/components/leaderboard/LeaderRow';

export default function LeaderboardPage() {
    const { profile, loading, leaders } = useLeaderboard();

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-xp animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
            <PageHeader
                grad="amber"
                icon={<Trophy className="w-6 h-6 text-white" />}
                title="Leaderboard"
                subtitle="Peringkat para pahlawan berdasarkan EXP yang dikumpulkan."
                badge="Hall of Fame"
            />

            {leaders.length === 0 ? (
                <EmptyState icon={Trophy} title="Belum ada Hero di papan ini" desc="Kumpulkan EXP untuk menduduki takhta tertinggi!" />
            ) : (
                <div className="space-y-3">
                    {leaders.map((user, index) => (
                        <LeaderRow key={user.uid} user={user} rank={index + 1} isMe={profile?.uid === user.uid} />
                    ))}
                </div>
            )}
        </div>
    );
}
