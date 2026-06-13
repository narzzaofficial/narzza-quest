import React from 'react';

interface EmptyStateProps {
    icon?: React.ElementType;
    title: string;
    desc?: string;
    action?: React.ReactNode;
    className?: string;
}

/** Friendly empty-state panel. */
export default function EmptyState({ icon: Icon, title, desc, action, className = '' }: EmptyStateProps) {
    return (
        <div className={`glass rounded-card p-10 text-center shadow-card ${className}`}>
            {Icon && <Icon className="w-9 h-9 text-ink-muted mx-auto mb-3" />}
            <p className="text-ink font-bold mb-1">{title}</p>
            {desc && <p className="text-ink-soft text-sm mb-4">{desc}</p>}
            {action}
        </div>
    );
}
