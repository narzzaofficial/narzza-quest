'use client';

import React from 'react';
import { Trophy, Crown, Medal, Star, Loader2 } from 'lucide-react';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import PageHeader from '@/components/ui/PageHeader';
import GlassCard from '@/components/ui/GlassCard';
import EmptyState from '@/components/ui/EmptyState';
import type { UserProfile } from '@/types';

function avatarFor(name: string) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=fbf1dd&color=d99a2b&bold=true&size=200`;
}

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

function rankMeta(rank: number) {
    if (rank === 1) return { Icon: Crown, chip: 'bg-xp text-white', accent: 'var(--color-xp)' };
    if (rank === 2) return { Icon: Medal, chip: 'bg-surface-2 text-ink-soft', accent: 'var(--color-ink-soft)' };
    if (rank === 3) return { Icon: Medal, chip: 'bg-warn-soft text-warn', accent: 'var(--color-warn)' };
    return { Icon: null, chip: 'bg-surface-2 text-ink-muted', accent: 'var(--color-ink-muted)' };
}

function LeaderRow({ user, rank, isMe }: { user: UserProfile; rank: number; isMe: boolean }) {
    const { Icon, chip, accent } = rankMeta(rank);
    const isTop = rank === 1;

    return (
        <GlassCard className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 transition-all ${isMe ? 'ring-2 ring-brand ring-offset-2 ring-offset-bg' : ''} ${isTop ? 'shadow-pop' : ''}`}>
            {/* Rank chip */}
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center font-black text-lg shrink-0 ${chip}`}>
                {Icon ? <Icon className="w-6 h-6" /> : rank}
            </div>

            {/* Avatar */}
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden shrink-0 ring-2" style={{ ['--tw-ring-color' as string]: isTop ? accent : 'var(--color-line)' }}>
                <img src={user.avatar || avatarFor(user.displayName)} alt={user.displayName} className="w-full h-full object-cover" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                    <h2 className="text-base sm:text-lg font-bold truncate text-ink">{user.displayName}</h2>
                    {isMe && <span className="bg-brand-soft text-brand text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md shrink-0">Kamu</span>}
                </div>
                <p className="text-[11px] sm:text-xs font-bold text-ink-muted uppercase tracking-widest flex items-center gap-1.5 truncate">
                    <Star className="w-3.5 h-3.5 shrink-0" style={{ color: isTop ? accent : 'var(--color-ink-muted)', fill: isTop ? accent : 'none' }} />
                    <span className="truncate">Lv. {user.level || 1} · {user.title || 'Hero'}</span>
                </p>
            </div>

            {/* EXP */}
            <div className="text-right shrink-0">
                <p className="text-xl sm:text-2xl font-black leading-none" style={{ color: isTop ? accent : 'var(--color-ink)' }}>{user.exp || 0}</p>
                <p className="text-[9px] font-extrabold text-ink-muted uppercase tracking-widest mt-1">EXP</p>
            </div>
        </GlassCard>
    );
}
