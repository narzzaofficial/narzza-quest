'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loading() {
    return (
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-surface">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-10 h-10 text-brand animate-spin" />
                <p className="text-ink-muted text-sm font-bold tracking-widest uppercase">Memuat...</p>
            </div>
        </div>
    );
}
