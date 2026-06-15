'use client';

import React from 'react';
import { ScrollText, Inbox } from 'lucide-react';
import { useQuestBoard, QUEST_FILTERS } from '@/hooks/useQuestBoard';
import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/ui/EmptyState';
import { HeartsStrip } from '@/components/quest-board/HeartsStrip';
import { QuestCard }   from '@/components/quest-board/QuestCard';

const FILTER_LABEL: Record<string, string> = {
    All: 'Semua', Available: 'Tersedia', Active: 'Aktif', Completed: 'Selesai',
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
