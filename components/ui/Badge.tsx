import React from 'react';
import { QuestDifficulty, QuestStatus, QuestCategory } from '@/types';

interface BadgeProps {
    children: React.ReactNode;
    variant?: QuestDifficulty | QuestStatus | QuestCategory | 'default' | string;
    className?: string;
}

const VARIANT_CLASSES: Record<string, string> = {
    // Difficulty ranks
    E: 'bg-success-soft text-success',
    D: 'bg-info-soft text-info',
    C: 'bg-brand-soft text-brand',
    B: 'bg-xp-soft text-xp',
    A: 'bg-warn-soft text-warn',
    S: 'bg-danger-soft text-danger',

    // Quest status
    pending: 'bg-info-soft text-info',
    in_progress: 'bg-warn-soft text-warn',
    active: 'bg-info-soft text-info',
    submitted: 'bg-brand-soft text-brand',
    approved: 'bg-success-soft text-success',
    rejected: 'bg-danger-soft text-danger',
    missed: 'bg-danger-soft text-danger',

    // Category
    daily: 'bg-brand-soft text-brand',
    weekly: 'bg-info-soft text-info',
    main: 'bg-xp-soft text-xp',
    side: 'bg-sky-soft text-sky',

    default: 'bg-surface-2 text-ink-soft',
};

export default function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
    const baseClasses =
        'inline-flex items-center px-3 py-1.5 rounded-full text-[11px] font-extrabold tracking-wider uppercase';
    const colorClasses = VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.default;

    return <span className={`${baseClasses} ${colorClasses} ${className}`}>{children}</span>;
}
