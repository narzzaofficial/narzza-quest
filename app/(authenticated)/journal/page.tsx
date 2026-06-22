'use client';

import React, { useState } from 'react';
import { BookOpen, Award, Feather, Users, Loader2, CheckCircle2, MessageCircle, Send, Lock, Eye } from 'lucide-react';
import { useJournal } from '@/hooks/useJournal';
import { addPersonalJournal } from '@/lib/journalDb';
import PageHeader from '@/components/ui/PageHeader';
import GlassCard from '@/components/ui/GlassCard';
import StatTile from '@/components/ui/StatTile';
import EmptyState from '@/components/ui/EmptyState';
import { JournalEntry } from '@/components/journal/JournalEntry';

export default function JournalPage() {
    const j = useJournal();
    const [journalContent, setJournalContent] = useState('');
    const [visibility, setVisibility] = useState<'private' | 'gm'>('private');
    const [isSaving, setIsSaving] = useState(false);

    const handleSaveJournal = async () => {
        if (!journalContent.trim() || !j.selectedHeroId) return;
        setIsSaving(true);
        try {
            await addPersonalJournal(j.selectedHeroId, journalContent.trim(), visibility);
            setJournalContent('');
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

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

            {/* Tulis Perasaan */}
            {j.profile?.role === 'player' && (
                <GlassCard className="p-4 space-y-3 relative overflow-hidden border-brand/20">
                    <div className="flex items-center gap-2 mb-2 text-brand font-bold text-sm">
                        <MessageCircle className="w-5 h-5" /> Apa yang kamu rasakan hari ini?
                    </div>
                    <textarea
                        value={journalContent}
                        onChange={(e) => setJournalContent(e.target.value)}
                        placeholder="Tuliskan keluh kesah, kegembiraan, atau apapun yang ada di pikiranmu..."
                        className="w-full bg-surface-2 border border-line rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand min-h-[100px] resize-y text-ink"
                    />
                    
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-2">
                        {/* Visibility Toggle */}
                        <div className="flex items-center bg-surface-2 p-1 rounded-xl border border-line/50">
                            <button
                                onClick={() => setVisibility('private')}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${visibility === 'private' ? 'bg-surface shadow-sm text-ink' : 'text-ink-muted hover:text-ink'}`}
                            >
                                <Lock className="w-3.5 h-3.5" /> Pribadi
                            </button>
                            <button
                                onClick={() => setVisibility('gm')}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${visibility === 'gm' ? 'bg-amber-400/20 text-amber-500' : 'text-ink-muted hover:text-ink'}`}
                            >
                                <Eye className="w-3.5 h-3.5" /> Bagikan ke GM
                            </button>
                        </div>

                        <button
                            onClick={handleSaveJournal}
                            disabled={isSaving || !journalContent.trim()}
                            className="bg-brand text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-brand-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto justify-center"
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            Simpan Perasaan
                        </button>
                    </div>
                </GlassCard>
            )}

            {/* Timeline */}
            <section className="space-y-4 mt-6">
                <p className="text-ink-muted text-[10px] uppercase tracking-widest font-bold mb-2">Linimasa Jurnal</p>

                {j.isLoadingData ? (
                    <div className="text-center py-8 text-ink-muted font-bold text-sm">Membuka lembaran jurnal…</div>
                ) : j.timeline.length === 0 ? (
                    <EmptyState
                        icon={Feather}
                        title="Jurnal masih kosong"
                        desc="Belum ada quest atau curhatan. Mulailah menulis sejarahmu!"
                    />
                ) : (
                    <div className="relative border-l-2 border-line/30 ml-4 pl-6 space-y-8">
                        {j.timeline.map((item) => {
                            if (item.type === 'quest') {
                                return (
                                    <div key={`q-${item.data.id}`} className="relative">
                                        <div className="absolute -left-[35px] top-4 w-4 h-4 rounded-full bg-surface border-2 border-brand shadow-[0_0_8px_rgba(99,102,241,0.5)] z-10" />
                                        <JournalEntry quest={item.data} />
                                    </div>
                                );
                            } else {
                                const diary = item.data;
                                return (
                                    <div key={`p-${diary.id}`} className="relative group">
                                        <div className="absolute -left-[35px] top-4 w-4 h-4 rounded-full bg-surface border-2 border-amber-400 z-10" />
                                        <GlassCard className="p-5 border-amber-400/20 bg-amber-400/5 group-hover:bg-amber-400/10 transition-colors">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Feather className="w-4 h-4 text-amber-500" />
                                                <p className="text-xs font-bold text-amber-500 uppercase tracking-widest">Catatan Harian</p>
                                                <span className="text-xs text-ink-muted ml-auto font-medium">
                                                    {new Date(diary.createdAt).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <p className="text-sm text-ink whitespace-pre-wrap leading-relaxed">
                                                {diary.content}
                                            </p>
                                        </GlassCard>
                                    </div>
                                );
                            }
                        })}
                    </div>
                )}
            </section>

            {j.timeline.length > 0 && (
                <p className="text-center text-ink-muted font-bold text-xs tracking-widest uppercase py-8">— Akhir dari jurnal —</p>
            )}
        </div>
    );
}
