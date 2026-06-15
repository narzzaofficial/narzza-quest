'use client';

import { useState } from 'react';
import { Loader2, Activity } from 'lucide-react';
import { CATEGORIES, MOOD_ICONS, MOOD_COLORS } from '@/components/life-log/activityMeta';
import { ENERGY_LABELS } from '@/constants/life-log';
import type { ActivityCategory } from '@/types';

export interface LogFormData {
    title: string;
    category: ActivityCategory;
    mood: 1 | 2 | 3 | 4 | 5;
    energy: 1 | 2 | 3 | 4 | 5;
    note?: string;
}

interface Props {
    onSave: (data: LogFormData) => void;
    onCancel?: () => void;
    saving: boolean;
    label?: string;
}

export function LogForm({ onSave, onCancel, saving, label = 'Mulai Aktivitas' }: Props) {
    const [title,    setTitle]    = useState('');
    const [category, setCategory] = useState<ActivityCategory>('work');
    const [mood,     setMood]     = useState<1|2|3|4|5>(3);
    const [energy,   setEnergy]   = useState<1|2|3|4|5>(3);
    const [note,     setNote]     = useState('');

    const submit = () => {
        if (!title.trim()) return;
        onSave({ title: title.trim(), category, mood, energy, note: note.trim() || undefined });
    };

    const CurrentMoodIcon = MOOD_ICONS[mood - 1];

    return (
        <div className="space-y-4">
            <div>
                <label className="text-ink-muted text-[10px] font-bold uppercase tracking-widest block mb-1.5">Lagi ngapain?</label>
                <input
                    autoFocus
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && submit()}
                    placeholder="Contoh: Coding fitur auth, Rapat standup, Gym..."
                    className="w-full px-4 py-3 rounded-xl border border-line bg-surface-2 text-ink placeholder:text-ink-muted text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition"
                />
            </div>

            <div>
                <label className="text-ink-muted text-[10px] font-bold uppercase tracking-widest block mb-2">Kategori</label>
                <div className="grid grid-cols-4 gap-2">
                    {CATEGORIES.map((c) => (
                        <button
                            key={c.value}
                            onClick={() => setCategory(c.value)}
                            className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-xs font-bold transition-all ${
                                category === c.value
                                    ? `${c.bg} ${c.color} border-current shadow-sm`
                                    : 'border-line text-ink-muted hover:bg-surface-2'
                            }`}
                        >
                            {c.icon}
                            <span className="text-[10px]">{c.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-ink-muted text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 mb-2">
                        Mood <CurrentMoodIcon style={{ color: MOOD_COLORS[mood - 1] }} className="w-3.5 h-3.5" />
                    </label>
                    <div className="flex gap-1.5">
                        {([1, 2, 3, 4, 5] as const).map((v) => {
                            const Icon = MOOD_ICONS[v - 1];
                            const isSelected = mood === v;
                            return (
                                <button
                                    key={v}
                                    onClick={() => setMood(v)}
                                    className={`flex-1 flex items-center justify-center py-2.5 rounded-xl border-2 transition-all ${
                                        isSelected
                                            ? 'border-transparent shadow-sm scale-110'
                                            : 'border-line hover:bg-surface-2'
                                    }`}
                                    style={isSelected ? { backgroundColor: MOOD_COLORS[v - 1] + '20', borderColor: MOOD_COLORS[v - 1] + '60' } : {}}
                                >
                                    <Icon
                                        className="w-5 h-5"
                                        style={{ color: isSelected ? MOOD_COLORS[v - 1] : undefined }}
                                    />
                                </button>
                            );
                        })}
                    </div>
                </div>
                <div>
                    <label className="text-ink-muted text-[10px] font-bold uppercase tracking-widest block mb-2">
                        Energi <span className="text-brand font-extrabold">{ENERGY_LABELS[energy - 1]}</span>
                    </label>
                    <div className="flex gap-1.5">
                        {([1, 2, 3, 4, 5] as const).map((v) => (
                            <button
                                key={v}
                                onClick={() => setEnergy(v)}
                                className={`flex-1 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                                    energy === v ? 'bg-brand text-white border-brand shadow-sm' : 'border-line text-ink-muted hover:bg-surface-2'
                                }`}
                            >
                                {v}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div>
                <label className="text-ink-muted text-[10px] font-bold uppercase tracking-widest block mb-1.5">Catatan (opsional)</label>
                <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Ada yang ingin dicatat?"
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl border border-line bg-surface-2 text-ink placeholder:text-ink-muted text-sm resize-none focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition"
                />
            </div>

            <div className="flex gap-2">
                {onCancel && (
                    <button onClick={onCancel} className="flex-1 py-3 rounded-xl border border-line text-ink-soft text-sm font-bold hover:bg-surface-2 transition">
                        Batal
                    </button>
                )}
                <button
                    onClick={submit}
                    disabled={!title.trim() || saving}
                    className="flex-1 py-3 rounded-xl bg-brand text-white text-sm font-bold hover:bg-brand-hover disabled:opacity-40 transition flex items-center justify-center gap-2"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
                    {label}
                </button>
            </div>
        </div>
    );
}
