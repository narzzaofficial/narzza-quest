'use client';

import { useState } from 'react';
import { Loader2, MapPin, Pencil, Save } from 'lucide-react';
import { STATUS_LABELS, STATUS_COLORS, WORKLOAD_LABELS } from '@/constants/ui';
import type { UserStatusType, WorkloadLevel } from '@/types';
import type { useSituation } from '@/hooks/useSituation';

type SitData = ReturnType<typeof useSituation>;

type SitForm = {
    currentStatus: UserStatusType;
    weekFocus: string;
    workload: WorkloadLevel;
    activeProjects: string;
    contextNote: string;
};

export function SituationRoom({ sit }: { sit: SitData }) {
    const s = sit.situation;
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState<SitForm>({
        currentStatus: 'normal', weekFocus: '', workload: 'medium', activeProjects: '', contextNote: '',
    });

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
