'use client';

import React from 'react';
import Link from 'next/link';
import { ScrollText, Heart, Wallet, Bot, Clock, Inbox, ChevronRight } from 'lucide-react';
import { useQuestBoard, QUEST_FILTERS } from '@/hooks/useQuestBoard';
import { isAIQuest, AI_GM } from '@/constants/ai';
import { CATEGORY_LABEL } from '@/constants/ui';
import PageHeader from '@/components/ui/PageHeader';
import GlassCard from '@/components/ui/GlassCard';
import DifficultyBadge from '@/components/ui/DifficultyBadge';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';
import SectionLabel from '@/components/ui/SectionLabel';
import type { Quest, QuestStatus } from '@/types';

const FILTER_LABEL: Record<string, string> = {
    All: 'Semua',
    Available: 'Tersedia',
    Active: 'Aktif',
    Completed: 'Selesai',
};

export default function QuestBoardPage() {
    const board = useQuestBoard();

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
            <PageHeader
                icon={<ScrollText className="w-6 h-6 text-white" />}
                title="Quest Board"
                subtitle="Semua misimu — selesaikan & raih EXP!"
                actions={<HeartsStrip hearts={board.hearts} />}
            />

            {/* Filters */}
            <div className="inline-flex flex-wrap items-center gap-2 glass p-2 rounded-card shadow-card">
                {QUEST_FILTERS.map((filter) => (
                    <button
                        key={filter}
                        onClick={() => board.setActiveFilter(filter)}
                        className={`px-5 py-2 rounded-xl font-bold text-sm transition-all ${board.activeFilter === filter
                            ? 'bg-brand text-white shadow-card'
                            : 'text-ink-soft hover:bg-surface-2'
                            }`}
                    >
                        {FILTER_LABEL[filter]}
                    </button>
                ))}
            </div>

            {board.loading ? (
                <div className="text-center py-20 text-ink-muted font-bold">Mengumpulkan quest…</div>
            ) : board.quests.length === 0 ? (
                <EmptyState
                    icon={Inbox}
                    title="Tidak ada quest di kategori ini"
                    desc="Coba ubah filter, atau minta AI Game Master menyusun misi baru."
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {board.quests.map((quest) => (
                        <QuestCard
                            key={quest.id}
                            quest={quest}
                            queued={board.queuedSubmitQuestIds.has(quest.id)}
                            gmName={board.gmMap[quest.createdBy]}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function HeartsStrip({ hearts }: { hearts: number }) {
    return (
        <div className="inline-flex items-center gap-1.5 bg-white/15 ring-1 ring-white/25 rounded-xl px-3 py-2">
            {Array.from({ length: 5 }).map((_, i) => (
                <Heart key={i} className={`w-4 h-4 ${i < hearts ? 'fill-white text-white' : 'text-white/40'}`} />
            ))}
        </div>
    );
}

function QuestCard({ quest, queued, gmName }: { quest: Quest; queued: boolean; gmName?: string }) {
    const isCompleted = ['submitted', 'approved', 'missed'].includes(quest.status) || queued;
    const displayStatus: QuestStatus = queued ? 'submitted' : quest.status;
    const fromAI = isAIQuest(quest.createdBy);
    const from = fromAI ? AI_GM.name : gmName;

    return (
        <GlassCard className={`flex flex-col p-5 transition-all ${isCompleted ? 'opacity-80' : 'hover:shadow-pop hover:-translate-y-0.5'}`}>
            <div className="flex justify-between items-start mb-3">
                <DifficultyBadge difficulty={quest.difficulty} className="px-2.5 py-1 text-sm" />
                <div className="flex flex-wrap items-center gap-1.5 justify-end">
                    {quest.moneyReward && quest.moneyReward > 0 ? (
                        <span className="bg-success-soft text-success font-black text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1">
                            <Wallet className="w-3 h-3" /> Rp {quest.moneyReward.toLocaleString('id-ID')}
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
                        {new Date(quest.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
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
