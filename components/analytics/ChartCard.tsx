'use client';

import React from 'react';

interface ChartCardProps {
    title: string;
    sub?: string;
    children: React.ReactNode;
}

export function ChartCard({ title, sub, children }: ChartCardProps) {
    return (
        <div className="glass rounded-card shadow-card">
            <div className="p-5">
                <h3 className="text-ink font-extrabold text-base">{title}</h3>
                {sub && <p className="text-ink-muted text-xs mt-0.5 mb-4">{sub}</p>}
                {!sub && <div className="mb-4" />}
                {children}
            </div>
        </div>
    );
}
