'use client';

import { useState } from 'react';
import { CheckCircle2, Circle, Clock, Sparkles, Swords } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import type { StoryArc } from '@/types';

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

interface Props {
    arc: StoryArc;
    defaultOpen: boolean;
}

export function ArcHistoryCard({ arc, defaultOpen }: Props) {
    const [open, setOpen] = useState(defaultOpen);
    const isActive = arc.status === 'active';

    const daysRemaining = isActive
        ? Math.max(0, Math.ceil((new Date(arc.endDate).getTime() - Date.now()) / 86_400_000))
        : 0;
    const progressPct = isActive ? Math.min(100, ((14 - daysRemaining) / 14) * 100) : 100;

    return (
        <GlassCard className={isActive ? 'ring-2 ring-brand/25' : ''}>
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-surface-2/40 transition-colors rounded-card"
            >
                <div
                    className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-sm shadow-sm ${
                        isActive ? 'text-white' : 'bg-surface-2 text-ink-muted border border-line'
                    }`}
                    style={isActive ? { background: 'linear-gradient(135deg, #4f7cff 0%, #38bdf8 100%)' } : undefined}
                >
                    {arc.arcNumber}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-ink font-extrabold text-base leading-tight truncate">{arc.title}</h2>
                        {isActive ? (
                            <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand/10 text-brand border border-brand/20">Aktif</span>
                        ) : (
                            <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-success-soft text-success border border-success/20 flex items-center gap-1">
                                <CheckCircle2 className="w-2.5 h-2.5" /> Selesai
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-ink-muted text-xs">
                        <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(arc.startDate)} — {formatDate(arc.endDate)}
                        </span>
                        <span className="flex items-center gap-1">
                            <Swords className="w-3 h-3" />
                            {arc.questsCompleted} quest
                        </span>
                    </div>
                </div>

                <span className={`text-ink-muted transition-transform duration-200 shrink-0 ${open ? 'rotate-180' : ''}`}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                        <path d="M6 8L1 3h10L6 8z" />
                    </svg>
                </span>
            </button>

            {open && (
                <div className="px-5 pb-5 space-y-4 border-t border-line">
                    <div className="pt-4">
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-brand bg-brand-soft px-3 py-1 rounded-full">
                            <Sparkles className="w-3 h-3" /> {arc.theme}
                        </span>
                    </div>

                    <div className="bg-brand-soft rounded-xl px-4 py-3 flex gap-2.5">
                        <Sparkles className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                        <p className="text-ink-soft text-sm italic leading-relaxed">&ldquo;{arc.narrative}&rdquo;</p>
                    </div>

                    <div>
                        <p className="text-ink-muted text-[10px] font-bold uppercase tracking-widest mb-2">Target Arc</p>
                        <ul className="space-y-2">
                            {arc.weeklyGoals.map((goal, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-ink-soft">
                                    {isActive
                                        ? <Circle className="w-4 h-4 text-brand/40 mt-0.5 shrink-0" />
                                        : <CheckCircle2 className="w-4 h-4 text-success/60 mt-0.5 shrink-0" />
                                    }
                                    <span>{goal}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {isActive && (
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-ink-muted text-[10px] font-bold uppercase tracking-widest">Waktu Berjalan</span>
                                <span className="text-ink-soft text-[10px] font-extrabold">
                                    {daysRemaining > 0 ? `${daysRemaining} hari tersisa` : 'Berakhir hari ini'}
                                </span>
                            </div>
                            <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden border border-line">
                                <div
                                    className="h-full rounded-full transition-all duration-700"
                                    style={{ width: `${progressPct}%`, background: 'linear-gradient(90deg, #4f7cff 0%, #38bdf8 100%)' }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}
        </GlassCard>
    );
}
