'use client';

import { useState } from 'react';
import {
    AreaChart, Area, BarChart, Bar, Cell,
    XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';

export interface ExpPoint {
    label: string;
    exp: number;
    penalty: number; // stored as negative
    net: number;
    cumulative: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function DailyTip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload as ExpPoint;
    return (
        <div className="rounded-xl border border-line glass px-3 py-2 shadow-pop text-xs">
            <p className="font-bold text-ink mb-1.5">{label}</p>
            <p className="text-blue-500 font-semibold">Earned: +{d.exp} XP</p>
            {d.penalty < 0 && (
                <p className="text-red-500 font-semibold">Penalti: {d.penalty} XP</p>
            )}
            <p className={`font-extrabold border-t border-line pt-1 mt-1 ${d.net >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                Net: {d.net >= 0 ? '+' : ''}{d.net} XP
            </p>
        </div>
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CumulativeTip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload as ExpPoint;
    return (
        <div className="rounded-xl border border-line glass px-3 py-2 shadow-pop text-xs">
            <p className="font-bold text-ink mb-1.5">{label}</p>
            <p className="text-emerald-500 font-semibold">Total kumulatif: +{d.cumulative} XP</p>
            <p className="text-ink-muted mt-0.5">Hari ini: {d.net >= 0 ? '+' : ''}{d.net} XP</p>
        </div>
    );
}

export function ExpGrowthChart({ data }: { data: ExpPoint[] }) {
    const [mode, setMode] = useState<'cumulative' | 'daily'>('cumulative');

    const totalCumulative = data[data.length - 1]?.cumulative ?? 0;
    const daysWithPenalty = data.filter((d) => d.penalty < 0).length;
    const totalPenaltyAbs = data.reduce((s, d) => s + Math.abs(d.penalty), 0);

    return (
        <div className="glass rounded-card shadow-card p-5">
            {/* Header row */}
            <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="text-ink font-extrabold text-base">EXP Growth</h3>
                <div className="flex bg-surface-2 rounded-lg p-0.5 shrink-0">
                    {(['cumulative', 'daily'] as const).map((m) => (
                        <button
                            key={m}
                            onClick={() => setMode(m)}
                            className={`px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                                mode === m
                                    ? 'bg-white shadow text-ink'
                                    : 'text-ink-muted hover:text-ink'
                            }`}
                        >
                            {m === 'cumulative' ? 'Kumulatif' : 'Per Hari'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Sub text */}
            <p className="text-ink-muted text-xs mb-4">
                {mode === 'cumulative'
                    ? 'Total akumulasi XP dari quest yang diselesaikan'
                    : 'Net XP per hari · hijau = positif · merah = rugi'}
            </p>

            {/* Summary chips */}
            {data.length > 0 && (
                <div className="flex gap-3 mb-4 flex-wrap">
                    <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg px-2.5 py-1">
                        <span className="text-xs font-bold text-emerald-600">+{totalCumulative} XP</span>
                        <span className="text-[10px] text-emerald-500">total</span>
                    </div>
                    {totalPenaltyAbs > 0 && (
                        <div className="flex items-center gap-1.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-2.5 py-1">
                            <span className="text-xs font-bold text-red-500">−{totalPenaltyAbs} XP</span>
                            <span className="text-[10px] text-red-400">{daysWithPenalty} hari penalti</span>
                        </div>
                    )}
                </div>
            )}

            {data.length === 0 ? (
                <p className="text-ink-muted text-sm py-10 text-center">Belum ada data EXP</p>
            ) : mode === 'cumulative' ? (
                <ResponsiveContainer width="100%" height={220} minWidth={1} minHeight={1} style={{ touchAction: 'pan-y' }}>
                    <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="expCumulGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%"  stopColor="#10b981" stopOpacity={0.25} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0.01} />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="label"
                            tick={{ fontSize: 10 }}
                            tickLine={false}
                            axisLine={false}
                            interval="preserveStartEnd"
                        />
                        <YAxis
                            tick={{ fontSize: 10 }}
                            tickLine={false}
                            axisLine={false}
                            width={36}
                        />
                        <Tooltip content={<CumulativeTip />} isAnimationActive={false} />
                        <Area
                            type="monotone"
                            dataKey="cumulative"
                            stroke="#10b981"
                            strokeWidth={2.5}
                            fill="url(#expCumulGrad)"
                            dot={false}
                            activeDot={{ r: 4, strokeWidth: 0 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            ) : (
                <>
                    <ResponsiveContainer width="100%" height={220} minWidth={1} minHeight={1} style={{ touchAction: 'pan-y' }}>
                        <BarChart
                            data={data}
                            margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
                            barCategoryGap="38%"
                        >
                            <XAxis
                                dataKey="label"
                                tick={{ fontSize: 10 }}
                                tickLine={false}
                                axisLine={false}
                                interval="preserveStartEnd"
                            />
                            <YAxis
                                tick={{ fontSize: 10 }}
                                tickLine={false}
                                axisLine={false}
                                width={42}
                            />
                            <ReferenceLine y={0} stroke="var(--color-line-strong)" strokeWidth={1.5} />
                            <Tooltip content={<DailyTip />} cursor={{ fill: 'var(--color-surface-2)', opacity: 0.5 }} isAnimationActive={false} />
                            <Bar dataKey="net" maxBarSize={48} radius={[4, 4, 4, 4]}>
                                {data.map((entry, i) => (
                                    <Cell
                                        key={i}
                                        fill={entry.net >= 0 ? '#10b981' : '#ef4444'}
                                        fillOpacity={0.85}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                    <div className="flex gap-5 mt-2 justify-center">
                        <span className="flex items-center gap-1.5 text-[11px] font-semibold text-ink-muted">
                            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
                            Net Positif
                        </span>
                        <span className="flex items-center gap-1.5 text-[11px] font-semibold text-ink-muted">
                            <span className="w-2.5 h-2.5 rounded-sm bg-red-400 inline-block" />
                            Net Negatif (kena penalti)
                        </span>
                    </div>
                </>
            )}
        </div>
    );
}
