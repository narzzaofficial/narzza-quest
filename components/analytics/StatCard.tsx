'use client';

import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface StatCardProps {
    icon: React.ElementType;
    label: string;
    value: string | number;
    sub?: string;
    color?: string;
    bg?: string;
    /** Percent change vs the previous period. `goodWhenUp` flips which direction counts as positive (e.g. expense going up is bad). */
    trend?: { pct: number | null; goodWhenUp?: boolean; periodLabel?: string };
}

export function StatCard({ icon: Icon, label, value, sub, color = 'text-brand', bg = 'bg-brand-soft', trend }: StatCardProps) {
    const showTrend = trend && trend.pct !== null && Number.isFinite(trend.pct);
    const isUp = showTrend && trend!.pct! >= 0;
    const isGood = showTrend && (trend!.goodWhenUp === false ? !isUp : isUp);

    return (
        <div className="glass rounded-card shadow-card p-4">
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center ${color} mb-3`}>
                <Icon className="w-4 h-4" />
            </div>
            <p className="text-2xl font-extrabold text-ink">{value}</p>
            <p className="text-ink-muted text-[10px] uppercase tracking-widest font-bold mt-0.5">{label}</p>
            {sub && <p className="text-ink-soft text-xs mt-1">{sub}</p>}
            {showTrend && (
                <p className={`flex items-center gap-1 text-xs font-bold mt-1.5 ${isGood ? 'text-success' : 'text-danger'}`}>
                    {isUp ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                    {Math.abs(trend!.pct!).toFixed(0)}% {trend!.periodLabel ?? 'vs sebelumnya'}
                </p>
            )}
        </div>
    );
}
