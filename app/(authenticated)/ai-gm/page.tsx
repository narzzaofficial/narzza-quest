'use client';

import React from 'react';
import Link from 'next/link';
import {
    Bot,
    Sparkles,
    Loader2,
    Target,
    ListChecks,
    CheckCircle2,
    BrainCircuit,
    CalendarClock,
    ChevronRight,
    RefreshCw,
    Lightbulb,
} from 'lucide-react';
import { useAIGameMaster } from '@/hooks/useAIGameMaster';
import { AI_GM } from '@/constants/ai';
import { DIFFICULTY_COLOR, QUEST_STATUS_META, CATEGORY_LABEL } from '@/constants/ui';
import type { Quest } from '@/types';

const GRAD_BRAND = 'linear-gradient(135deg, #4f7cff 0%, #38bdf8 100%)';

export default function AIGameMasterPage() {
    const ai = useAIGameMaster();

    if (!ai.profile) {
        return (
            <div className="p-4 md:p-8 max-w-6xl mx-auto">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Loader2 className="w-8 h-8 text-brand animate-spin" />
                </div>
            </div>
        );
    }

    const stats = [
        { label: 'Quest Aktif', value: ai.active.length, icon: ListChecks },
        { label: 'Diselesaikan', value: ai.completed.length, icon: CheckCircle2 },
        { label: 'Total dari AI', value: ai.aiQuests.length, icon: Sparkles },
    ];

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
            {/* ── Persona header ── */}
            <header className="relative overflow-hidden rounded-card p-6 md:p-7 text-white shadow-card" style={{ backgroundImage: GRAD_BRAND }}>
                <div className="absolute -top-16 -right-10 w-56 h-56 rounded-full bg-white/15 blur-2xl pointer-events-none" />
                <div className="relative flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-white/20 ring-1 ring-white/30 flex items-center justify-center shrink-0">
                        <Bot className="w-9 h-9 text-white" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl md:text-3xl font-extrabold text-white">{AI_GM.name}</h1>
                            <span className="text-[10px] font-extrabold uppercase tracking-widest bg-white/20 ring-1 ring-white/30 px-2 py-0.5 rounded-full">Solo Mode</span>
                        </div>
                        <p className="text-white/80 text-sm mt-0.5">{AI_GM.tagline}</p>
                    </div>
                </div>
            </header>

            {/* ── Generate card ── */}
            <section className="glass rounded-card p-5 md:p-6 shadow-card">
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundImage: GRAD_BRAND }}>
                        <Target className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <p className="text-brand text-[10px] uppercase tracking-widest font-bold">Rencana Hari Ini</p>
                        <h2 className="text-ink font-extrabold text-lg">Generate misi baru</h2>
                    </div>
                </div>

                <label className="block text-ink-soft text-xs font-semibold mb-1.5">Fokus / target kamu sekarang (opsional)</label>
                <textarea
                    value={ai.goals}
                    onChange={(e) => ai.setGoals(e.target.value)}
                    rows={2}
                    placeholder="cth: belajar bahasa Jepang, rutin olahraga pagi, bangun side project…"
                    className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-ink-muted outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/15 transition resize-none"
                />

                <div className="flex items-center justify-between gap-3 mt-3">
                    <p className="text-ink-muted text-xs">AI nyesuaiin difficulty & memakai memory kamu.</p>
                    <button
                        type="button"
                        onClick={() => ai.generate(ai.goals || undefined)}
                        disabled={ai.generating}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 text-white font-bold shadow-card hover:bg-brand-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
                    >
                        {ai.generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        {ai.generating ? 'Membuat…' : 'Generate Quest'}
                    </button>
                </div>

                {(ai.createdCount > 0 || ai.error) && (
                    <div className="mt-4 pt-4 border-t border-line text-sm">
                        {ai.error ? (
                            <p className="text-danger font-semibold">⚠ {ai.error}</p>
                        ) : (
                            <p className="text-success font-semibold">✓ {ai.createdCount} quest baru ditambahkan ke daftar di bawah.</p>
                        )}
                    </div>
                )}
            </section>

            {/* ── Daily Review + Memory ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DailyReviewCard ai={ai} />
                <MemoryCard ai={ai} />
            </div>

            {/* ── Stats ── */}
            <section className="grid grid-cols-3 gap-4">
                {stats.map((s) => (
                    <div key={s.label} className="glass rounded-card p-4 shadow-card">
                        <s.icon className="w-5 h-5 text-brand mb-2" />
                        <p className="text-2xl font-extrabold text-ink">{s.value}</p>
                        <p className="text-ink-muted text-[10px] uppercase tracking-widest font-bold mt-0.5">{s.label}</p>
                    </div>
                ))}
            </section>

            {/* ── AI quest list ── */}
            <section>
                <p className="text-ink-muted text-[10px] uppercase tracking-widest font-bold mb-3">Misi dari AI</p>
                {ai.aiQuests.length === 0 ? (
                    <div className="glass rounded-card p-10 text-center shadow-card">
                        <Bot className="w-9 h-9 text-ink-muted mx-auto mb-3" />
                        <p className="text-ink font-bold mb-1">Belum ada misi dari AI</p>
                        <p className="text-ink-soft text-sm">Klik “Generate Quest” di atas untuk minta AI menyusun misi pertamamu.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {ai.aiQuests.map((q) => (
                            <QuestRow key={q.id} quest={q} />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

type AIData = ReturnType<typeof useAIGameMaster>;

function DailyReviewCard({ ai }: { ai: AIData }) {
    const r = ai.review;
    return (
        <section className="glass rounded-card p-5 md:p-6 shadow-card flex flex-col">
            <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundImage: GRAD_BRAND }}>
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
                            <p className="text-ink font-semibold italic text-sm">“{r.encouragement}”</p>
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}

function MemoryCard({ ai }: { ai: AIData }) {
    const m = ai.memory;
    return (
        <section className="glass rounded-card p-5 md:p-6 shadow-card flex flex-col">
            <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundImage: GRAD_BRAND }}>
                        <BrainCircuit className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <p className="text-brand text-[10px] uppercase tracking-widest font-bold">AI Memory</p>
                        <h2 className="text-ink font-extrabold text-lg">Yang AI ingat</h2>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => ai.refreshMemory()}
                    disabled={ai.memoryLoading}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-3.5 py-2 text-white text-sm font-bold shadow-card hover:bg-brand-hover transition-colors disabled:opacity-60"
                >
                    {ai.memoryLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    {m ? 'Refresh' : 'Bangun'}
                </button>
            </div>

            {ai.memoryError && <p className="text-danger text-sm font-semibold">⚠ {ai.memoryError}</p>}

            {!m && !ai.memoryError && (
                <p className="text-ink-soft text-sm">AI belum mengenal kamu. Klik “Bangun” supaya AI mulai mengingat pola & progresmu.</p>
            )}

            {m && (
                <div className="space-y-4 mt-1">
                    <p className="text-ink-soft text-sm leading-relaxed">{m.summary}</p>

                    {m.insights.length > 0 && (
                        <ul className="space-y-1.5">
                            {m.insights.map((ins, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-ink-soft">
                                    <Lightbulb className="w-4 h-4 text-xp mt-0.5 shrink-0" /> {ins}
                                </li>
                            ))}
                        </ul>
                    )}

                    <p className="text-ink-muted text-[10px] uppercase tracking-widest font-bold">
                        Update: {new Date(m.updatedAt).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
            )}
        </section>
    );
}

function QuestRow({ quest }: { quest: Quest }) {
    const status = QUEST_STATUS_META[quest.status] ?? QUEST_STATUS_META.pending;
    return (
        <Link
            href="/quest-board"
            className="group glass rounded-card p-4 shadow-card hover:shadow-pop transition-all flex items-center gap-4"
        >
            <div
                className="w-11 h-11 rounded-xl flex items-center justify-center font-extrabold text-white shrink-0 shadow-sm"
                style={{ backgroundColor: DIFFICULTY_COLOR[quest.difficulty] }}
            >
                {quest.difficulty}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-ink font-bold truncate">{quest.title}</p>
                <p className="text-ink-muted text-xs truncate">{CATEGORY_LABEL[quest.category]} · +{quest.expReward} EXP</p>
            </div>
            <span className={`${status.soft} text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full`} style={{ color: status.color }}>
                {status.label}
            </span>
            <ChevronRight className="w-4 h-4 text-ink-muted group-hover:text-brand transition-colors" />
        </Link>
    );
}
