'use client';

import { Crown, Medal, Star } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import { getCumulativeExp } from '@/lib/leveling';
import { getAvatarUrl } from '@/lib/avatar';
import type { UserProfile } from '@/types';

function rankMeta(rank: number) {
    if (rank === 1) return { Icon: Crown, chip: 'bg-xp text-white',          accent: 'var(--color-xp)'       };
    if (rank === 2) return { Icon: Medal, chip: 'bg-surface-2 text-ink-soft', accent: 'var(--color-ink-soft)' };
    if (rank === 3) return { Icon: Medal, chip: 'bg-warn-soft text-warn',     accent: 'var(--color-warn)'     };
    return { Icon: null, chip: 'bg-surface-2 text-ink-muted', accent: 'var(--color-ink-muted)' };
}

interface Props {
    user: UserProfile;
    rank: number;
    isMe: boolean;
}

export function LeaderRow({ user, rank, isMe }: Props) {
    const { Icon, chip, accent } = rankMeta(rank);
    const isTop      = rank === 1;
    const totalExp   = getCumulativeExp(user);

    return (
        <GlassCard className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 transition-all ${isMe ? 'ring-2 ring-brand ring-offset-2 ring-offset-bg' : ''} ${isTop ? 'shadow-pop' : ''}`}>
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center font-black text-lg shrink-0 ${chip}`}>
                {Icon ? <Icon className="w-6 h-6" /> : rank}
            </div>

            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden shrink-0 ring-2" style={{ ['--tw-ring-color' as string]: isTop ? accent : 'var(--color-line)' }}>
                <img src={getAvatarUrl(user.avatar, user.displayName)} alt={user.displayName} className="w-full h-full object-cover" />
            </div>

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

            <div className="text-right shrink-0">
                <p className="text-xl sm:text-2xl font-black leading-none" style={{ color: isTop ? accent : 'var(--color-ink)' }}>{totalExp.toLocaleString()}</p>
                <p className="text-[9px] font-extrabold text-ink-muted uppercase tracking-widest mt-1">Total EXP</p>
            </div>
        </GlassCard>
    );
}
