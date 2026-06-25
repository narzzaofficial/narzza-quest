'use client';

import { Bot } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import { formatTimeOnlyID } from '@/lib/dateUtils';
import type { GMMessage } from '@/types';

interface Props {
    message: GMMessage;
    onRead: (id: string) => void;
}

export function GMMessageRow({ message, onRead }: Props) {
    return (
        <GlassCard
            onClick={() => !message.isRead && onRead(message.id)}
            className={`p-4 flex gap-3 transition-all ${message.isRead ? 'opacity-60' : 'hover:shadow-pop cursor-pointer'}`}
        >
            <div className="w-10 h-10 rounded-xl bg-brand-soft flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5 text-brand" />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                    <p className={`text-sm font-bold ${message.isRead ? 'text-ink-soft' : 'text-ink'}`}>
                        AI Game Master
                        {message.priority === 'high' && !message.isRead && (
                            <span className="ml-2 text-[9px] bg-danger text-white font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                                Penting
                            </span>
                        )}
                    </p>
                    <span className="text-[10px] text-ink-muted whitespace-nowrap">
                        {formatTimeOnlyID(message.createdAt)}
                    </span>
                </div>
                <p className="text-sm text-ink-soft leading-relaxed">{message.content}</p>
            </div>
            {!message.isRead && <div className="w-2.5 h-2.5 bg-brand rounded-full self-center shrink-0 mt-0.5" />}
        </GlassCard>
    );
}
