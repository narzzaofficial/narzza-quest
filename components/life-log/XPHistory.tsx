'use client';

import { useState } from 'react';
import { Zap, Star, Clock, AlertTriangle } from 'lucide-react';
import { formatFullDateID } from '@/lib/dateUtils';
import type { DayXP } from '@/hooks/useXPHistory';

function shortDate(dateStr: string) {
    const d = new Date(dateStr + 'T12:00:00Z');
    return d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' });
}

function fmtTime(sec: number) {
    if (!sec) return null;
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    return h > 0 ? `${h}j ${m}m` : `${m} mnt`;
}

interface Props {
    days: DayXP[];
    loading: boolean;
    totalEarned: number;
    totalPenalty: number;
    totalNet: number;
    maxAbs: number;
}

export function XPHistory({ days, loading, totalEarned, totalPenalty, totalNet, maxAbs }: Props) {
    const [selected, setSelected] = useState<string | null>(null);

    const chartDays   = [...days].reverse(); // oldest → newest for chart
    const selectedDay = days.find((d) => d.date === selected);

    const hasAny = days.some((d) => d.earned > 0 || d.penalty > 0);

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
                    {hasAny && (
                        <div className="text-right space-y-0.5">
                            <p className="text-[10px] text-ink-muted uppercase tracking-widest font-bold">14 Hari · Net</p>
                            <p className={`font-extrabold text-lg leading-tight ${totalNet >= 0 ? 'text-brand' : 'text-danger'}`}>
                                {totalNet >= 0 ? '+' : ''}{totalNet.toLocaleString()} XP
                            </p>
                            {totalPenalty > 0 && (
                                <p className="text-danger text-[10px] font-bold">−{totalPenalty.toLocaleString()} penalti</p>
                            )}
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="py-8 text-center text-ink-muted text-sm">Memuat riwayat XP...</div>
                ) : !hasAny ? (
                    <div className="py-10 flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-surface-2 flex items-center justify-center">
                            <Star className="w-6 h-6 text-ink-muted" />
                        </div>
                        <p className="text-ink-muted text-sm text-center">
                            Belum ada XP dalam 14 hari terakhir.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Bar chart */}
                        <div className="overflow-x-auto">
                            <div
                                className="flex items-center gap-1.5"
                                style={{ minWidth: `${chartDays.length * 36}px`, height: '120px' }}
                            >
                                {chartDays.map((day) => {
                                    const earnedPct  = maxAbs > 0 ? (day.earned  / maxAbs) * 100 : 0;
                                    const penaltyPct = maxAbs > 0 ? (day.penalty / maxAbs) * 100 : 0;
                                    const isSelected = selected === day.date;
                                    const isToday    = day.date === new Date().toISOString().split('T')[0];

                                    return (
                                        <button
                                            key={day.date}
                                            onClick={() => setSelected(isSelected ? null : day.date)}
                                            className="flex-1 flex flex-col items-center gap-0.5 group"
                                            style={{ height: '120px' }}
                                        >
                                            {/* Top half: earned bars grow upward */}
                                            <div className="flex-1 w-full flex items-end justify-center" style={{ height: '54px' }}>
                                                {day.earned > 0 ? (
                                                    <div
                                                        className={`w-full rounded-t-md transition-all duration-300 ${isSelected ? 'opacity-100' : 'opacity-70 group-hover:opacity-90'}`}
                                                        style={{
                                                            height: `${Math.max(4, earnedPct * 0.54)}px`,
                                                            background: isSelected ? '#3b82f6' : '#3b82f680',
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="w-full" style={{ height: '3px' }} />
                                                )}
                                            </div>

                                            {/* Zero line */}
                                            <div className="w-full h-px bg-line-strong shrink-0" />

                                            {/* Bottom half: penalty bars grow downward */}
                                            <div className="flex-1 w-full flex items-start justify-center" style={{ height: '54px' }}>
                                                {day.penalty > 0 ? (
                                                    <div
                                                        className={`w-full rounded-b-md transition-all duration-300 ${isSelected ? 'opacity-100' : 'opacity-70 group-hover:opacity-90'}`}
                                                        style={{
                                                            height: `${Math.max(4, penaltyPct * 0.54)}px`,
                                                            background: isSelected ? '#ef4444' : '#ef444480',
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="w-full" style={{ height: '3px' }} />
                                                )}
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

                        {/* Legend */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px] font-bold text-ink-muted">
                            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-brand inline-block" />XP Dapat</span>
                            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-danger inline-block" />Penalti Miss Quest</span>
                            <span className="italic sm:ml-auto">Klik bar untuk detail</span>
                        </div>

                        {/* Selected day detail */}
                        {selectedDay ? (
                            <div className="border border-line rounded-xl overflow-hidden">
                                <div className="px-4 py-3 bg-surface-2 border-b border-line flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                                    <p className="text-ink font-bold text-sm flex-1 min-w-0">{formatFullDateID(selectedDay.date)}</p>
                                    <div className="flex items-center gap-2 sm:gap-3 text-sm font-extrabold shrink-0">
                                        {selectedDay.earned  > 0 && <span className="text-brand">+{selectedDay.earned.toLocaleString()}</span>}
                                        {selectedDay.penalty > 0 && <span className="text-danger">−{selectedDay.penalty.toLocaleString()}</span>}
                                        {(selectedDay.earned > 0 || selectedDay.penalty > 0) && (
                                            <span className={selectedDay.net >= 0 ? 'text-success' : 'text-danger'}>
                                                = {selectedDay.net >= 0 ? '+' : ''}{selectedDay.net.toLocaleString()} net
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Earned quests */}
                                {selectedDay.entries.length > 0 && (
                                    <div className="divide-y divide-line">
                                        {selectedDay.entries.map((e) => (
                                            <div key={e.id} className="flex items-center gap-3 px-4 py-3">
                                                <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                                                    <Star className="w-3.5 h-3.5 text-amber-500" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-ink font-semibold text-sm truncate">{e.questTitle ?? 'Quest'}</p>
                                                    {e.timeWorkedSeconds > 0 && (
                                                        <p className="text-ink-muted text-xs flex items-center gap-1 mt-0.5">
                                                            <Clock className="w-3 h-3" />{fmtTime(e.timeWorkedSeconds)}
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

                                {/* Missed quests (penalties) */}
                                {selectedDay.missedTitles.length > 0 && (
                                    <div className={`divide-y divide-line ${selectedDay.entries.length > 0 ? 'border-t border-line' : ''}`}>
                                        {selectedDay.missedTitles.map((title, i) => (
                                            <div key={i} className="flex items-center gap-3 px-4 py-3 bg-danger-soft/30">
                                                <div className="w-7 h-7 rounded-lg bg-danger-soft flex items-center justify-center shrink-0">
                                                    <AlertTriangle className="w-3.5 h-3.5 text-danger" />
                                                </div>
                                                <p className="flex-1 text-ink-soft font-semibold text-sm truncate line-through">{title}</p>
                                                <span className="text-danger font-extrabold text-sm shrink-0">Missed</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {selectedDay.entries.length === 0 && selectedDay.missedTitles.length === 0 && (
                                    <p className="text-ink-muted text-xs py-4 text-center">Tidak ada aktivitas XP hari ini.</p>
                                )}
                            </div>
                        ) : (
                            <p className="text-center text-ink-muted text-xs">Klik bar untuk lihat detail.</p>
                        )}
                    </>
                )}
            </div>
        </section>
    );
}
