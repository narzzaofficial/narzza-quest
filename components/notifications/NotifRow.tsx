'use client';

import React from 'react';
import {
    Bell, Heart, CheckCircle2, AlertTriangle, ScrollText,
    Wallet, Swords, ChevronRight,
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import type { Notification } from '@/types';

function notifStyle(type: string): { Icon: React.ElementType; soft: string; color: string } {
    switch (type) {
        case 'encouragement':       return { Icon: Heart,        soft: 'bg-danger-soft',  color: 'var(--color-danger)'  };
        case 'quest_approved':      return { Icon: CheckCircle2, soft: 'bg-success-soft', color: 'var(--color-success)' };
        case 'quest_rejected':      return { Icon: AlertTriangle, soft: 'bg-danger-soft', color: 'var(--color-danger)'  };
        case 'quest_assigned':
        case 'quest_created':       return { Icon: ScrollText,   soft: 'bg-brand-soft',   color: 'var(--color-brand)'   };
        case 'guild_quest_open':
        case 'guild_quest_claimed': return { Icon: Swords,       soft: 'bg-info-soft',    color: 'var(--color-info)'    };
        case 'withdrawal_requested':
        case 'withdrawal_transferred':
        case 'withdrawal_confirmed':
        case 'withdrawal_rejected': return { Icon: Wallet,       soft: 'bg-success-soft', color: 'var(--color-success)' };
        default:                    return { Icon: Bell,          soft: 'bg-surface-2',    color: 'var(--color-ink-soft)' };
    }
}

interface Props {
    notif: Notification;
    href: string | null;
    onActivate: () => void;
}

export function NotifRow({ notif, href, onActivate }: Props) {
    const { Icon, soft, color } = notifStyle(notif.type);
    return (
        <GlassCard
            onClick={onActivate}
            className={`p-4 md:p-5 flex gap-4 cursor-pointer transition-all ${notif.isRead ? 'opacity-70 hover:opacity-100' : 'hover:shadow-pop'}`}
        >
            <div className={`${soft} w-12 h-12 shrink-0 rounded-xl flex items-center justify-center`}>
                <Icon className="w-6 h-6" style={{ color }} />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1 gap-2">
                    <h3 className={`text-base font-bold truncate ${notif.isRead ? 'text-ink-soft' : 'text-ink'}`}>{notif.title}</h3>
                    <span className="text-[10px] font-bold text-ink-muted whitespace-nowrap pt-1">
                        {new Date(notif.createdAt).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
                <p className={`text-sm leading-relaxed break-words ${notif.type === 'encouragement' ? 'text-danger italic font-semibold' : 'text-ink-soft'}`}>
                    {notif.message}
                </p>
                <span className="inline-block mt-2 text-[10px] font-extrabold uppercase tracking-wider bg-surface-2 text-ink-muted px-2 py-1 rounded-md">
                    Dari: {notif.fromName}
                </span>
            </div>
            <div className="flex items-center gap-2 self-center shrink-0">
                {!notif.isRead && <div className="w-2.5 h-2.5 bg-brand rounded-full" />}
                {href && <ChevronRight className="w-4 h-4 text-ink-muted" />}
            </div>
        </GlassCard>
    );
}
