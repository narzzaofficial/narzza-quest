'use client';

import { Crown, Shield } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import { getAvatarUrl } from '@/lib/avatar';
import type { UserProfile } from '@/types';

export function MemberCard({ member }: { member: UserProfile }) {
    const isGm = member.role === 'gm';
    return (
        <GlassCard className="flex items-center gap-4 p-4">
            <div className="w-14 h-14 rounded-2xl overflow-hidden ring-2 ring-line bg-surface shrink-0">
                <img src={getAvatarUrl(member.avatar, member.displayName)} alt={member.displayName} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
                <h3 className="font-bold text-ink truncate leading-snug">{member.displayName}</h3>
                <p className="text-xs text-ink-muted truncate">{member.email}</p>
                <div className="mt-1.5">
                    {isGm ? (
                        <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-xp-soft text-xp">
                            <Crown className="w-2.5 h-2.5" /> Game Master
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-brand-soft text-brand">
                            <Shield className="w-2.5 h-2.5" /> Lv. {member.level || 1} Hero
                        </span>
                    )}
                </div>
            </div>
        </GlassCard>
    );
}
