'use client';

import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export default function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div 
      className={`bg-white border border-purple-100 rounded-3xl p-6 md:p-8 shadow-[0_10px_40px_rgba(168,85,247,0.08)] ${className}`}
      style={{ fontFamily: 'var(--font-nunito), sans-serif', ...props.style }}
      {...props}
    >
      {children}
    </div>
  );
}