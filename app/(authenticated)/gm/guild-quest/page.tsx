'use client';

import React from 'react';
import Link from 'next/link';
import { useGMGuildQuests } from '@/hooks/useGMGuildQuests';
import PageHeader from '@/components/ui/PageHeader';
import GlassCard from '@/components/ui/GlassCard';
import EmptyState from '@/components/ui/EmptyState';
import DifficultyBadge from '@/components/ui/DifficultyBadge';
import { Swords, Plus, Users, CheckCircle2, Loader2 } from 'lucide-react';

export default function GMGuildQuestPage() {
    const { quests, loading } = useGMGuildQuests();

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-brand animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
            <PageHeader
                grad="sky"
                icon={<Swords className="w-6 h-6 text-white" />}
                title="Guild Quest Board"
                subtitle="Quest terbuka yang bisa diambil hero-mu."
                badge="GM Panel"
                actions={
                    <Link href="/gm/guild-quest/new" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white text-brand px-4 py-2.5 font-bold text-sm shadow-card hover:bg-white/90 transition">
                        <Plus className="w-4 h-4" /> Buka Quest Baru
                    </Link>
                }
            />

            {quests.length === 0 ? (
                <EmptyState
                    icon={Swords}
                    title="Belum ada Guild Quest"
                    desc="Buka quest yang bisa diambil semua hero-mu sekaligus."
                    action={<Link href="/gm/guild-quest/new" className="inline-flex items-center gap-2 rounded-xl bg-brand text-white px-5 py-2.5 font-bold text-sm hover:bg-brand-hover transition"><Plus className="w-4 h-4" /> Buat Sekarang</Link>}
                />
            ) : (
                <div className="space-y-4">
                    {quests.map((gq) => {
                        const claimedCount = gq.claimedBy.length;
                        const isFull = gq.status === 'closed';
                        const quotaPercent = Math.round((claimedCount / gq.maxClaims) * 100);
                        return (
                            <GlassCard key={gq.id} className="p-5">
                                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                            <DifficultyBadge difficulty={gq.difficulty} />
                                            <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${isFull ? 'text-success bg-success-soft' : 'text-brand bg-brand-soft'}`}>
                                                {isFull ? <><CheckCircle2 className="w-3 h-3" /> Kuota Penuh</> : <><Users className="w-3 h-3" /> Terbuka</>}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-extrabold text-ink leading-tight">{gq.title}</h3>
                                        <p className="text-ink-soft text-sm mt-1 line-clamp-2">{gq.description}</p>
                                    </div>
                                    <div className="shrink-0 text-right">
                                        <p className="text-ink-muted text-xs font-bold uppercase tracking-wide mb-1">Slot Terisi</p>
                                        <p className="text-2xl font-black text-ink">{claimedCount}<span className="text-sm text-ink-muted">/{gq.maxClaims}</span></p>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full transition-all duration-500 ${isFull ? 'bg-success' : 'bg-brand'}`} style={{ width: `${quotaPercent}%` }} />
                                    </div>
                                    <div className="flex justify-between text-[10px] font-bold text-ink-muted mt-1">
                                        <span>Deadline: {new Date(gq.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                        <span className="text-brand">+{gq.expReward} EXP</span>
                                    </div>
                                </div>
                            </GlassCard>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
