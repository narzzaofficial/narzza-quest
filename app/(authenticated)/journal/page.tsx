'use client';

import React from 'react';
import {
    BookOpen,
    Calendar,
    MessageSquare,
    Award,
    Feather,
    Users,
    Wallet,
    Loader2,
    CheckCircle2,
    Sparkles,
} from 'lucide-react';
import { useJournal } from '@/hooks/useJournal';
import { CATEGORY_LABEL } from '@/constants/ui';
import PageHeader from '@/components/ui/PageHeader';
import GlassCard from '@/components/ui/GlassCard';
import StatTile from '@/components/ui/StatTile';
import EmptyState from '@/components/ui/EmptyState';
import DifficultyBadge from '@/components/ui/DifficultyBadge';
import type { Quest } from '@/types';

export default function JournalPage() {
    const j = useJournal();

    if (j.loading || (j.isLoadingData && !j.selectedHeroId)) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-brand animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
            <PageHeader
                icon={<BookOpen className="w-6 h-6 text-white" />}
                title="Jurnal"
                subtitle="Catatan & pencapaian dari quest yang telah diselesaikan."
            />

            {/* GM hero picker */}
            {j.profile?.role === 'gm' && j.linkedHeroes.length > 0 && (
                <GlassCard className="px-4 py-3 flex flex-col md:flex-row items-center gap-3 justify-between">
                    <div className="flex items-center gap-2 text-ink font-bold text-sm">
                        <Users className="w-4 h-4 text-brand" /> Pilih Jurnal Hero:
                    </div>
                    <select
                        value={j.selectedHeroId}
                        onChange={(e) => j.setSelectedHeroId(e.target.value)}
                        className="w-full md:w-56 p-2.5 rounded-xl border border-line bg-surface font-bold text-sm text-ink outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/15 cursor-pointer"
                    >
                        {j.linkedHeroes.map((hero) => (
                            <option key={hero.uid} value={hero.uid}>
                                {hero.displayName} (Lv. {hero.level})
                            </option>
                        ))}
                    </select>
                </GlassCard>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
                <StatTile icon={CheckCircle2} label="Quest Selesai" value={j.completedQuests.length} grad="brand" />
                <StatTile icon={Award} label="Total EXP" value={j.totalExpEarned} grad="amber" />
            </div>

            {/* Timeline */}
            <section className="space-y-3">
                <p className="text-ink-muted text-[10px] uppercase tracking-widest font-bold">Catatan Terbaru</p>

                {j.isLoadingData ? (
                    <div className="text-center py-8 text-ink-muted font-bold text-sm">Membuka lembaran jurnal…</div>
                ) : j.completedQuests.length === 0 ? (
                    <EmptyState
                        icon={Feather}
                        title="Jurnal masih kosong"
                        desc="Belum ada quest yang disetujui. Selesaikan quest untuk mengukir sejarah!"
                    />
                ) : (
                    j.completedQuests.map((quest) => <JournalEntry key={quest.id} quest={quest} />)
                )}
            </section>

            {j.completedQuests.length > 0 && (
                <p className="text-center text-ink-muted font-bold text-xs tracking-widest uppercase py-4">— Akhir dari jurnal —</p>
            )}
        </div>
    );
}

function JournalEntry({ quest }: { quest: Quest }) {
    return (
        <GlassCard className="p-5">
            <div className="flex items-start gap-3 mb-3">
                <DifficultyBadge difficulty={quest.difficulty} className="px-2.5 py-1 text-sm" />
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-surface-2 text-ink-soft">
                    {CATEGORY_LABEL[quest.category]}
                </span>
                <span className="text-xs font-bold text-ink-muted flex items-center gap-1 ml-auto">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(quest.reviewedAt || quest.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
            </div>

            <h3 className="text-lg font-extrabold text-ink mb-1.5">{quest.title}</h3>
            <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="text-sm font-bold text-brand flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5" /> +{quest.expReward + (quest.bonusExp || 0)} EXP
                </span>
                {quest.moneyReward && quest.moneyReward > 0 ? (
                    <span className="bg-success-soft text-success font-black text-[10px] px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                        <Wallet className="w-3 h-3" /> Rp {quest.moneyReward.toLocaleString('id-ID')}
                    </span>
                ) : null}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-surface-2 px-4 py-3.5 rounded-xl">
                    <div className="flex items-center gap-1.5 mb-2 text-ink-muted">
                        <Feather className="w-3.5 h-3.5" />
                        <p className="text-[10px] font-bold uppercase tracking-wider">Catatanmu</p>
                    </div>
                    <p className="text-ink-soft font-medium text-sm leading-relaxed italic">
                        &ldquo;{quest.submissionNote || 'Tidak ada catatan.'}&rdquo;
                    </p>
                </div>

                <div className="bg-brand-soft border border-brand/15 px-4 py-3.5 rounded-xl">
                    <div className="flex items-center gap-1.5 mb-2 text-brand">
                        {quest.createdBy === 'ai-gm' ? <Sparkles className="w-3.5 h-3.5" /> : <MessageSquare className="w-3.5 h-3.5" />}
                        <p className="text-[10px] font-bold uppercase tracking-wider">
                            {quest.createdBy === 'ai-gm' ? 'Catatan AI' : 'Review GM'}
                        </p>
                    </div>
                    <p className="text-ink font-semibold text-sm leading-relaxed italic">
                        &ldquo;{quest.reviewNote || 'Kerja bagus!'}&rdquo;
                    </p>
                </div>
            </div>
        </GlassCard>
    );
}
