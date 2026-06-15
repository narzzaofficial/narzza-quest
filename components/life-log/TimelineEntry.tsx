'use client';

import { catMeta, MOOD_ICONS, MOOD_COLORS } from '@/components/life-log/activityMeta';
import { ENERGY_LABELS, formatTime, formatDuration } from '@/constants/life-log';
import type { ActivityEntry } from '@/types';

interface Props {
    entry: ActivityEntry;
    duration: number;
}

export function TimelineEntry({ entry, duration }: Props) {
    const meta     = catMeta(entry.category);
    const MoodIcon = MOOD_ICONS[entry.mood - 1];

    return (
        <div className="flex gap-3 group">
            <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-lg ${meta.bg} ${meta.color} flex items-center justify-center shrink-0`}>
                    {meta.icon}
                </div>
                <div className="w-px flex-1 bg-line mt-1" />
            </div>
            <div className="flex-1 pb-4 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                        <p className="text-ink font-bold text-sm truncate">{entry.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-ink-muted text-xs">{formatTime(entry.startTime)}</span>
                            {entry.endTime && <span className="text-ink-muted text-xs">→ {formatTime(entry.endTime)}</span>}
                            <span className="text-brand text-xs font-semibold">{formatDuration(duration)}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <MoodIcon className="w-3.5 h-3.5" style={{ color: MOOD_COLORS[entry.mood - 1] }} />
                        <span className="text-[10px] font-bold text-ink-muted">{ENERGY_LABELS[entry.energy - 1]}</span>
                    </div>
                </div>
                {entry.note && (
                    <p className="text-ink-muted text-xs mt-1 italic">&ldquo;{entry.note}&rdquo;</p>
                )}
            </div>
        </div>
    );
}
