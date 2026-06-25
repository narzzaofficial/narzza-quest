'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import { getNotifStyle } from '@/lib/notifications';
import { formatTimeOnlyID } from '@/lib/dateUtils';
import type { Notification } from '@/types';

interface Props {
    notif: Notification;
    href: string | null;
    onActivate: () => void;
}

export function NotifRow({ notif, href, onActivate }: Props) {
    const { Icon, soft, color } = getNotifStyle(notif.type);
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
                        {formatTimeOnlyID(notif.createdAt)}
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
