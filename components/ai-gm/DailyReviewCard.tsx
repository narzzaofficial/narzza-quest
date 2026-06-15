'use client';

import { Loader2, CalendarClock, RefreshCw, CheckCircle2, Target } from 'lucide-react';
import { GRAD } from '@/constants/ui';
import type { useAIGameMaster } from '@/hooks/useAIGameMaster';

type AIData = ReturnType<typeof useAIGameMaster>;

export function DailyReviewCard({ ai }: { ai: AIData }) {
    const r = ai.review;
    return (
        <section className="glass rounded-card p-5 md:p-6 shadow-card flex flex-col">
            <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundImage: GRAD.brand }}>
                        <CalendarClock className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <p className="text-brand text-[10px] uppercase tracking-widest font-bold">Daily Review</p>
                        <h2 className="text-ink font-extrabold text-lg">Evaluasi Hari Ini</h2>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => ai.runDailyReview()}
                    disabled={ai.reviewLoading}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-3.5 py-2 text-white text-sm font-bold shadow-card hover:bg-brand-hover transition-colors disabled:opacity-60"
                >
                    {ai.reviewLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    {r ? 'Refresh' : 'Generate'}
                </button>
            </div>

            {ai.reviewError && <p className="text-danger text-sm font-semibold">⚠ {ai.reviewError}</p>}

            {!r && !ai.reviewError && (
                <p className="text-ink-soft text-sm">Belum ada review hari ini. Klik Generate untuk minta evaluasi dari AI Game Master.</p>
            )}

            {r && (
                <div className="space-y-4 mt-1">
                    <p className="text-ink-soft text-sm leading-relaxed">{r.summary}</p>

                    <div className="flex gap-2 text-xs">
                        <span className="bg-success-soft text-success font-bold px-2.5 py-1 rounded-full">{r.questsCompleted} quest</span>
                        <span className="bg-brand-soft text-brand font-bold px-2.5 py-1 rounded-full">+{r.expEarned} EXP</span>
                    </div>

                    {r.wins.length > 0 && (
                        <div>
                            <p className="text-ink-muted text-[10px] uppercase tracking-widest font-bold mb-1.5">Hal Baik</p>
                            <ul className="space-y-1">
                                {r.wins.map((w, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-ink-soft">
                                        <CheckCircle2 className="w-4 h-4 text-success mt-0.5 shrink-0" /> {w}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {r.focus.length > 0 && (
                        <div>
                            <p className="text-ink-muted text-[10px] uppercase tracking-widest font-bold mb-1.5">Fokus Besok</p>
                            <ul className="space-y-1">
                                {r.focus.map((f, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-ink-soft">
                                        <Target className="w-4 h-4 text-brand mt-0.5 shrink-0" /> {f}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {r.encouragement && (
                        <div className="bg-brand-soft border border-brand/15 rounded-xl p-3">
                            <p className="text-ink font-semibold italic text-sm">&ldquo;{r.encouragement}&rdquo;</p>
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}
