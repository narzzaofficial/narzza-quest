import React from 'react';
import { GRAD } from '@/constants/ui';

interface ExpBarProps {
  currentExp: number;
  maxExp: number;
  level: number;
  className?: string;
}

export default function ExpBar({ currentExp, maxExp, level, className = '' }: ExpBarProps) {
  const percentage = Math.min(100, Math.max(0, (currentExp / maxExp) * 100));

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between items-end mb-2">
        <span className="text-sm font-extrabold tracking-wider text-ink">LVL {level}</span>
        <span className="text-xs font-bold text-ink-muted">
          {currentExp} / {maxExp} EXP
        </span>
      </div>

      {/* Track */}
      <div className="h-3 w-full bg-surface-2 rounded-full overflow-hidden relative">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${percentage}%`, backgroundImage: GRAD.brand }}
        />
      </div>
    </div>
  );
}
