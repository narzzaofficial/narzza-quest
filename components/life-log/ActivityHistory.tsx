'use client';

import { useState } from 'react';
import { CalendarDays, ChevronDown, ChevronUp, Clock, Activity, SortAsc, SortDesc, Check, X } from 'lucide-react';
import { FaBullseye } from 'react-icons/fa6';
import { MOOD_ICONS, MOOD_COLORS, HABIT_ICON_MAP, HABIT_ICON_COLORS } from '@/components/life-log/activityMeta';
import { formatDuration } from '@/constants/life-log';
import { TimelineEntry } from '@/components/life-log/TimelineEntry';
import type { DayActivity } from '@/hooks/useActivityHistory';
import type { ActivityEntry, Habit } from '@/types';

function formatDate(dateStr: string) {
    return new Date(dateStr + 'T12:00:00Z').toLocaleDateString('id-ID', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });
}

interface Props {
    days: DayActivity[];
    loading: boolean;
    habits: Habit[];
    getDurationMinutes: (entry: ActivityEntry) => number;
}

export function ActivityHistory({ days, loading, habits, getDurationMinutes }: Props) {
    const [expanded, setExpanded] = useState<string | null>(null);
    const [sortAsc,  setSortAsc]  = useState(false);

    const sorted = sortAsc ? [...days].reverse() : days;

    return (
        <section className="glass rounded-card shadow-card">
            <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
                            <CalendarDays className="w-4 h-4 text-violet-600" />
                        </div>
                        <div>
                            <p className="text-violet-600 text-[10px] uppercase tracking-widest font-bold">Riwayat</p>
                            <h2 className="text-ink font-extrabold text-base leading-tight">Aktivitas Harian</h2>
                        </div>
                    </div>
                    <button
                        onClick={() => setSortAsc(!sortAsc)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-line text-ink-muted text-xs font-bold hover:bg-surface-2 transition"
                    >
                        {sortAsc ? <SortAsc className="w-3.5 h-3.5" /> : <SortDesc className="w-3.5 h-3.5" />}
                        {sortAsc ? 'Terlama' : 'Terbaru'}
                    </button>
                </div>

                {loading ? (
                    <div className="py-8 text-center text-ink-muted text-sm">Memuat riwayat...</div>
                ) : sorted.length === 0 ? (
                    <div className="py-10 flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-surface-2 flex items-center justify-center">
                            <Activity className="w-6 h-6 text-ink-muted" />
                        </div>
                        <p className="text-ink-muted text-sm text-center">
                            Belum ada riwayat dalam 14 hari terakhir.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {sorted.map((day) => {
                            const isOpen     = expanded === day.date;
                            const moodIdx    = day.avgMood != null ? Math.min(4, Math.max(0, Math.round(day.avgMood) - 1)) : 2;
                            const MoodIcon   = MOOD_ICONS[moodIdx];
                            const moodColor  = MOOD_COLORS[moodIdx];

                            const doneIds    = new Set(day.habitLogs.filter((l) => l.completed).map((l) => l.habitId));
                            const doneCount  = doneIds.size;
                            const totalHabit = habits.length;

                            return (
                                <div key={day.date} className="border border-line rounded-xl overflow-hidden">
                                    {/* ── Day header row ── */}
                                    <button
                                        onClick={() => setExpanded(isOpen ? null : day.date)}
                                        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-surface-2 transition text-left"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="text-ink font-bold text-sm">{formatDate(day.date)}</p>
                                            <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                                                {day.totalMinutes > 0 && (
                                                    <span className="text-ink-muted text-xs flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {formatDuration(day.totalMinutes)}
                                                        {day.completedEntries.length > 0 && ` · ${day.completedEntries.length} aktivitas`}
                                                    </span>
                                                )}
                                                {totalHabit > 0 && (
                                                    <span className={`text-xs font-semibold ${doneCount === totalHabit ? 'text-success' : doneCount === 0 ? 'text-danger' : 'text-amber-500'}`}>
                                                        {doneCount}/{totalHabit} habit
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {day.avgMood != null && (
                                            <MoodIcon className="w-5 h-5 shrink-0" style={{ color: moodColor }} />
                                        )}
                                        {isOpen
                                            ? <ChevronUp   className="w-4 h-4 text-ink-muted shrink-0" />
                                            : <ChevronDown className="w-4 h-4 text-ink-muted shrink-0" />
                                        }
                                    </button>

                                    {/* ── Expanded detail ── */}
                                    {isOpen && (
                                        <div className="border-t border-line bg-surface-2/40">
                                            {/* Habit section */}
                                            {habits.length > 0 && (
                                                <div className="px-4 pt-4 pb-3">
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-ink-muted mb-2.5">Habit</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {habits.map((h) => {
                                                            const done      = doneIds.has(h.id);
                                                            const HabitIcon = HABIT_ICON_MAP[h.icon] ?? FaBullseye;
                                                            const color     = HABIT_ICON_COLORS[h.icon] ?? '#ef4444';
                                                            return (
                                                                <div
                                                                    key={h.id}
                                                                    className={`flex items-center gap-1.5 pl-2 pr-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                                                                        done
                                                                            ? 'border-transparent'
                                                                            : 'border-line bg-surface text-ink-muted'
                                                                    }`}
                                                                    style={done ? {
                                                                        backgroundColor: color + '18',
                                                                        borderColor: color + '40',
                                                                        color,
                                                                    } : {}}
                                                                >
                                                                    <HabitIcon
                                                                        className="w-3.5 h-3.5 shrink-0"
                                                                        style={{ color: done ? color : '#94a3b8' }}
                                                                    />
                                                                    <span className={done ? '' : 'opacity-50'}>{h.name}</span>
                                                                    {done
                                                                        ? <Check className="w-3 h-3 shrink-0 opacity-70" />
                                                                        : <X    className="w-3 h-3 shrink-0 opacity-40" />
                                                                    }
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Activity timeline */}
                                            {day.completedEntries.length > 0 && (
                                                <div className={`px-4 pb-4 ${habits.length > 0 ? 'border-t border-line pt-3' : 'pt-3'}`}>
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-ink-muted mb-2.5">Timeline</p>
                                                    <div className="space-y-0">
                                                        {[...day.completedEntries].reverse().map((e) => (
                                                            <TimelineEntry key={e.id} entry={e} duration={getDurationMinutes(e)} />
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {day.completedEntries.length === 0 && habits.length === 0 && (
                                                <p className="text-ink-muted text-xs py-4 text-center">Tidak ada data untuk hari ini.</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
}
