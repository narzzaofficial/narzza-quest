import type { QuestCategory, QuestDifficulty, QuestStatus, UserStatusType, WorkloadLevel, WorkTaskPriority } from '@/types';

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

// ── User status & work task labels ────────────────────────────
export const STATUS_LABELS: Record<UserStatusType, string> = {
    busy: 'Sibuk', normal: 'Normal', relaxed: 'Santai', on_leave: 'Cuti', sick: 'Sakit',
};
export const STATUS_COLORS: Record<UserStatusType, string> = {
    busy: 'text-danger bg-danger-soft',
    normal: 'text-brand bg-brand-soft',
    relaxed: 'text-success bg-success-soft',
    on_leave: 'text-xp bg-xp-soft',
    sick: 'text-warn bg-warn-soft',
};
export const WORKLOAD_LABELS: Record<WorkloadLevel, string> = {
    high: 'Tinggi', medium: 'Sedang', low: 'Ringan',
};
export const PRIORITY_META: Record<WorkTaskPriority, { label: string; color: string; bg: string }> = {
    low:    { label: 'Rendah', color: 'text-ink-muted', bg: 'bg-surface-2'  },
    medium: { label: 'Sedang', color: 'text-brand',     bg: 'bg-brand-soft' },
    high:   { label: 'Tinggi', color: 'text-warn',      bg: 'bg-warn-soft'  },
    urgent: { label: 'Urgent', color: 'text-danger',    bg: 'bg-danger-soft'},
};

// ── Date / time labels (Indonesian) ───────────────────────────
export const DAY_NAMES_SHORT  = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'] as const;
export const MONTH_NAMES_SHORT = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agt','Sep','Okt','Nov','Des'] as const;
export const MONTH_NAMES_FULL  = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'] as const;

// ── Activity category display ──────────────────────────────────
export const ACTIVITY_CAT_COLORS: Record<string, string> = {
    work: '#3b82f6', learning: '#a855f7', health: '#f43f5e',
    social: '#f59e0b', personal: '#14b8a6', rest: '#6366f1', commute: '#f97316',
};
export const ACTIVITY_CAT_LABELS: Record<string, string> = {
    work: 'Kerja', learning: 'Belajar', health: 'Kesehatan',
    social: 'Sosial', personal: 'Personal', rest: 'Istirahat', commute: 'Perjalanan',
};

// ── Calendar quest ribbon colors ───────────────────────────────
export const QUEST_STATUS_RIBBON: Record<string, string> = {
    approved:    'bg-success-soft text-success',
    submitted:   'bg-brand-soft text-brand',
    in_progress: 'bg-warn-soft text-warn',
    rejected:    'bg-danger-soft text-danger',
};
