'use client';

import { memo } from 'react';
import { MONTH_NAMES_SHORT } from '@/constants/ui';
import type { ActivityEntry } from '@/types';

function dateKey(iso: string) { return iso.split('T')[0]; }

const HEATMAP_DAY_LABELS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

const PAST_WEEKS   = 26; // ~6 months back
const FUTURE_WEEKS = 26; // ~6 months forward

function cellColor(count: number, maxCount: number): string {
    if (count === 0) return 'var(--color-surface-2)';
    const pct = count / maxCount;
    if (pct < 0.25) return 'rgba(79,124,255,0.25)';
    if (pct < 0.5)  return 'rgba(79,124,255,0.50)';
    if (pct < 0.75) return 'rgba(79,124,255,0.75)';
    return '#4f7cff';
}

export const ActivityHeatmap = memo(function ActivityHeatmap({ activities }: { activities: ActivityEntry[] }) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    // Start from Monday of the week that is PAST_WEEKS ago
    const mondayOffset = (today.getDay() + 6) % 7; // 0 = Mon … 6 = Sun
    const startMonday = new Date(today);
    startMonday.setDate(today.getDate() - mondayOffset - PAST_WEEKS * 7);

    const totalWeeks = PAST_WEEKS + FUTURE_WEEKS + 1;

    const countByDate: Record<string, number> = {};
    activities.forEach(a => {
        const k = dateKey(a.startTime);
        countByDate[k] = (countByDate[k] ?? 0) + 1;
    });
    const maxCount = Math.max(1, ...Object.values(countByDate));

    const cells = Array.from({ length: totalWeeks }, (_, wi) =>
        Array.from({ length: 7 }, (_, di) => {
            const d = new Date(startMonday);
            d.setDate(startMonday.getDate() + wi * 7 + di);
            const k = d.toISOString().split('T')[0];
            return {
                date:     k,
                count:    countByDate[k] ?? 0,
                d,
                isFuture: d > today,
                isToday:  k === todayStr,
            };
        })
    );

    // Show month name on the week that contains the 1st of a month
    const monthLabels: (string | null)[] = cells.map((week) => {
        const firstOfMonth = week.find(c => c.d.getDate() === 1);
        return firstOfMonth ? MONTH_NAMES_SHORT[firstOfMonth.d.getMonth()] : null;
    });

    return (
        <div className="space-y-2">
            <div className="overflow-x-auto pb-1">
                <div className="flex gap-1.5 min-w-max">
                    {/* Day label column */}
                    <div className="flex flex-col gap-1.5 pt-5 mr-0.5">
                        {HEATMAP_DAY_LABELS.map((d, i) => (
                            <div
                                key={d}
                                className={`w-7 h-4 text-[10px] text-ink-muted font-bold flex items-center ${i % 2 === 0 ? '' : 'opacity-0'}`}
                            >
                                {d}
                            </div>
                        ))}
                    </div>

                    {/* Week columns */}
                    {cells.map((week, wi) => (
                        <div key={wi} className="flex flex-col gap-1.5">
                            {/* Month label */}
                            <div className="h-4 text-[10px] text-ink-muted font-bold">
                                {monthLabels[wi] ?? ''}
                            </div>

                            {week.map((cell) => {
                                if (cell.isToday) {
                                    return (
                                        <div
                                            key={cell.date}
                                            title={`Hari ini: ${cell.count} aktivitas`}
                                            className="w-4 h-4 rounded-sm transition-transform hover:scale-125 ring-2 ring-brand ring-offset-[1.5px]"
                                            style={{
                                                backgroundColor: cellColor(cell.count, maxCount),
                                            }}
                                        />
                                    );
                                }

                                if (cell.isFuture) {
                                    return (
                                        <div
                                            key={cell.date}
                                            className="w-4 h-4 rounded-sm"
                                            style={{
                                                backgroundColor: 'var(--color-surface-2)',
                                                border: '1px solid rgba(0,0,0,0.04)',
                                                opacity: 0.35,
                                            }}
                                        />
                                    );
                                }

                                return (
                                    <div
                                        key={cell.date}
                                        title={`${cell.date}: ${cell.count} aktivitas`}
                                        className="w-4 h-4 rounded-sm transition-transform hover:scale-125"
                                        style={{
                                            backgroundColor: cellColor(cell.count, maxCount),
                                            border: '1px solid rgba(0,0,0,0.06)',
                                            cursor: cell.count > 0 ? 'default' : undefined,
                                        }}
                                    />
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-2 pt-1">
                <span className="text-[10px] text-ink-muted font-bold">Kurang</span>
                {[0, 0.2, 0.45, 0.7, 1].map((pct, i) => (
                    <div
                        key={i}
                        className="w-3.5 h-3.5 rounded-sm border border-black/5"
                        style={{ backgroundColor: pct === 0 ? 'var(--color-surface-2)' : `rgba(79,124,255,${pct})` }}
                    />
                ))}
                <span className="text-[10px] text-ink-muted font-bold">Banyak</span>
            </div>
        </div>
    );
});
