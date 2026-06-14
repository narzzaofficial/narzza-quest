import type { GoalProfile } from '@/types';

/** Preset focus areas the user can tag their goal with. */
export const FOCUS_AREAS = [
    'Coding',
    'Bahasa',
    'Bisnis',
    'Karier',
    'Fitness',
    'Kreatif',
    'Belajar',
    'Keuangan',
    'Spiritual',
    'Hobi',
] as const;

/** True when the user has set a meaningful goal. */
export function hasGoal(goal?: GoalProfile | null): boolean {
    return !!(goal && goal.aspiration && goal.aspiration.trim().length > 0);
}

/** Flatten a goal into a single string used as the AI's primary anchor. */
export function formatGoal(goal?: GoalProfile | null): string {
    if (!hasGoal(goal)) return '';
    const g = goal!;
    const parts = [g.aspiration.trim()];
    if (g.focusAreas?.length) parts.push(`Area fokus: ${g.focusAreas.join(', ')}.`);
    if (g.timeframe) parts.push(`Target waktu: ${g.timeframe}.`);
    return parts.join(' ');
}
