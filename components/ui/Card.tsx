import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export default function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div
      className={`bg-surface border border-line rounded-card p-6 md:p-8 shadow-card ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
