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
        <div className="glass rounded-card p-4 shadow-card">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 shadow-sm" style={{ backgroundImage: GRAD[grad] }}>
                <Icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-extrabold text-ink">{value}</p>
            <p className="text-ink-muted text-[10px] uppercase tracking-widest font-bold mt-0.5">{label}</p>
        </div>
    );
}
