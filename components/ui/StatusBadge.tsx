import React from 'react';
import { QUEST_STATUS_META } from '@/constants/ui';
import type { QuestStatus } from '@/types';

/** Quest status pill (soft bg + colored label). */
export default function StatusBadge({
    status,
    className = '',
}: {
    status: QuestStatus;
    className?: string;
}) {
    const meta = QUEST_STATUS_META[status] ?? QUEST_STATUS_META.pending;
    return (
        <span
            className={`${meta.soft} text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full ${className}`}
            style={{ color: meta.color }}
        >
            {meta.label}
        </span>
    );
}
