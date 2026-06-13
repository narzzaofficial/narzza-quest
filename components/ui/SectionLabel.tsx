import React from 'react';

/** Small uppercase section caption. */
export default function SectionLabel({
    children,
    className = '',
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <p className={`text-ink-muted text-[10px] uppercase tracking-widest font-bold ${className}`}>
            {children}
        </p>
    );
}
