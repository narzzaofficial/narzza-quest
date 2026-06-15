'use client';

import { Loader2, Bot, Sparkles, Target, ListChecks, CheckCircle2 } from 'lucide-react';
import { useAIGameMaster } from '@/hooks/useAIGameMaster';
import { useWorkTasks } from '@/hooks/useWorkTasks';
import { useSituation } from '@/hooks/useSituation';
import { AI_GM } from '@/constants/ai';
import { GRAD } from '@/constants/ui';
import PageHeader from '@/components/ui/PageHeader';
import { GoalCard } from '@/components/ai-gm/GoalCard';
import { DailyReviewCard } from '@/components/ai-gm/DailyReviewCard';
import { MemoryCard } from '@/components/ai-gm/MemoryCard';
import { SituationRoom } from '@/components/ai-gm/SituationRoom';
import { WorkTasksSection } from '@/components/ai-gm/WorkTasksSection';
import { QuestRow } from '@/components/ai-gm/QuestRow';

export default function AIGameMasterPage() {
    const ai  = useAIGameMaster();
    const wt  = useWorkTasks(ai.profile?.uid);
    const sit = useSituation(ai.profile?.uid);

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
        { label: 'Quest Aktif',    value: ai.active.length,    icon: ListChecks  },
        { label: 'Diselesaikan',   value: ai.completed.length, icon: CheckCircle2},
        { label: 'Total dari AI',  value: ai.aiQuests.length,  icon: Sparkles    },
    ];

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
            {/* ── Persona header ── */}
            <PageHeader
                icon={<Bot className="w-8 h-8 text-white" />}
                title={AI_GM.name}
                subtitle={AI_GM.tagline}
                badge="Solo Mode"
                grad="brand"
            />

            {/* ── North Star goal ── */}
            <GoalCard />

            {/* ── Situation Room + Work Tasks ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SituationRoom sit={sit} />
                <WorkTasksSection wt={wt} />
            </div>

            {/* ── Generate card ── */}
            <section className="glass rounded-card p-5 md:p-6 shadow-card">
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundImage: GRAD.brand }}>
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
                    <p className="text-ink-muted text-xs">AI nyesuaiin difficulty &amp; memakai memory kamu.</p>
                    <button
                        type="button"
                        onClick={() => ai.generate()}
                        disabled={ai.generating}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 text-white font-bold shadow-card hover:bg-brand-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
                    >
                        {ai.generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        {ai.generating ? 'Membuat…' : 'Generate Quest'}
                    </button>
                </div>

                {(ai.createdCount > 0 || ai.error) && (
                    <div className="mt-4 pt-4 border-t border-line text-sm">
                        {ai.error
                            ? <p className="text-danger font-semibold">⚠ {ai.error}</p>
                            : <p className="text-success font-semibold">✓ {ai.createdCount} quest baru ditambahkan ke daftar di bawah.</p>
                        }
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
                        <p className="text-ink-soft text-sm">Klik &ldquo;Generate Quest&rdquo; di atas untuk minta AI menyusun misi pertamamu.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {ai.aiQuests.map((q) => <QuestRow key={q.id} quest={q} />)}
                    </div>
                )}
            </section>
        </div>
    );
}
