'use client';

import React from 'react';

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
      <div className="flex justify-between items-end mb-2 text-purple-900" style={{ fontFamily: 'var(--font-nunito), sans-serif' }}>
        <span className="text-sm font-extrabold tracking-wider">LVL {level}</span>
        <span className="text-xs font-bold text-purple-400">
          {currentExp} / {maxExp} EXP
        </span>
      </div>
      
      {/* Track Background */}
      <div className="h-3.5 w-full bg-purple-100 rounded-full overflow-hidden relative shadow-inner">
        {/* Progress Fill */}
        <div 
          className="h-full rounded-full transition-all duration-1000 ease-out relative"
          style={{
            width: `${percentage}%`,
            background: 'linear-gradient(90deg, #A855F7 0%, #EC4899 100%)',
          }}
        >
          {/* Shine Effect */}
          <div 
            className="absolute top-0 left-0 w-full h-[2px] bg-white/30"
          />
        </div>
      </div>
    </div>
  );
}