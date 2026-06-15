'use client';

import { useState } from 'react';
import { HABIT_ICON_MAP, HABIT_ICON_NAMES, HABIT_ICON_COLORS } from '@/components/life-log/activityMeta';

interface Props {
    onAdd: (name: string, icon: string) => void;
    onCancel: () => void;
    saving: boolean;
}

export function AddHabitForm({ onAdd, onCancel, saving }: Props) {
    const [habitName, setHabitName] = useState('');
    const [icon,      setIcon]      = useState('Target');

    return (
        <div className="bg-surface-2 rounded-xl p-4 space-y-3 border border-line">
            <input
                autoFocus
                value={habitName}
                onChange={(e) => setHabitName(e.target.value)}
                placeholder="Nama habit (contoh: Olahraga 30 menit)"
                className="w-full px-3 py-2.5 rounded-lg border border-line bg-surface text-ink text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition"
            />
            <div>
                <p className="text-ink-muted text-[10px] font-bold uppercase tracking-widest mb-2">Pilih ikon</p>
                <div className="flex flex-wrap gap-2">
                    {HABIT_ICON_NAMES.map((iconKey) => {
                        const Icon       = HABIT_ICON_MAP[iconKey];
                        const color      = HABIT_ICON_COLORS[iconKey];
                        const isSelected = icon === iconKey;
                        return (
                            <button
                                key={iconKey}
                                onClick={() => setIcon(iconKey)}
                                className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all ${
                                    isSelected ? 'border-transparent scale-110 shadow-sm' : 'border-line hover:border-line-strong'
                                }`}
                                style={isSelected ? { backgroundColor: color + '25', borderColor: color + '80' } : {}}
                                title={iconKey}
                            >
                                <Icon className="w-5 h-5" style={{ color }} />
                            </button>
                        );
                    })}
                </div>
            </div>
            <div className="flex gap-2">
                <button onClick={onCancel} className="flex-1 py-2 rounded-lg border border-line text-ink-soft text-sm font-bold hover:bg-surface transition">Batal</button>
                <button
                    onClick={() => habitName.trim() && onAdd(habitName.trim(), icon)}
                    disabled={!habitName.trim() || saving}
                    className="flex-1 py-2 rounded-lg bg-brand text-white text-sm font-bold disabled:opacity-40 transition"
                >
                    Tambah
                </button>
            </div>
        </div>
    );
}
