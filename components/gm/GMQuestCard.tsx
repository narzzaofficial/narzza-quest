'use client';

import { Trash2, Clock } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import DifficultyBadge from '@/components/ui/DifficultyBadge';
import StatusBadge from '@/components/ui/StatusBadge';
import { CATEGORY_LABEL } from '@/constants/ui';
import { formatDateTimeID } from '@/lib/dateUtils';
import type { Quest } from '@/types';

interface Props {
    quest: Quest;
    onDelete: () => void;
}

export function GMQuestCard({ quest, onDelete }: Props) {
    return (
        <GlassCard className="p-5 flex flex-col gap-3">
            <div className="flex justify-between items-start gap-2">
                <div className="min-w-0">
                    <h3 className="font-extrabold text-ink text-lg leading-tight">{quest.title}</h3>
                    <span className="text-xs font-extrabold text-brand">+{quest.expReward} EXP</span>
                </div>
                <button
                    onClick={onDelete}
                    disabled={quest.status === 'approved'}
                    className="text-ink-muted hover:text-danger disabled:opacity-30 disabled:cursor-not-allowed transition-colors shrink-0"
                    aria-label="Hapus quest"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>
            <div className="flex flex-wrap gap-2">
                <DifficultyBadge difficulty={quest.difficulty} />
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-surface-2 text-ink-soft">{CATEGORY_LABEL[quest.category]}</span>
                <StatusBadge status={quest.status} />
            </div>
            <div className="pt-3 border-t border-line text-xs text-ink-muted font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {formatDateTimeID(quest.deadline)}
            </div>
        </GlassCard>
    );
}
