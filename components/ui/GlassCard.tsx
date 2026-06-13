import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

/** Standard frosted-glass surface used across the app. */
export default function GlassCard({ children, className = '', ...props }: GlassCardProps) {
    return (
        <div className={`glass rounded-card shadow-card ${className}`} {...props}>
            {children}
        </div>
    );
}
