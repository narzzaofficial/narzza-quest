'use client';

import { Calendar, MessageSquare, Award, Feather, Wallet, Sparkles } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import DifficultyBadge from '@/components/ui/DifficultyBadge';
import { CATEGORY_LABEL } from '@/constants/ui';
import type { Quest } from '@/types';

export function JournalEntry({ quest }: { quest: Quest }) {
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
                    <p className="text-ink-soft font-medium text-sm leading-relaxed whitespace-pre-line">
                        {quest.submissionNote || 'Tidak ada catatan.'}
                    </p>
                </div>

                <div className="bg-brand-soft border border-brand/15 px-4 py-3.5 rounded-xl">
                    <div className="flex items-center gap-1.5 mb-2 text-brand">
                        {quest.createdBy === 'ai-gm' ? <Sparkles className="w-3.5 h-3.5" /> : <MessageSquare className="w-3.5 h-3.5" />}
                        <p className="text-[10px] font-bold uppercase tracking-wider">
                            {quest.createdBy === 'ai-gm' ? 'Catatan AI' : 'Review GM'}
                        </p>
                    </div>
                    <p className="text-ink font-medium text-sm leading-relaxed whitespace-pre-line">
                        {quest.reviewNote || 'Kerja bagus!'}
                    </p>
                </div>
            </div>
        </GlassCard>
    );
}

