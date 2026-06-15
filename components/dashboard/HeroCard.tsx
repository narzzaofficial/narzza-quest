'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { GRAD } from '@/constants/ui';
import { dicebearAvatar } from '@/lib/avatar';
import type { UserProfile } from '@/types';

export function HeroCard({ hero }: { hero: UserProfile }) {
    const pct = Math.min(100, Math.round(((hero.exp || 0) / (hero.expToNextLevel || 100)) * 100));
    return (
        <div className="glass rounded-card p-5 shadow-card flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-brand/15 bg-surface mb-3">
                <img src={hero.avatar || dicebearAvatar(hero.displayName)} alt={hero.displayName} className="w-full h-full object-cover" />
            </div>
            <h3 className="font-bold text-lg text-ink">{hero.displayName}</h3>
            <p className="text-ink-muted text-xs mb-4 truncate w-full px-2">{hero.email}</p>
            <div className="w-full rounded-xl bg-surface-2 p-3 mb-4">
                <p className="text-ink-muted text-[10px] uppercase tracking-widest font-bold mb-2">Level {hero.level || 1}</p>
                <div className="h-2 w-full bg-surface rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundImage: GRAD.brand }} />
                </div>
                <p className="text-ink-soft text-[10px] font-bold mt-2">{hero.exp || 0} / {hero.expToNextLevel || 100} EXP</p>
            </div>
            <Link href="/gm/hero-profile" className="w-full inline-flex items-center justify-center gap-1 rounded-xl border border-line px-4 py-2 text-xs font-bold text-brand hover:bg-brand-soft transition-colors">
                Lihat Dossier <ChevronRight className="w-3.5 h-3.5" />
            </Link>
        </div>
    );
}
