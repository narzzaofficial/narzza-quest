'use client';

import React, { useState } from 'react';
import { Loader2, Briefcase, Plus, Clock, Activity, CheckCheck, Ban, Trash2 } from 'lucide-react';
import { PRIORITY_META } from '@/constants/ui';
import type { WorkTask, WorkTaskPriority, WorkTaskStatus } from '@/types';
import type { useWorkTasks } from '@/hooks/useWorkTasks';

type WtData = ReturnType<typeof useWorkTasks>;

const TASK_STATUS_ICON: Record<WorkTaskStatus, React.ReactNode> = {
    todo:        <Clock      className="w-3.5 h-3.5" />,
    in_progress: <Activity   className="w-3.5 h-3.5" />,
    done:        <CheckCheck className="w-3.5 h-3.5" />,
    blocked:     <Ban        className="w-3.5 h-3.5" />,
};

type TaskForm = {
    title: string; project: string; assignedBy: string;
    priority: WorkTaskPriority; deadline: string;
    estimatedHours: string; description: string;
};

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

export function WorkTasksSection({ wt }: { wt: WtData }) {
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState<TaskForm>({
        title: '', project: '', assignedBy: '', priority: 'medium',
        deadline: '', estimatedHours: '', description: '',
    });

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
        setForm({ title: '', project: '', assignedBy: '', priority: 'medium', deadline: '', estimatedHours: '', description: '' });
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
                            <input value={form.project} onChange={e => setForm(f => ({ ...f, project: e.target.value }))} placeholder="Nama proyek" className="px-3 py-2 rounded-xl border border-line bg-surface text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:border-brand transition" />
                            <input value={form.assignedBy} onChange={e => setForm(f => ({ ...f, assignedBy: e.target.value }))} placeholder="Dari siapa" className="px-3 py-2 rounded-xl border border-line bg-surface text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:border-brand transition" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as WorkTaskPriority }))} className="px-3 py-2 rounded-xl border border-line bg-surface text-sm text-ink focus:outline-none focus:border-brand transition">
                                {(Object.keys(PRIORITY_META) as WorkTaskPriority[]).map(k => (
                                    <option key={k} value={k}>{PRIORITY_META[k].label}</option>
                                ))}
                            </select>
                            <input type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} className="px-3 py-2 rounded-xl border border-line bg-surface text-sm text-ink focus:outline-none focus:border-brand transition" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <input type="number" value={form.estimatedHours} onChange={e => setForm(f => ({ ...f, estimatedHours: e.target.value }))} placeholder="Est. jam" min={0} className="px-3 py-2 rounded-xl border border-line bg-surface text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:border-brand transition" />
                            <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Deskripsi singkat" className="px-3 py-2 rounded-xl border border-line bg-surface text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:border-brand transition" />
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
