'use client';

import Link from 'next/link';
import { Bot, Wallet, Clock, ChevronRight } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import DifficultyBadge from '@/components/ui/DifficultyBadge';
import StatusBadge from '@/components/ui/StatusBadge';
import { CATEGORY_LABEL } from '@/constants/ui';
import { isAIQuest, AI_GM } from '@/constants/ai';
import { formatRupiah } from '@/lib/currency';
import { formatDeadlineShort } from '@/lib/dateUtils';
import type { Quest, QuestStatus } from '@/types';

interface Props {
    quest: Quest;
    queued: boolean;
    gmName?: string;
}

export function QuestCard({ quest, queued, gmName }: Props) {
    const isCompleted    = ['submitted', 'approved', 'missed'].includes(quest.status) || queued;
    const displayStatus: QuestStatus = queued ? 'submitted' : quest.status;
    const fromAI = isAIQuest(quest.createdBy);
    const from   = fromAI ? AI_GM.name : gmName;

    return (
        <GlassCard className={`flex flex-col p-5 transition-all ${isCompleted ? 'opacity-80' : 'hover:shadow-pop hover:-translate-y-0.5'}`}>
            <div className="flex justify-between items-start mb-3">
                <DifficultyBadge difficulty={quest.difficulty} className="px-2.5 py-1 text-sm" />
                <div className="flex flex-wrap items-center gap-1.5 justify-end">
                    {quest.moneyReward && quest.moneyReward > 0 ? (
                        <span className="bg-success-soft text-success font-black text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1">
                            <Wallet className="w-3 h-3" /> {formatRupiah(quest.moneyReward)}
                        </span>
                    ) : null}
                    <span className="bg-brand-soft text-brand font-black text-[10px] px-2.5 py-1 rounded-full">
                        +{quest.expReward} EXP
                    </span>
                </div>
            </div>

            {from && (
                <div className="mb-2">
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wide ${fromAI ? 'bg-brand-soft text-brand' : 'bg-surface-2 text-ink-soft'}`}>
                        {fromAI && <Bot className="w-3 h-3" />}
                        <span className="truncate">{fromAI ? 'AI Game Master' : `GM: ${from}`}</span>
                    </span>
                </div>
            )}

            <h3 className="text-lg font-extrabold mb-1.5 leading-snug line-clamp-2 text-ink">{quest.title}</h3>
            <p className="text-sm text-ink-soft mb-4 line-clamp-2">{quest.description || 'Tidak ada deskripsi misi.'}</p>

            <div className="mt-auto space-y-3 pt-4 border-t border-line">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg bg-surface-2 text-ink-soft">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDeadlineShort(quest.deadline)}
                    </span>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-surface-2 text-ink-soft">
                        {CATEGORY_LABEL[quest.category]}
                    </span>
                    <StatusBadge status={displayStatus} />
                </div>

                <Link
                    href={`/quest-board/${quest.id}`}
                    className={`w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-sm transition-all ${isCompleted
                        ? 'bg-surface-2 text-ink-soft hover:brightness-95'
                        : 'bg-brand text-white shadow-card hover:bg-brand-hover'
                        }`}
                >
                    {isCompleted ? 'Lihat Arsip' : 'Detail & Submit'} <ChevronRight className="w-4 h-4" />
                </Link>
            </div>
        </GlassCard>
    );
}
