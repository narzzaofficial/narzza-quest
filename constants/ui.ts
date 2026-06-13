import type { QuestCategory, QuestDifficulty, QuestStatus } from '@/types';

// Shared gradients for headers / icon chips / accents.
export const GRAD = {
    brand: 'linear-gradient(135deg, #4f7cff 0%, #38bdf8 100%)',
    sky: 'linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)',
    amber: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
    green: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
} as const;

export type GradKey = keyof typeof GRAD;

// Solid color per difficulty rank (uses design tokens).
export const DIFFICULTY_COLOR: Record<QuestDifficulty, string> = {
    E: 'var(--color-success)',
    D: 'var(--color-info)',
    C: 'var(--color-brand)',
    B: 'var(--color-xp)',
    A: 'var(--color-warn)',
    S: 'var(--color-danger)',
};

// Label + color + soft-bg class per quest status.
export const QUEST_STATUS_META: Record<QuestStatus, { label: string; color: string; soft: string }> = {
    pending: { label: 'Menunggu', color: 'var(--color-info)', soft: 'bg-info-soft' },
    in_progress: { label: 'Dikerjakan', color: 'var(--color-warn)', soft: 'bg-warn-soft' },
    active: { label: 'Aktif', color: 'var(--color-info)', soft: 'bg-info-soft' },
    submitted: { label: 'Disubmit', color: 'var(--color-brand)', soft: 'bg-brand-soft' },
    approved: { label: 'Selesai', color: 'var(--color-success)', soft: 'bg-success-soft' },
    rejected: { label: 'Ditolak', color: 'var(--color-danger)', soft: 'bg-danger-soft' },
    missed: { label: 'Terlewat', color: 'var(--color-danger)', soft: 'bg-danger-soft' },
};

export const CATEGORY_LABEL: Record<QuestCategory, string> = {
    daily: 'Harian',
    weekly: 'Mingguan',
    main: 'Utama',
    side: 'Sampingan',
};
