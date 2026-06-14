'use client';

import React, { useState } from 'react';
import { Bot, X, ChevronRight } from 'lucide-react';
import type { GMMessage, GMMessageType } from '@/types';
import Link from 'next/link';

const GRAD_BRAND = 'linear-gradient(135deg, #4f7cff 0%, #38bdf8 100%)';

function typeEmoji(type: GMMessageType): string {
    switch (type) {
        case 'streak_warning':  return '⚡';
        case 'idle_warning':    return '👋';
        case 'quest_deadline':  return '📅';
        case 'welcome_back':    return '🎉';
        case 'level_up':        return '🚀';
        case 'daily_check':     return '🌅';
        default:                return '💬';
    }
}

interface Props {
    message: GMMessage;
    onDismiss: (id: string) => void;
}

export function GMBanner({ message, onDismiss }: Props) {
    const [visible, setVisible] = useState(true);

    if (!visible) return null;

    const handleDismiss = () => {
        setVisible(false);
        onDismiss(message.id);
    };

    return (
        <div className="rounded-card shadow-card overflow-hidden animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-start gap-3 p-4" style={{ backgroundImage: GRAD_BRAND }}>
                {/* Bot avatar */}
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-5 h-5 text-white" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-xs">{typeEmoji(message.type)}</span>
                        <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest">AI Game Master</p>
                    </div>
                    <p className="text-white text-sm font-semibold leading-snug">{message.content}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0 mt-0.5">
                    <Link
                        href="/notifications"
                        className="p-1.5 text-white/70 hover:text-white hover:bg-white/15 rounded-lg transition-colors"
                        title="Lihat semua pesan GM"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Link>
                    <button
                        onClick={handleDismiss}
                        className="p-1.5 text-white/70 hover:text-white hover:bg-white/15 rounded-lg transition-colors"
                        title="Tutup"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
