import React from 'react';
import { GRAD, type GradKey } from '@/constants/ui';

interface StatTileProps {
    icon: React.ElementType;
    label: string;
    value: React.ReactNode;
    grad?: GradKey;
}

/** Compact stat tile: gradient icon chip + value + label. */
export default function StatTile({ icon: Icon, label, value, grad = 'brand' }: StatTileProps) {
    return (
        <div className="glass rounded-card p-3 sm:p-4 shadow-card flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm" style={{ backgroundImage: GRAD[grad] }}>
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="min-w-0 w-full">
                <p className="text-xl sm:text-2xl font-extrabold text-ink leading-none">{value}</p>
                <p className="text-ink-muted text-[9px] sm:text-[10px] uppercase tracking-wide sm:tracking-widest font-bold mt-1 leading-tight wrap-break-word">{label}</p>
            </div>
        </div>
    );
}
