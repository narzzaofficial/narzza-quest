'use client';

import { Loader2, Bot, Sparkles, Target, ListChecks, CheckCircle2 } from 'lucide-react';
import { useAIGameMaster } from '@/hooks/useAIGameMaster';
import { AI_GM } from '@/constants/ai';
import { GRAD } from '@/constants/ui';
import PageHeader from '@/components/ui/PageHeader';
import { GoalCard } from '@/components/ai-gm/GoalCard';
import { DailyReviewCard } from '@/components/ai-gm/DailyReviewCard';
import { MemoryCard } from '@/components/ai-gm/MemoryCard';
import { QuestRow } from '@/components/ai-gm/QuestRow';
import OnboardingTour from '@/components/system/OnboardingTour';
import { useOnboardingTour } from '@/hooks/useOnboardingTour';
import { AI_GM_TOUR_STEPS } from '@/constants/onboardingTours';
import { DUMMY_AI_QUESTS } from '@/constants/onboardingPreviewData';
import Badge from '@/components/ui/Badge';

export default function AIGameMasterPage() {
    const ai = useAIGameMaster();
    const { profile, active, completed, aiQuests, goals, setGoals, generate, generating, createdCount, error } = ai;
    const { run: isOnboarding } = useOnboardingTour('ai-gm', AI_GM_TOUR_STEPS);
    const showDummyQuests = isOnboarding && aiQuests.length === 0;

    if (!profile) {
        return (
            <div className="p-4 md:p-8 max-w-6xl mx-auto">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Loader2 className="w-8 h-8 text-brand animate-spin" />
                </div>
            </div>
        );
    }

    const stats = [
        { label: 'Quest Aktif',    value: active.length,    icon: ListChecks  },
        { label: 'Diselesaikan',   value: completed.length, icon: CheckCircle2},
        { label: 'Total dari AI',  value: aiQuests.length,  icon: Sparkles    },
    ];

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
            <OnboardingTour tourKey="ai-gm" steps={AI_GM_TOUR_STEPS} />

            {/* ── Persona header ── */}
            <div data-tour="ai-gm-header">
                <PageHeader
                    icon={<Bot className="w-8 h-8 text-white" />}
                    title={AI_GM.name}
                    subtitle={AI_GM.tagline}
                    badge="Solo Mode"
                    grad="brand"
                />
            </div>

            {/* ── North Star goal ── */}
            <div data-tour="ai-gm-goal">
                <GoalCard />
            </div>

            {/* ── Generate card ── */}
            <section data-tour="ai-gm-generate" className="glass rounded-card p-5 md:p-6 shadow-card">
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
                    value={goals}
                    onChange={(e) => setGoals(e.target.value)}
                    rows={2}
                    placeholder="cth: belajar bahasa Jepang, rutin olahraga pagi, bangun side project…"
                    className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-ink-muted outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/15 transition resize-none"
                />

                <div className="flex items-center justify-between gap-3 mt-3">
                    <p className="text-ink-muted text-xs">AI nyesuaiin difficulty &amp; memakai memory kamu.</p>
                    <button
                        type="button"
                        onClick={() => generate()}
                        disabled={generating}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 text-white font-bold shadow-card hover:bg-brand-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
                    >
                        {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        {generating ? 'Membuat…' : 'Generate Quest'}
                    </button>
                </div>

                {(createdCount > 0 || error) && (
                    <div className="mt-4 pt-4 border-t border-line text-sm">
                        {error
                            ? <p className="text-danger font-semibold">⚠ {error}</p>
                            : <p className="text-success font-semibold">✓ {createdCount} quest baru ditambahkan ke daftar di bawah.</p>
                        }
                    </div>
                )}
            </section>

            {/* ── Daily Review + Memory ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div data-tour="ai-gm-daily-review">
                    <DailyReviewCard ai={ai} />
                </div>
                <div data-tour="ai-gm-memory">
                    <MemoryCard ai={ai} />
                </div>
            </div>

            {/* ── Stats ── */}
            <section data-tour="ai-gm-stats" className="grid grid-cols-3 gap-4">
                {stats.map((s) => (
                    <div key={s.label} className="glass rounded-card p-4 shadow-card">
                        <s.icon className="w-5 h-5 text-brand mb-2" />
                        <p className="text-2xl font-extrabold text-ink">{s.value}</p>
                        <p className="text-ink-muted text-[10px] uppercase tracking-widest font-bold mt-0.5">{s.label}</p>
                    </div>
                ))}
            </section>

            {/* ── AI quest list ── */}
            <section data-tour="ai-gm-quest-list" className="relative">
                <div className="flex items-center gap-2 mb-3">
                    <p className="text-ink-muted text-[10px] uppercase tracking-widest font-bold">Misi dari AI</p>
                    {showDummyQuests && <Badge variant="B">Contoh</Badge>}
                </div>
                {showDummyQuests ? (
                    <div className="space-y-3">
                        {DUMMY_AI_QUESTS.map((q) => <QuestRow key={q.id} quest={q} />)}
                    </div>
                ) : aiQuests.length === 0 ? (
                    <div className="glass rounded-card p-10 text-center shadow-card">
                        <Bot className="w-9 h-9 text-ink-muted mx-auto mb-3" />
                        <p className="text-ink font-bold mb-1">Belum ada misi dari AI</p>
                        <p className="text-ink-soft text-sm">Klik &ldquo;Generate Quest&rdquo; di atas untuk minta AI menyusun misi pertamamu.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {aiQuests.map((q) => <QuestRow key={q.id} quest={q} />)}
                    </div>
                )}
            </section>
        </div>
    );
}
