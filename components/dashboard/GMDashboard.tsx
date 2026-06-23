'use client';

import Link from 'next/link';
import { Crown, Swords, Users, Compass } from 'lucide-react';
import { GRAD } from '@/constants/ui';
import { PendingBanner } from '@/components/dashboard/PendingBanner';
import { HeroCard } from '@/components/dashboard/HeroCard';
import { MenuGrid } from '@/components/dashboard/MenuGrid';
import type { useDashboard } from '@/hooks/useDashboard';

type DashboardData = ReturnType<typeof useDashboard>;

export function GMDashboard({ d }: { d: DashboardData }) {
    const profile = d.profile!;

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
            <PendingBanner count={d.pendingCount} />

            <header className="relative overflow-hidden rounded-card p-6 md:p-7 text-white shadow-card" style={{ backgroundImage: GRAD.brand }}>
                <div className="absolute -top-16 -right-10 w-56 h-56 rounded-full bg-white/15 blur-2xl pointer-events-none" />
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white/20 ring-1 ring-white/30 flex items-center justify-center shrink-0">
                            <Crown className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-extrabold text-white">Selamat datang, GM {profile.displayName}</h1>
                            <p className="text-white/80 text-sm">Pantau progres anggota guild-mu hari ini.</p>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Link href="/gm/guild-quest" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/15 ring-1 ring-white/25 px-5 py-3 font-bold text-sm text-white hover:bg-white/25 transition-colors">
                            <Swords className="w-4 h-4" /> Guild Quest
                        </Link>
                        <Link
                            href="/gm/quests"
                            aria-disabled={!d.hasPartner}
                            className={`inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-sm text-brand shadow-card hover:bg-white/90 transition-colors ${!d.hasPartner ? 'opacity-50 pointer-events-none' : ''}`}
                        >
                            Buat Quest Baru
                        </Link>
                    </div>
                </div>
            </header>

            <MenuGrid role="gm" />

            <div>
                <p className="text-ink-muted text-[10px] uppercase tracking-widest font-bold mb-3">Pantauan Hero</p>
                {!d.hasPartner ? (
                    <div className="glass rounded-card border border-dashed border-line p-12 text-center shadow-card max-w-2xl mx-auto">
                        <Compass className="w-9 h-9 text-ink-muted mx-auto mb-3" />
                        <p className="text-ink font-bold text-lg mb-1">Guild Masih Kosong</p>
                        <p className="text-ink-soft text-sm mb-5">Belum ada Hero yang bisa kamu pantau dan beri tugas.</p>
                        <Link href="/network" className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 font-bold text-sm text-white hover:bg-brand-hover transition-colors">
                            <Users className="w-4 h-4" /> Undang Hero Sekarang
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {d.linkedPartners.map((hero) => (
                            <HeroCard key={hero.uid} hero={hero} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
