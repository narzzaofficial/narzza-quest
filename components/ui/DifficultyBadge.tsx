import React from 'react';
import { DIFFICULTY_COLOR } from '@/constants/ui';
import type { QuestDifficulty } from '@/types';

/** Colored E-S difficulty chip. */
export default function DifficultyBadge({
    difficulty,
    className = '',
}: {
    difficulty: QuestDifficulty;
    className?: string;
}) {
    return (
        <span
            className={`inline-flex items-center justify-center font-extrabold text-white rounded-lg px-2 py-0.5 text-xs ${className}`}
            style={{ backgroundColor: DIFFICULTY_COLOR[difficulty] }}
        >
            {difficulty}
        </span>
    );
}
