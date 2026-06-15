'use client';

import { Clock, Zap, StopCircle } from 'lucide-react';
import { catMeta, MOOD_ICONS, MOOD_COLORS } from '@/components/life-log/activityMeta';
import { ENERGY_LABELS, formatDuration } from '@/constants/life-log';
import type { ActivityEntry } from '@/types';

interface Props {
    entry: ActivityEntry;
    duration: number;
    onSwitch: () => void;
    onStop: () => void;
    saving: boolean;
}

export function CurrentActivityCard({ entry, duration, onSwitch, onStop, saving }: Props) {
    const meta     = catMeta(entry.category);
    const MoodIcon = MOOD_ICONS[entry.mood - 1];

    return (
        <div className="rounded-card shadow-card bg-surface glass">
            <div className="p-5 space-y-4">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${meta.bg} flex items-center justify-center ${meta.color} shrink-0`}>
                        {meta.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-ink-muted text-[10px] font-bold uppercase tracking-widest">Aktivitas Sekarang</p>
                        <h2 className="text-ink font-extrabold text-base leading-tight truncate">{entry.title}</h2>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${meta.bg} ${meta.color}`}>{meta.label}</span>
                </div>

                <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5 text-ink-soft">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="font-semibold">{formatDuration(duration)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="text-xs text-ink-soft">Mood</span>
                        <MoodIcon className="w-4 h-4" style={{ color: MOOD_COLORS[entry.mood - 1] }} />
                    </div>
                    <div className="flex items-center gap-1 text-ink-soft">
                        <Zap className="w-3.5 h-3.5 text-brand" />
                        <span className="font-semibold text-brand">{ENERGY_LABELS[entry.energy - 1]}</span>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={onSwitch}
                        disabled={saving}
                        className="flex-1 py-2.5 rounded-xl bg-brand text-white text-sm font-bold hover:bg-brand-hover disabled:opacity-40 transition"
                    >
                        Ganti Aktivitas
                    </button>
                    <button
                        onClick={onStop}
                        disabled={saving}
                        className="px-4 py-2.5 rounded-xl border border-line text-ink-soft hover:bg-danger-soft hover:text-danger hover:border-danger/20 text-sm font-bold transition flex items-center gap-1.5"
                    >
                        <StopCircle className="w-4 h-4" />
                        Stop
                    </button>
                </div>
            </div>
        </div>
    );
}
