'use client';

import { useState } from 'react';
import { Zap, Star, Clock } from 'lucide-react';
import type { DayXP } from '@/hooks/useXPHistory';

function shortDate(dateStr: string) {
    const d = new Date(dateStr + 'T12:00:00Z');
    return d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' });
}

function fullDate(dateStr: string) {
    return new Date(dateStr + 'T12:00:00Z').toLocaleDateString('id-ID', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });
}

function fmtTime(sec: number) {
    if (!sec) return null;
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    if (h > 0) return `${h}j ${m}m`;
    return `${m} mnt`;
}

interface Props {
    days: DayXP[];
    loading: boolean;
    totalXP: number;
    maxXP: number;
}

export function XPHistory({ days, loading, totalXP, maxXP }: Props) {
    const [selected, setSelected] = useState<string | null>(null);

    // Show newest-first for the list, but chart left=oldest right=newest
    const chartDays = [...days].reverse(); // oldest → newest
    const selectedDay = days.find((d) => d.date === selected);

    return (
        <section className="glass rounded-card shadow-card">
            <div className="p-5 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                            <Zap className="w-4 h-4 text-amber-500" />
                        </div>
                        <div>
                            <p className="text-amber-500 text-[10px] uppercase tracking-widest font-bold">Progress</p>
                            <h2 className="text-ink font-extrabold text-base leading-tight">EXP Harian</h2>
                        </div>
                    </div>
                    {totalXP > 0 && (
                        <div className="text-right">
                            <p className="text-[10px] text-ink-muted uppercase tracking-widest font-bold">14 Hari</p>
                            <p className="text-brand font-extrabold text-lg leading-tight">+{totalXP.toLocaleString()} XP</p>
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="py-8 text-center text-ink-muted text-sm">Memuat riwayat XP...</div>
                ) : totalXP === 0 ? (
                    <div className="py-10 flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-surface-2 flex items-center justify-center">
                            <Star className="w-6 h-6 text-ink-muted" />
                        </div>
                        <p className="text-ink-muted text-sm text-center">
                            Belum ada XP yang diperoleh<br className="hidden sm:block" /> dalam 14 hari terakhir.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Bar chart */}
                        <div className="overflow-x-auto">
                            <div className="flex items-end gap-1.5 h-28 min-w-0" style={{ minWidth: `${chartDays.length * 36}px` }}>
                                {chartDays.map((day) => {
                                    const pct        = maxXP > 0 ? (day.totalXP / maxXP) * 100 : 0;
                                    const isSelected = selected === day.date;
                                    const isToday    = day.date === new Date().toISOString().split('T')[0];
                                    return (
                                        <button
                                            key={day.date}
                                            onClick={() => setSelected(isSelected ? null : day.date)}
                                            className="flex-1 flex flex-col items-center gap-1 group"
                                        >
                                            <div className="w-full flex items-end justify-center" style={{ height: '88px' }}>
                                                <div
                                                    className={`w-full rounded-t-lg transition-all duration-300 ${
                                                        day.totalXP === 0
                                                            ? 'bg-surface-2 border border-line'
                                                            : isSelected
                                                                ? 'bg-brand shadow-md'
                                                                : 'bg-brand/30 group-hover:bg-brand/50'
                                                    }`}
                                                    style={{ height: day.totalXP === 0 ? '6px' : `${Math.max(8, pct * 0.88)}px` }}
                                                />
                                            </div>
                                            <span className={`text-[9px] font-bold whitespace-nowrap transition-colors ${
                                                isSelected ? 'text-brand' : isToday ? 'text-ink' : 'text-ink-muted'
                                            }`}>
                                                {shortDate(day.date)}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Selected day detail */}
                        {selectedDay ? (
                            <div className="border border-line rounded-xl overflow-hidden">
                                <div className="px-4 py-3 bg-brand-soft border-b border-line flex items-center justify-between">
                                    <p className="text-ink font-bold text-sm">{fullDate(selectedDay.date)}</p>
                                    <span className="text-brand font-extrabold text-sm">
                                        +{selectedDay.totalXP.toLocaleString()} XP
                                    </span>
                                </div>
                                {selectedDay.entries.length === 0 ? (
                                    <p className="text-ink-muted text-xs py-4 text-center">Tidak ada quest selesai hari ini.</p>
                                ) : (
                                    <div className="divide-y divide-line">
                                        {selectedDay.entries.map((e) => (
                                            <div key={e.id} className="flex items-center gap-3 px-4 py-3">
                                                <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                                                    <Star className="w-3.5 h-3.5 text-amber-500" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-ink font-semibold text-sm truncate">
                                                        {e.questTitle ?? 'Quest'}
                                                    </p>
                                                    {e.timeWorkedSeconds > 0 && (
                                                        <p className="text-ink-muted text-xs flex items-center gap-1 mt-0.5">
                                                            <Clock className="w-3 h-3" />
                                                            {fmtTime(e.timeWorkedSeconds)}
                                                        </p>
                                                    )}
                                                </div>
                                                <span className="text-brand font-extrabold text-sm shrink-0">
                                                    +{(e.expEarned ?? 0).toLocaleString()}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-center text-ink-muted text-xs pb-1">
                                Klik bar untuk lihat detail quest hari itu.
                            </p>
                        )}
                    </>
                )}
            </div>
        </section>
    );
}
