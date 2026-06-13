'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Puzzle } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';

export default function LogicArenaPage() {
    return (
        <div className="min-h-full p-4 flex flex-col items-center justify-center relative">
            <Link href="/arena" className="absolute top-6 left-6 inline-flex items-center gap-1.5 text-brand font-bold hover:text-brand-hover transition-colors">
                <ArrowLeft className="w-4 h-4" /> Arena
            </Link>
            <GlassCard className="max-w-lg w-full text-center p-8 md:p-12">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3 shadow-card" style={{ backgroundImage: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)' }}>🧩</div>
                <h1 className="text-3xl font-extrabold text-ink mb-1">Logic &amp; IQ</h1>
                <p className="text-ink-soft font-medium mb-2">Teka-teki logika untuk menaikkan Intelligence.</p>
                <span className="inline-block text-[10px] font-extrabold uppercase tracking-widest text-ink-muted bg-surface-2 px-3 py-1 rounded-full">
                    <Puzzle className="w-3.5 h-3.5 inline mr-1" /> Segera Hadir
                </span>
            </GlassCard>
        </div>
    );
}
