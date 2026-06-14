'use client';

import React, { useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import { FOCUS_AREAS } from '@/constants/goal';
import type { GoalProfile } from '@/types';
import type { GoalInput } from '@/hooks/useGoal';

interface GoalFormProps {
    initial?: GoalProfile | null;
    saving?: boolean;
    submitLabel?: string;
    onSave: (data: GoalInput) => void;
    onCancel?: () => void;
}

const field =
    'w-full p-3 rounded-xl border border-line bg-surface text-ink font-medium placeholder:text-ink-muted outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/15 transition';

export default function GoalForm({ initial, saving, submitLabel = 'Simpan Tujuan', onSave, onCancel }: GoalFormProps) {
    const [aspiration, setAspiration] = useState(initial?.aspiration ?? '');
    const [focusAreas, setFocusAreas] = useState<string[]>(initial?.focusAreas ?? []);
    const [timeframe, setTimeframe] = useState(initial?.timeframe ?? '');

    const toggle = (a: string) =>
        setFocusAreas((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!aspiration.trim()) return;
        onSave({ aspiration: aspiration.trim(), focusAreas, timeframe: timeframe.trim() || undefined });
    };

    return (
        <form onSubmit={submit} className="space-y-5">
            <div>
                <label className="block text-sm font-bold text-ink mb-1.5">Apa tujuan / aspirasimu?</label>
                <p className="text-ink-soft text-xs mb-2">Ceritakan kamu mau jadi apa & kenapa. Ini jadi panduan utama AI menyusun misimu.</p>
                <textarea
                    value={aspiration}
                    onChange={(e) => setAspiration(e.target.value)}
                    rows={3}
                    placeholder="cth: Aku mau jadi fullstack developer & lancar bahasa Jepang dalam 6 bulan, biar bisa kerja remote di perusahaan global."
                    className={`${field} resize-none`}
                />
            </div>

            <div>
                <label className="block text-sm font-bold text-ink mb-2">Area fokus</label>
                <div className="flex flex-wrap gap-2">
                    {FOCUS_AREAS.map((a) => {
                        const active = focusAreas.includes(a);
                        return (
                            <button
                                type="button"
                                key={a}
                                onClick={() => toggle(a)}
                                className={`px-3 py-1.5 rounded-full text-sm font-bold border transition-all ${active ? 'bg-brand text-white border-transparent' : 'bg-surface text-ink-soft border-line hover:bg-surface-2'}`}
                            >
                                {a}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-ink mb-1.5">Target waktu <span className="text-ink-muted font-medium">(opsional)</span></label>
                <input value={timeframe} onChange={(e) => setTimeframe(e.target.value)} placeholder="cth: 6 bulan" className={field} />
            </div>

            <div className="flex gap-3 pt-1">
                {onCancel && (
                    <button type="button" onClick={onCancel} className="px-5 py-3 rounded-xl border border-line text-ink-soft font-bold text-sm hover:bg-surface-2 transition">Batal</button>
                )}
                <button type="submit" disabled={saving || !aspiration.trim()} className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-brand text-white font-bold py-3 shadow-card hover:bg-brand-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {submitLabel}
                </button>
            </div>
        </form>
    );
}
