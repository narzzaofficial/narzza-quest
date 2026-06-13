import React from 'react';
import { GRAD, type GradKey } from '@/constants/ui';

interface PageHeaderProps {
    icon?: React.ReactNode;
    title: string;
    subtitle?: string;
    badge?: string;
    grad?: GradKey;
    actions?: React.ReactNode;
}

/** Gradient banner header shared by all pages. */
export default function PageHeader({ icon, title, subtitle, badge, grad = 'brand', actions }: PageHeaderProps) {
    return (
        <header
            className="relative overflow-hidden rounded-card p-6 md:p-7 text-white shadow-card"
            style={{ backgroundImage: GRAD[grad] }}
        >
            <div className="absolute -top-16 -right-10 w-56 h-56 rounded-full bg-white/15 blur-2xl pointer-events-none" />
            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    {icon && (
                        <div className="w-12 h-12 rounded-xl bg-white/20 ring-1 ring-white/30 flex items-center justify-center shrink-0">
                            {icon}
                        </div>
                    )}
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-2xl md:text-3xl font-extrabold text-white">{title}</h1>
                            {badge && (
                                <span className="text-[10px] font-extrabold uppercase tracking-widest bg-white/20 ring-1 ring-white/30 px-2 py-0.5 rounded-full">
                                    {badge}
                                </span>
                            )}
                        </div>
                        {subtitle && <p className="text-white/80 text-sm mt-0.5">{subtitle}</p>}
                    </div>
                </div>
                {actions && <div className="flex flex-col sm:flex-row gap-3">{actions}</div>}
            </div>
        </header>
    );
}
