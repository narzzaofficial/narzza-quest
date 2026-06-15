'use client';

import React from 'react';

interface StatCardProps {
    icon: React.ElementType;
    label: string;
    value: string | number;
    sub?: string;
    color?: string;
    bg?: string;
}

export function StatCard({ icon: Icon, label, value, sub, color = 'text-brand', bg = 'bg-brand-soft' }: StatCardProps) {
    return (
        <div className="glass rounded-card shadow-card p-4">
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center ${color} mb-3`}>
                <Icon className="w-4 h-4" />
            </div>
            <p className="text-2xl font-extrabold text-ink">{value}</p>
            <p className="text-ink-muted text-[10px] uppercase tracking-widest font-bold mt-0.5">{label}</p>
            {sub && <p className="text-ink-soft text-xs mt-1">{sub}</p>}
        </div>
    );
}
