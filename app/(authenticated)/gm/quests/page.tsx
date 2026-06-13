'use client';

import React from 'react';
import Link from 'next/link';
import { ListTodo, Plus, Zap, Trash2, Clock, Loader2 } from 'lucide-react';
import { useGMQuests } from '@/hooks/useGMQuests';
import { CATEGORY_LABEL } from '@/constants/ui';
import PageHeader from '@/components/ui/PageHeader';
import GlassCard from '@/components/ui/GlassCard';
import EmptyState from '@/components/ui/EmptyState';
import DifficultyBadge from '@/components/ui/DifficultyBadge';
import StatusBadge from '@/components/ui/StatusBadge';
import Toast from '@/components/ui/Toast';
import type { Quest } from '@/types';

export default function GMQuestListPage() {
    const gm = useGMQuests();

    if (gm.loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-brand animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
            <PageHeader
                icon={<ListTodo className="w-6 h-6 text-white" />}
                title="Manage Quests"
                subtitle="Kelola semua quest yang kamu buat untuk hero."
                badge="GM Panel"
                actions={
                    <>
                        <Link href="/gm/quests/new" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white text-brand px-4 py-2.5 font-bold text-sm shadow-card hover:bg-white/90 transition">
                            <Plus className="w-4 h-4" /> Quest Baru
                        </Link>
                        <Link href="/gm/quests/new/json" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/15 ring-1 ring-white/25 text-white px-4 py-2.5 font-bold text-sm hover:bg-white/25 transition">
                            <Zap className="w-4 h-4" /> JSON Batch
                        </Link>
                    </>
                }
            />

            {gm.quests.length === 0 ? (
                <EmptyState icon={ListTodo} title="Belum ada quest" desc='Klik "Quest Baru" untuk mulai membuat misi.' />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {gm.quests.map((q) => (
                        <GMQuestCard key={q.id} quest={q} onDelete={() => gm.remove(q.id)} />
                    ))}
                </div>
            )}

            <Toast isVisible={gm.toast.show} onClose={() => gm.setToast({ ...gm.toast, show: false })} message={gm.toast.message} type="success" />
        </div>
    );
}

function GMQuestCard({ quest, onDelete }: { quest: Quest; onDelete: () => void }) {
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
                {new Date(quest.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </div>
        </GlassCard>
    );
}
