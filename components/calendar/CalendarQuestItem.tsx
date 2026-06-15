'use client';

import Link from 'next/link';
import { Clock, ChevronRight } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import DifficultyBadge from '@/components/ui/DifficultyBadge';
import type { Quest } from '@/types';

interface CalendarQuestItemProps {
    quest: Quest;
    heroName?: string;
}

export function CalendarQuestItem({ quest, heroName }: CalendarQuestItemProps) {
    return (
        <Link
            href={`/quest-board/${quest.id}`}
            className="group p-4 rounded-xl border border-line bg-surface-2 hover:bg-brand-soft hover:border-brand/30 transition-colors flex flex-col gap-2"
        >
            <div className="flex justify-between items-start">
                <StatusBadge status={quest.status} />
                <div className="flex items-center gap-1 text-[10px] font-bold text-ink-soft bg-surface px-2 py-1 rounded-md">
                    <Clock className="w-3 h-3" />
                    {new Date(quest.deadline).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>
            <h3 className="font-bold text-ink text-sm leading-snug group-hover:text-brand transition-colors">{quest.title}</h3>
            <div className="flex items-center gap-2">
                <DifficultyBadge difficulty={quest.difficulty} />
                <span className="text-[10px] font-bold uppercase text-ink-muted">+{quest.expReward} EXP</span>
                <ChevronRight className="w-4 h-4 text-ink-muted ml-auto group-hover:text-brand transition-colors" />
            </div>
            {heroName && (
                <div className="flex items-center gap-1.5 bg-brand-soft px-2.5 py-1.5 rounded-lg">
                    <span className="text-[10px] font-black text-brand uppercase tracking-wide">Hero:</span>
                    <span className="text-[10px] font-bold text-ink">{heroName}</span>
                </div>
            )}
        </Link>
    );
}
