'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { DIFFICULTY_COLOR, QUEST_STATUS_META, CATEGORY_LABEL } from '@/constants/ui';
import type { Quest } from '@/types';

export function QuestRow({ quest }: { quest: Quest }) {
    const status = QUEST_STATUS_META[quest.status] ?? QUEST_STATUS_META.pending;
    return (
        <Link
            href="/quest-board"
            className="group glass rounded-card p-4 shadow-card hover:shadow-pop transition-all flex items-center gap-4"
        >
            <div
                className="w-11 h-11 rounded-xl flex items-center justify-center font-extrabold text-white shrink-0 shadow-sm"
                style={{ backgroundColor: DIFFICULTY_COLOR[quest.difficulty] }}
            >
                {quest.difficulty}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-ink font-bold truncate">{quest.title}</p>
                <p className="text-ink-muted text-xs truncate">{CATEGORY_LABEL[quest.category]} · +{quest.expReward} EXP</p>
            </div>
            <span
                className={`${status.soft} text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full`}
                style={{ color: status.color }}
            >
                {status.label}
            </span>
            <ChevronRight className="w-4 h-4 text-ink-muted group-hover:text-brand transition-colors" />
        </Link>
    );
}
