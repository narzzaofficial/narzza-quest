'use client';

import React from 'react';
import { BookOpen, Award, Feather, Users, Loader2, CheckCircle2 } from 'lucide-react';
import { useJournal } from '@/hooks/useJournal';
import PageHeader from '@/components/ui/PageHeader';
import GlassCard from '@/components/ui/GlassCard';
import StatTile from '@/components/ui/StatTile';
import EmptyState from '@/components/ui/EmptyState';
import { JournalEntry } from '@/components/journal/JournalEntry';

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
