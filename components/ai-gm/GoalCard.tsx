'use client';

import { useState } from 'react';
import { Target, Pencil } from 'lucide-react';
import { useGoal } from '@/hooks/useGoal';
import GoalForm from '@/components/ui/GoalForm';
import { GRAD } from '@/constants/ui';

export function GoalCard() {
    const { goal, hasGoal, saving, save } = useGoal();
    const [editing, setEditing] = useState(false);

    if (editing || !hasGoal) {
        return (
            <section className="glass rounded-card p-5 md:p-6 shadow-card">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundImage: GRAD.brand }}>
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
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundImage: GRAD.brand }}>
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
