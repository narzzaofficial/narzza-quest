'use client';

import React, { useState } from 'react';
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
    Pencil,
    Briefcase,
    AlertCircle,
    Clock,
    CheckCheck,
    Ban,
    Trash2,
    Plus,
    MapPin,
    Save,
    Activity,
} from 'lucide-react';
import { useAIGameMaster } from '@/hooks/useAIGameMaster';
import { useGoal } from '@/hooks/useGoal';
import { useWorkTasks } from '@/hooks/useWorkTasks';
import { useSituation } from '@/hooks/useSituation';
import { AI_GM } from '@/constants/ai';
import { DIFFICULTY_COLOR, QUEST_STATUS_META, CATEGORY_LABEL } from '@/constants/ui';
import GoalForm from '@/components/ui/GoalForm';
import type { Quest, WorkTask, WorkTaskPriority, WorkTaskStatus, UserStatusType, WorkloadLevel } from '@/types';

const GRAD_BRAND = 'linear-gradient(135deg, #4f7cff 0%, #38bdf8 100%)';

export default function AIGameMasterPage() {
    const ai = useAIGameMaster();
    const wt = useWorkTasks(ai.profile?.uid);
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

function GoalCard() {
    const { goal, hasGoal, saving, save } = useGoal();
    const [editing, setEditing] = useState(false);

    if (editing || !hasGoal) {
        return (
            <section className="glass rounded-card p-5 md:p-6 shadow-card">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundImage: GRAD_BRAND }}>
                        <Target className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <p className="text-brand text-[10px] uppercase tracking-widest font-bold">North Star</p>
                        <h2 className="text-ink font-extrabold text-lg">{hasGoal ? 'Ubah Tujuan' : 'Tetapkan Tujuan'}</h2>
                    </div>
                </div>
                <GoalForm
                    initial={goal}
                    saving={saving}
                    submitLabel="Simpan Tujuan"
                    onSave={async (d) => { await save(d); setEditing(false); }}
                    onCancel={hasGoal ? () => setEditing(false) : undefined}
                />
            </section>
        );
    }

    return (
        <section className="glass rounded-card p-5 md:p-6 shadow-card">
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundImage: GRAD_BRAND }}>
                        <Target className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <p className="text-brand text-[10px] uppercase tracking-widest font-bold">North Star</p>
                        <h2 className="text-ink font-extrabold text-lg">Tujuanku</h2>
                    </div>
                </div>
                <button onClick={() => setEditing(true)} className="inline-flex items-center gap-1.5 rounded-xl border border-line px-3 py-2 text-sm font-bold text-ink-soft hover:text-brand hover:bg-brand-soft transition">
                    <Pencil className="w-3.5 h-3.5" /> Ubah
                </button>
            </div>
            <p className="text-ink-soft text-sm mt-3 leading-relaxed">{goal!.aspiration}</p>
            {goal!.focusAreas.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                    {goal!.focusAreas.map((a) => (
                        <span key={a} className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-brand-soft text-brand">{a}</span>
                    ))}
                </div>
            )}
            {goal!.timeframe && <p className="text-ink-muted text-xs font-bold mt-3">🎯 Target: {goal!.timeframe}</p>}
        </section>
    );
}

// ── Types for sub-component props ─────────────────────────────
type SitData = ReturnType<typeof useSituation>;
type WtData  = ReturnType<typeof useWorkTasks>;

const STATUS_LABELS: Record<UserStatusType, string> = {
    busy: 'Sibuk', normal: 'Normal', relaxed: 'Santai', on_leave: 'Cuti', sick: 'Sakit',
};
const STATUS_COLORS: Record<UserStatusType, string> = {
    busy: 'text-danger bg-danger-soft', normal: 'text-brand bg-brand-soft',
    relaxed: 'text-success bg-success-soft', on_leave: 'text-xp bg-xp-soft', sick: 'text-warn bg-warn-soft',
};
const WORKLOAD_LABELS: Record<WorkloadLevel, string> = { high: 'Tinggi', medium: 'Sedang', low: 'Ringan' };
const PRIORITY_META: Record<WorkTaskPriority, { label: string; color: string; bg: string }> = {
    low:    { label: 'Rendah', color: 'text-ink-muted',  bg: 'bg-surface-2'   },
    medium: { label: 'Sedang', color: 'text-brand',      bg: 'bg-brand-soft'  },
    high:   { label: 'Tinggi', color: 'text-warn',       bg: 'bg-warn-soft'   },
    urgent: { label: 'Urgent', color: 'text-danger',     bg: 'bg-danger-soft' },
};
const TASK_STATUS_ICON: Record<WorkTaskStatus, React.ReactNode> = {
    todo:        <Clock       className="w-3.5 h-3.5" />,
    in_progress: <Activity    className="w-3.5 h-3.5" />,
    done:        <CheckCheck  className="w-3.5 h-3.5" />,
    blocked:     <Ban         className="w-3.5 h-3.5" />,
};

// ── Situation Room ─────────────────────────────────────────────
function SituationRoom({ sit }: { sit: SitData }) {
    const s = sit.situation;
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState<{
        currentStatus: UserStatusType; weekFocus: string;
        workload: WorkloadLevel; activeProjects: string; contextNote: string;
    }>({ currentStatus: 'normal', weekFocus: '', workload: 'medium', activeProjects: '', contextNote: '' });

    const openEdit = () => {
        setForm({
            currentStatus: s?.currentStatus ?? 'normal',
            weekFocus: s?.weekFocus ?? '',
            workload: s?.workload ?? 'medium',
            activeProjects: (s?.activeProjects ?? []).join(', '),
            contextNote: s?.contextNote ?? '',
        });
        setEditing(true);
    };

    const handleSave = async () => {
        await sit.save({
            currentStatus: form.currentStatus,
            weekFocus: form.weekFocus,
            workload: form.workload,
            activeProjects: form.activeProjects.split(',').map(p => p.trim()).filter(Boolean),
            contextNote: form.contextNote,
        });
        setEditing(false);
    };

    return (
        <section className="glass rounded-card shadow-card">
            <div className="p-5 space-y-4">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-brand-soft flex items-center justify-center shrink-0">
                            <MapPin className="w-4 h-4 text-brand" />
                        </div>
                        <div>
                            <p className="text-brand text-[10px] uppercase tracking-widest font-bold">Situasiku</p>
                            <h2 className="text-ink font-extrabold text-base">Kondisi Sekarang</h2>
                        </div>
                    </div>
                    {!editing && (
                        <button onClick={openEdit} className="p-2 rounded-xl border border-line text-ink-muted hover:text-brand hover:bg-brand-soft transition">
                            <Pencil className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>

                {editing ? (
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-ink-muted text-[10px] font-bold uppercase tracking-widest block mb-1">Status</label>
                                <select
                                    value={form.currentStatus}
                                    onChange={e => setForm(f => ({ ...f, currentStatus: e.target.value as UserStatusType }))}
                                    className="w-full px-3 py-2 rounded-xl border border-line bg-surface text-sm text-ink focus:outline-none focus:border-brand transition"
                                >
                                    {(Object.keys(STATUS_LABELS) as UserStatusType[]).map(k => (
                                        <option key={k} value={k}>{STATUS_LABELS[k]}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-ink-muted text-[10px] font-bold uppercase tracking-widest block mb-1">Workload</label>
                                <select
                                    value={form.workload}
                                    onChange={e => setForm(f => ({ ...f, workload: e.target.value as WorkloadLevel }))}
                                    className="w-full px-3 py-2 rounded-xl border border-line bg-surface text-sm text-ink focus:outline-none focus:border-brand transition"
                                >
                                    {(Object.keys(WORKLOAD_LABELS) as WorkloadLevel[]).map(k => (
                                        <option key={k} value={k}>{WORKLOAD_LABELS[k]}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="text-ink-muted text-[10px] font-bold uppercase tracking-widest block mb-1">Fokus minggu ini</label>
                            <input
                                value={form.weekFocus}
                                onChange={e => setForm(f => ({ ...f, weekFocus: e.target.value }))}
                                placeholder="cth: Deadline presentasi klien"
                                className="w-full px-3 py-2 rounded-xl border border-line bg-surface text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:border-brand transition"
                            />
                        </div>
                        <div>
                            <label className="text-ink-muted text-[10px] font-bold uppercase tracking-widest block mb-1">Proyek aktif (pisah koma)</label>
                            <input
                                value={form.activeProjects}
                                onChange={e => setForm(f => ({ ...f, activeProjects: e.target.value }))}
                                placeholder="cth: Project Alpha, LifeGame"
                                className="w-full px-3 py-2 rounded-xl border border-line bg-surface text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:border-brand transition"
                            />
                        </div>
                        <div>
                            <label className="text-ink-muted text-[10px] font-bold uppercase tracking-widest block mb-1">Catatan ke AI</label>
                            <textarea
                                value={form.contextNote}
                                onChange={e => setForm(f => ({ ...f, contextNote: e.target.value }))}
                                placeholder="cth: Lagi kurang tidur, tolong kurangi quest berat minggu ini"
                                rows={2}
                                className="w-full px-3 py-2 rounded-xl border border-line bg-surface text-sm text-ink placeholder:text-ink-muted resize-none focus:outline-none focus:border-brand transition"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setEditing(false)} className="flex-1 py-2 rounded-xl border border-line text-ink-soft text-sm font-bold hover:bg-surface-2 transition">Batal</button>
                            <button onClick={handleSave} disabled={sit.saving} className="flex-1 py-2 rounded-xl bg-brand text-white text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-1.5 transition">
                                {sit.saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                                Simpan
                            </button>
                        </div>
                    </div>
                ) : s && (s.weekFocus || s.currentStatus !== 'normal') ? (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full ${STATUS_COLORS[s.currentStatus]}`}>
                                {STATUS_LABELS[s.currentStatus]}
                            </span>
                            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-surface-2 text-ink-soft">
                                Workload: {WORKLOAD_LABELS[s.workload]}
                            </span>
                        </div>
                        {s.weekFocus && (
                            <div className="bg-brand-soft rounded-xl px-3 py-2.5">
                                <p className="text-[10px] font-bold text-brand uppercase tracking-widest mb-0.5">Fokus Minggu Ini</p>
                                <p className="text-ink-soft text-sm font-semibold">{s.weekFocus}</p>
                            </div>
                        )}
                        {s.activeProjects.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                                {s.activeProjects.map(p => (
                                    <span key={p} className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-surface-2 text-ink-soft border border-line">{p}</span>
                                ))}
                            </div>
                        )}
                        {s.contextNote && (
                            <p className="text-ink-muted text-xs italic">&ldquo;{s.contextNote}&rdquo;</p>
                        )}
                    </div>
                ) : (
                    <button onClick={openEdit} className="w-full py-4 text-center text-ink-muted text-sm hover:text-brand transition">
                        + Ceritakan situasimu ke AI
                    </button>
                )}
            </div>
        </section>
    );
}

// ── Work Tasks Section ────────────────────────────────────────
function WorkTasksSection({ wt }: { wt: WtData }) {
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState<{
        title: string; project: string; assignedBy: string;
        priority: WorkTaskPriority; deadline: string;
        estimatedHours: string; description: string; blocker: string;
    }>({ title: '', project: '', assignedBy: '', priority: 'medium', deadline: '', estimatedHours: '', description: '', blocker: '' });

    const handleAdd = async () => {
        if (!form.title.trim()) return;
        await wt.add({
            title: form.title.trim(),
            project: form.project.trim() || undefined,
            assignedBy: form.assignedBy.trim() || undefined,
            priority: form.priority,
            status: 'todo',
            deadline: form.deadline || undefined,
            estimatedHours: form.estimatedHours ? Number(form.estimatedHours) : undefined,
            description: form.description.trim() || undefined,
            blocker: undefined,
        });
        setForm({ title: '', project: '', assignedBy: '', priority: 'medium', deadline: '', estimatedHours: '', description: '', blocker: '' });
        setShowForm(false);
    };

    const active = [...wt.inProgress, ...wt.todo, ...wt.blocked];
    const done   = wt.done.slice(0, 3);

    return (
        <section className="glass rounded-card shadow-card">
            <div className="p-5 space-y-4">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-xp-soft flex items-center justify-center shrink-0">
                            <Briefcase className="w-4 h-4 text-xp" />
                        </div>
                        <div>
                            <p className="text-xp text-[10px] uppercase tracking-widest font-bold">Task Kantor</p>
                            <h2 className="text-ink font-extrabold text-base">Work Tasks</h2>
                        </div>
                    </div>
                    <button onClick={() => setShowForm(!showForm)} className="p-2 rounded-xl border border-line text-ink-muted hover:text-brand hover:bg-brand-soft transition">
                        <Plus className="w-4 h-4" />
                    </button>
                </div>

                {showForm && (
                    <div className="bg-surface-2 rounded-xl p-4 space-y-3 border border-line">
                        <input
                            autoFocus
                            value={form.title}
                            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                            placeholder="Judul task *"
                            className="w-full px-3 py-2 rounded-xl border border-line bg-surface text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:border-brand transition"
                        />
                        <div className="grid grid-cols-2 gap-2">
                            <input
                                value={form.project}
                                onChange={e => setForm(f => ({ ...f, project: e.target.value }))}
                                placeholder="Nama proyek"
                                className="px-3 py-2 rounded-xl border border-line bg-surface text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:border-brand transition"
                            />
                            <input
                                value={form.assignedBy}
                                onChange={e => setForm(f => ({ ...f, assignedBy: e.target.value }))}
                                placeholder="Dari siapa"
                                className="px-3 py-2 rounded-xl border border-line bg-surface text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:border-brand transition"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <select
                                value={form.priority}
                                onChange={e => setForm(f => ({ ...f, priority: e.target.value as WorkTaskPriority }))}
                                className="px-3 py-2 rounded-xl border border-line bg-surface text-sm text-ink focus:outline-none focus:border-brand transition"
                            >
                                {(Object.keys(PRIORITY_META) as WorkTaskPriority[]).map(k => (
                                    <option key={k} value={k}>{PRIORITY_META[k].label}</option>
                                ))}
                            </select>
                            <input
                                type="date"
                                value={form.deadline}
                                onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
                                className="px-3 py-2 rounded-xl border border-line bg-surface text-sm text-ink focus:outline-none focus:border-brand transition"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <input
                                type="number"
                                value={form.estimatedHours}
                                onChange={e => setForm(f => ({ ...f, estimatedHours: e.target.value }))}
                                placeholder="Est. jam"
                                min={0}
                                className="px-3 py-2 rounded-xl border border-line bg-surface text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:border-brand transition"
                            />
                            <input
                                value={form.description}
                                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                placeholder="Deskripsi singkat"
                                className="px-3 py-2 rounded-xl border border-line bg-surface text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:border-brand transition"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setShowForm(false)} className="flex-1 py-2 rounded-xl border border-line text-sm font-bold text-ink-soft hover:bg-surface transition">Batal</button>
                            <button onClick={handleAdd} disabled={!form.title.trim() || wt.saving} className="flex-1 py-2 rounded-xl bg-brand text-white text-sm font-bold disabled:opacity-40 transition">
                                + Tambah
                            </button>
                        </div>
                    </div>
                )}

                {wt.loading ? (
                    <div className="flex items-center gap-2 text-ink-muted text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Memuat...</div>
                ) : active.length === 0 && done.length === 0 ? (
                    <p className="text-ink-muted text-sm py-2">Belum ada task kantor. Klik + untuk tambah.</p>
                ) : (
                    <div className="space-y-2">
                        {active.map(t => <WorkTaskRow key={t.id} task={t} onStatusChange={wt.setStatus} onDelete={wt.remove} />)}
                        {done.length > 0 && (
                            <>
                                <p className="text-ink-muted text-[10px] font-bold uppercase tracking-widest pt-1">Selesai</p>
                                {done.map(t => <WorkTaskRow key={t.id} task={t} onStatusChange={wt.setStatus} onDelete={wt.remove} />)}
                            </>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}

function WorkTaskRow({ task, onStatusChange, onDelete }: {
    task: WorkTask;
    onStatusChange: (id: string, s: WorkTaskStatus) => void;
    onDelete: (id: string) => void;
}) {
    const p = PRIORITY_META[task.priority];
    const nextStatus: Record<WorkTaskStatus, WorkTaskStatus> = {
        todo: 'in_progress', in_progress: 'done', done: 'todo', blocked: 'in_progress',
    };
    return (
        <div className={`flex items-start gap-2.5 p-2.5 rounded-xl border group ${task.status === 'done' ? 'opacity-50 border-line' : 'border-line bg-surface-2 hover:border-brand/20'} transition`}>
            <button
                onClick={() => onStatusChange(task.id, nextStatus[task.status])}
                className={`mt-0.5 shrink-0 ${task.status === 'done' ? 'text-success' : task.status === 'in_progress' ? 'text-brand' : task.status === 'blocked' ? 'text-danger' : 'text-ink-muted'} hover:scale-110 transition-transform`}
                title={`Status: ${task.status} → klik ubah`}
            >
                {TASK_STATUS_ICON[task.status]}
            </button>
            <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${task.status === 'done' ? 'line-through text-ink-muted' : 'text-ink'}`}>{task.title}</p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    {task.project && <span className="text-[10px] text-ink-muted font-bold">{task.project}</span>}
                    {task.deadline && <span className="text-[10px] text-ink-muted">📅 {new Date(task.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>}
                    {task.estimatedHours && <span className="text-[10px] text-ink-muted">⏱ {task.estimatedHours}j</span>}
                </div>
                {task.blocker && <p className="text-[10px] text-danger mt-0.5">🚧 {task.blocker}</p>}
            </div>
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0 ${p.bg} ${p.color}`}>{p.label}</span>
            <button onClick={() => onDelete(task.id)} className="opacity-0 group-hover:opacity-100 p-1 text-ink-muted hover:text-danger transition-all shrink-0">
                <Trash2 className="w-3 h-3" />
            </button>
        </div>
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
