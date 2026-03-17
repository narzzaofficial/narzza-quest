'use client';

import React from 'react';
import { QuestDifficulty, QuestStatus, QuestCategory } from '@/types';

interface BadgeProps {
    children: React.ReactNode;
    variant?: QuestDifficulty | QuestStatus | QuestCategory | 'default' | string;
    className?: string;
}

export default function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
    const baseClasses = 'inline-flex items-center px-3 py-1.5 rounded-full text-[11px] font-extrabold tracking-wider uppercase border transition-colors shadow-sm';

    let colorClasses = '';

    switch (variant) {
        // ─── DIFFICULTY RANKS ───
        case 'E':
        case 'D':
            colorClasses = 'bg-slate-50 text-slate-500 border-slate-200';
            break;
        case 'C':
            colorClasses = 'bg-emerald-50 text-emerald-600 border-emerald-200';
            break;
        case 'B':
            colorClasses = 'bg-blue-50 text-blue-600 border-blue-200';
            break;
        case 'A':
            colorClasses = 'bg-rose-50 text-rose-600 border-rose-200';
            break;
        case 'S':
            colorClasses = 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-200 shadow-md';
            break;

        // ─── QUEST STATUS ───
        case 'pending':
            colorClasses = 'bg-slate-50 text-slate-500 border-slate-200';
            break;
        case 'in_progress':
            colorClasses = 'bg-amber-50 text-amber-600 border-amber-200';
            break;
        case 'submitted':
            colorClasses = 'bg-blue-50 text-blue-600 border-blue-200';
            break;
        case 'approved':
            colorClasses = 'bg-emerald-50 text-emerald-600 border-emerald-200';
            break;
        case 'rejected':
            colorClasses = 'bg-rose-50 text-rose-600 border-rose-200';
            break;
        case 'missed':
            colorClasses = 'bg-slate-200 text-slate-700 border-slate-300';
            break;

        // ─── KATEGORI (UPDATED!) ───
        case 'daily':
            colorClasses = 'bg-purple-50 text-purple-700 border-purple-200';
            break;
        case 'weekly':
            colorClasses = 'bg-indigo-50 text-indigo-700 border-indigo-200';
            break;
        case 'main':
            colorClasses = 'bg-amber-50 text-amber-700 border-amber-200';
            break;
        case 'side':
            colorClasses = 'bg-teal-50 text-teal-700 border-teal-200';
            break;

        default:
            colorClasses = 'bg-slate-50 text-slate-500 border-slate-200';
    }

    return (
        <span
            className={`${baseClasses} ${colorClasses} ${className}`}
            style={{ fontFamily: 'var(--font-inter), sans-serif' }} // <-- FONT SUDAH DIGANTI
        >
            {children}
        </span>
    );
}
