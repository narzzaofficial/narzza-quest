'use client';

import { Heart } from 'lucide-react';

export function HeartsStrip({ hearts }: { hearts: number }) {
    return (
        <div className="inline-flex items-center gap-1.5 bg-white/15 ring-1 ring-white/25 rounded-xl px-3 py-2">
            {Array.from({ length: 5 }).map((_, i) => (
                <Heart key={i} className={`w-4 h-4 ${i < hearts ? 'fill-white text-white' : 'text-white/40'}`} />
            ))}
        </div>
    );
}
