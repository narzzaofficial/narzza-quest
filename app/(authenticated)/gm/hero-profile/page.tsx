'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useLinkedHeroes } from '@/hooks/useLinkedHeroes';
import GlassCard from '@/components/ui/GlassCard';
import StatTile from '@/components/ui/StatTile';
import ExpBar from '@/components/ui/ExpBar';
import EmptyState from '@/components/ui/EmptyState';
import { Users, BookOpen, Send, ShieldAlert, Award, Shield, CheckCircle2, Clock, Flame, Loader2 } from 'lucide-react';
import { dicebearAvatar } from '@/lib/avatar';

export default function GMHeroProfilePage() {
    const { profile, loading: authLoading } = useAuth();
    const { heroes: linkedHeroes, selectedHeroId, setSelectedHeroId, selectedHero: hero, loading: loadingHeroes } = useLinkedHeroes(profile);

    if (authLoading || loadingHeroes) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-brand animate-spin" />
            </div>
        );
    }

    if (!profile?.partnerIds || profile.partnerIds.length === 0 || linkedHeroes.length === 0) {
        return (
            <div className="p-4 md:p-8 max-w-6xl mx-auto">
                <EmptyState
                    icon={ShieldAlert}
                    title="Belum ada Hero"
                    desc="Kamu belum terhubung dengan hero mana pun. Undang anggota dulu."
                    action={<Link href="/network" className="inline-flex items-center gap-2 rounded-xl bg-brand text-white px-5 py-2.5 font-bold text-sm hover:bg-brand-hover transition">Buka Network</Link>}
                />
            </div>
        );
    }

    if (!hero) return null;

    const heroAvatar = hero.avatar || dicebearAvatar(hero.displayName, 250);
    const expRemaining = (hero.expToNextLevel || 100) - (hero.exp || 0);

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
            {/* Header + selector */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <p className="text-brand font-extrabold text-[10px] tracking-widest uppercase mb-1 flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5" /> Database Guild
                    </p>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-ink">Hero Dossier</h1>
                </div>
                <div className="flex items-center gap-2 glass p-1.5 rounded-2xl shadow-card w-full md:w-auto md:max-w-xs">
                    <div className="pl-2 text-ink-muted hidden sm:block shrink-0"><Users className="w-5 h-5" /></div>
                    <select
                        value={selectedHeroId}
                        onChange={(e) => setSelectedHeroId(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-surface font-bold text-ink outline-none focus:ring-2 focus:ring-brand/15 cursor-pointer border border-line truncate"
                    >
                        {linkedHeroes.map((h) => (
                            <option key={h.uid} value={h.uid}>{h.displayName} (Lv. {h.level || 1})</option>
                        ))}
                    </select>
                </div>
            </div>

            <GlassCard className="flex flex-col lg:flex-row p-6 lg:p-8 gap-8">
                {/* Identity */}
                <div className="flex flex-col items-center text-center lg:w-[35%] lg:border-r border-line lg:pr-10">
                    <div className="w-32 h-32 lg:w-36 lg:h-36 rounded-2xl overflow-hidden ring-4 ring-brand/10 bg-surface mb-4">
                        <img src={heroAvatar} alt={hero.displayName} className="w-full h-full object-cover" />
                    </div>
                    <h2 className="text-2xl font-extrabold text-ink mb-1.5">{hero.displayName}</h2>
                    <span className="inline-flex items-center gap-1.5 text-brand font-bold text-sm bg-brand-soft px-3 py-1 rounded-full mb-2">
                        <Award className="w-4 h-4" /> {hero.title || 'Rookie Adventurer'}
                    </span>
                    <p className="text-xs font-medium text-ink-muted mb-6 truncate w-full px-4">{hero.email}</p>

                    <div className="flex flex-col sm:flex-row lg:flex-col w-full gap-3 mt-auto">
                        <Link href="/journal" className="w-full py-3 rounded-xl font-bold text-xs bg-surface-2 text-ink-soft hover:bg-brand-soft hover:text-brand border border-line transition-colors flex items-center justify-center gap-2">
                            <BookOpen className="w-4 h-4" /> Lihat Jurnal
                        </Link>
                        <Link href="/gm/encourage" className="w-full py-3 rounded-xl font-bold text-xs bg-brand text-white shadow-card hover:bg-brand-hover transition flex items-center justify-center gap-2">
                            <Send className="w-4 h-4" /> Kirim Semangat
                        </Link>
                    </div>
                </div>

                {/* Stats */}
                <div className="flex flex-col justify-center lg:w-[65%] gap-5">
                    <div className="bg-brand-soft rounded-card p-6">
                        <p className="text-[10px] text-brand font-black uppercase tracking-widest mb-1">Current Rank</p>
                        <p className="text-2xl font-black text-ink mb-4">Level {hero.level || 1}</p>
                        <ExpBar currentExp={hero.exp || 0} maxExp={hero.expToNextLevel || 100} level={hero.level || 1} />
                        <p className="text-xs text-ink-soft mt-4">Butuh <span className="font-bold text-brand">{expRemaining} EXP</span> lagi untuk naik pangkat.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <StatTile icon={CheckCircle2} label="Quest Selesai" value={hero.totalQuestsCompleted || 0} grad="brand" />
                        <StatTile icon={Clock} label="Jam Fokus" value={`${(hero.totalHoursWorked || 0).toFixed(1)}h`} grad="sky" />
                        <StatTile icon={Flame} label="Day Streak" value={hero.streak || 0} grad="amber" />
                    </div>
                </div>
            </GlassCard>
        </div>
    );
}
