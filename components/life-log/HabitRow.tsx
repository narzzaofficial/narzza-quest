'use client';

import { Check, Trash2 } from 'lucide-react';
import { FaBullseye } from 'react-icons/fa6';
import { HABIT_ICON_MAP, HABIT_ICON_COLORS } from '@/components/life-log/activityMeta';

interface Props {
    name: string;
    icon: string;
    completed: boolean;
    onToggle: () => void;
    onDelete: () => void;
}

export function HabitRow({ name, icon, completed, onToggle, onDelete }: Props) {
    const HabitIcon = HABIT_ICON_MAP[icon] ?? FaBullseye;
    const iconColor = HABIT_ICON_COLORS[icon] ?? '#ef4444';

    return (
        <div className="flex items-center gap-3 group">
            <button
                onClick={onToggle}
                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 ${
                    completed ? 'bg-brand border-brand text-white' : 'border-line hover:border-brand'
                }`}
            >
                {completed && <Check className="w-3.5 h-3.5" />}
            </button>
            <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all"
                style={{ backgroundColor: iconColor + (completed ? '18' : '20') }}
            >
                <HabitIcon
                    className="w-4 h-4"
                    style={{ color: completed ? iconColor + '80' : iconColor }}
                />
            </div>
            <span className={`flex-1 text-sm font-semibold ${completed ? 'line-through text-ink-muted' : 'text-ink'}`}>
                {name}
            </span>
            <button
                onClick={onDelete}
                className="opacity-0 group-hover:opacity-100 p-1 text-ink-muted hover:text-danger transition-all"
            >
                <Trash2 className="w-3.5 h-3.5" />
            </button>
        </div>
    );
}
