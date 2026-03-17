'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getLinkedProfiles } from '@/lib/db';
import { UserProfile } from '@/types';
import Card from '@/components/ui/Card';
import ExpBar from '@/components/ui/ExpBar';
import Button from '@/components/ui/Button';

export default function DashboardPage() {
    const { user, profile, loading } = useAuth();
    const router = useRouter();

    // GM specific
    const [linkedPartners, setLinkedPartners] = useState<UserProfile[]>([]);

    useEffect(() => {
        if (!loading && !user) router.push('/login');
        if (profile?.role === 'gm' && profile?.partnerIds && profile.partnerIds.length > 0) {
            getLinkedProfiles(profile.partnerIds).then(partners => {
                setLinkedPartners(partners.filter(p => p.role === 'player'));
            });
        }
    }, [user, loading, router, profile]);

    if (loading || !profile) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0f0a1e 0%, #1a0a2e 100%)' }}>
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-violet-400 font-bold tracking-widest text-xs uppercase animate-pulse">Memuat data petualangan...</p>
                </div>
            </div>
        );
    }

    const hasPartner = profile.partnerIds && profile.partnerIds.length > 0;

    // ─── GM DASHBOARD ────────────────────────────────────────
    if (profile.role === 'gm') {
        return (
            <div className="min-h-screen p-4 md:p-8 text-slate-800 relative" style={{ background: 'linear-gradient(135deg, #E9D5FF 0%, #FBCFE8 100%)', fontFamily: 'var(--font-nunito), sans-serif' }}>
                <div className="max-w-6xl mx-auto mt-2 md:mt-6 relative z-10 space-y-6 md:space-y-8">
                    <header className="text-center md:text-left mb-6 md:mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="w-full md:w-auto">
                            <span className="text-4xl mb-2 block drop-shadow-md">👑</span>
                            <h1 className="text-3xl md:text-4xl font-bold text-purple-950" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                                Selamat Datang, GM {profile.displayName}
                            </h1>
                            <p className="text-purple-700/80 font-medium mt-1 text-sm md:text-base">Pantau progres anggota guild-mu hari ini.</p>
                        </div>
                        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
                            <button onClick={() => router.push('/gm/guild-quest')} className="w-full sm:w-auto bg-gradient-to-r from-violet-600 to-fuchsia-500 px-6 py-3 md:py-4 rounded-full text-white font-bold shadow-[0_10px_30px_rgba(139,92,246,0.3)] hover:-translate-y-1 transition-all text-sm md:text-base">
                                Guild Quest ⚔️
                            </button>
                            <button onClick={() => router.push('/gm/quests')} disabled={!hasPartner} className="w-full sm:w-auto bg-purple-600 px-8 py-3 md:py-4 rounded-full text-white font-bold shadow-[0_10px_30px_rgba(168,85,247,0.3)] hover:-translate-y-1 disabled:opacity-50 transition-all text-sm md:text-base">
                                Buat Quest Baru
                            </button>
                        </div>
                    </header>

                    <div>
                        <h2 className="text-2xl font-bold text-purple-900 mb-4 text-center md:text-left" style={{ fontFamily: 'var(--font-playfair), serif' }}>Pantauan Hero</h2>
                        {!hasPartner ? (
                            <Card className="text-center py-12 md:py-16 bg-white/50 backdrop-blur-sm border-dashed border-purple-200 mx-auto max-w-2xl">
                                <span className="text-4xl md:text-5xl block mb-3 opacity-50">🧭</span>
                                <p className="text-purple-800 font-bold text-lg mb-1">Guild Masih Kosong</p>
                                <p className="text-purple-600/70 mb-6 text-sm md:text-base">Belum ada Hero yang bisa kamu pantau dan beri tugas.</p>
                                <Button onClick={() => router.push('/network')} variant="primary" className="w-full sm:w-auto">Undang Hero Sekarang</Button>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                                {linkedPartners.map(hero => (
                                    <Card key={hero.uid} className="flex flex-col items-center text-center hover:-translate-y-1 transition-transform border-2 border-purple-100 shadow-sm bg-white p-5 md:p-6">
                                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white flex items-center justify-center mb-3 border-2 border-purple-200 overflow-hidden shadow-sm">
                                            <img
                                                src={hero.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(hero.displayName)}&background=fce7f3&color=db2777&bold=true`}
                                                alt={hero.displayName}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <h3 className="font-bold text-lg md:text-xl text-purple-950">{hero.displayName}</h3>
                                        <p className="text-[10px] md:text-xs text-slate-500 mb-4 truncate w-full px-2">{hero.email}</p>
                                        <div className="w-full bg-purple-50 p-3 md:p-4 rounded-xl mb-4 border border-purple-100/50">
                                            <p className="text-[10px] md:text-xs font-bold text-purple-400 uppercase tracking-widest mb-1">Level {hero.level || 1}</p>
                                            <ExpBar currentExp={hero.exp || 0} maxExp={hero.expToNextLevel || 100} level={hero.level || 1} />
                                            <p className="text-[10px] font-bold text-purple-600 mt-2">{hero.exp || 0} / {hero.expToNextLevel || 100} EXP</p>
                                        </div>
                                        <Button variant="outline" className="w-full text-xs text-purple-600 border-purple-200 hover:bg-purple-50" onClick={() => router.push('/gm/hero-profile')}>
                                            Lihat Dossier Lengkap
                                        </Button>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // ─── HERO DASHBOARD (RPG Style) ────────────────────────
    const expPercent = Math.round(((profile.exp || 0) / (profile.expToNextLevel || 100)) * 100);
    const streakColor = (profile.streak || 0) >= 7 ? '#f97316' : (profile.streak || 0) >= 3 ? '#eab308' : '#94a3b8';

    return (
        <div
            className="min-h-screen relative overflow-hidden text-slate-800"
            style={{
                background: 'linear-gradient(135deg, #E9D5FF 0%, #F3E8FF 40%, #FBCFE8 100%)',
                fontFamily: 'var(--font-nunito), sans-serif'
            }}
        >
            {/* Atmospheric background orbs */}
            <div className="absolute top-[-10%] right-[-5%] w-[40rem] h-[40rem] bg-purple-400/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-5%] w-[30rem] h-[30rem] bg-pink-400/20 rounded-full blur-[100px] pointer-events-none" />

            {/* Scanline texture overlay (lightened) */}
            <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMiIgaGVpZ2h0PSIyIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIyIiBoZWlnaHQ9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvc3ZnPg==')] pointer-events-none opacity-50" />

            <div className="relative z-10 p-4 md:p-8 max-w-6xl mx-auto space-y-6 md:space-y-8">

                {/* ── TOP: Character Identity ── */}
                <section>
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
                        {/* Avatar with level ring */}
                        <div className="relative flex-shrink-0">
                            <div className="w-24 h-24 md:w-28 md:h-28 rounded-3xl overflow-hidden border-4 border-white shadow-[0_10px_30px_rgba(236,72,153,0.3)] bg-white">
                                <img
                                    src={profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.displayName)}&background=fce7f3&color=db2777&bold=true&size=200`}
                                    alt={profile.displayName}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            {/* Level badge */}
                            <div className="absolute -bottom-2 -right-2 bg-gradient-to-br from-purple-600 to-pink-500 text-white text-xs font-black px-3 py-1.5 rounded-xl shadow-lg border border-purple-200">
                                LV{profile.level || 1}
                            </div>
                        </div>

                        {/* Identity text */}
                        <div className="text-center md:text-left flex-1">
                            <p className="text-purple-600 text-[10px] tracking-[0.3em] uppercase font-bold mb-1">Hero Active</p>
                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-purple-950 leading-tight mb-1" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                                {profile.displayName}
                            </h1>
                            <p className="text-purple-700/80 font-bold text-sm md:text-base italic block w-full px-2 md:px-0">"{profile.title || 'Rookie Adventurer'}"</p>
                        </div>

                        {/* Streak Counter */}
                        <div className="flex-shrink-0">
                            <div className="relative bg-white/60 border border-purple-100/50 rounded-2xl p-4 md:p-5 text-center min-w-[100px] backdrop-blur-sm shadow-sm">
                                <div className="text-3xl md:text-4xl font-black mb-0.5" style={{ color: streakColor, textShadow: `0 2px 10px ${streakColor}40` }}>
                                    {profile.streak || 0}
                                </div>
                                <p className="text-purple-500 text-[10px] uppercase tracking-widest font-bold">Streak</p>
                                <div className="absolute -top-1 -right-1 text-base">🔥</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── EXP SOUL BAR ── */}
                <section>
                    <div className="bg-white/60 border border-purple-100/50 rounded-2xl p-5 md:p-6 backdrop-blur-sm shadow-sm">
                        <div className="flex justify-between items-baseline mb-3">
                            <div>
                                <p className="text-purple-500 text-[10px] uppercase tracking-widest font-bold">Experience</p>
                                <p className="text-purple-900 font-bold text-sm">Level {profile.level || 1} → {(profile.level || 1) + 1}</p>
                            </div>
                            <p className="text-pink-600 font-black text-lg">
                                <span>{profile.exp || 0}</span>
                                <span className="text-pink-400/60 text-sm"> / {profile.expToNextLevel || 100}</span>
                            </p>
                        </div>

                        {/* Custom soul bar */}
                        <div className="relative h-4 bg-purple-100/50 rounded-full overflow-hidden border border-purple-200">
                            {/* Glow track fill */}
                            <div
                                className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000"
                                style={{
                                    width: `${expPercent}%`,
                                    background: 'linear-gradient(90deg, #9333ea, #d946ef, #ec4899)',
                                    boxShadow: '0 0 10px rgba(236,72,153,0.4)',
                                }}
                            />
                            {/* Shimmer */}
                            <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.4)_50%,transparent_100%)] animate-[shimmer_2s_infinite]" />
                        </div>

                        <p className="text-purple-600/80 text-xs mt-2 font-medium">
                            Butuh <span className="text-purple-700 font-bold">{(profile.expToNextLevel || 100) - (profile.exp || 0)} EXP</span> lagi untuk level up
                        </p>
                    </div>
                </section>

                {/* ── STATS GRID ── */}
                <section>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                        {[
                            { label: 'Quest Selesai', value: profile.totalQuestsCompleted || 0, unit: '', color: '#9333ea', bg: 'bg-purple-50/80', border: 'border-purple-200' },
                            { label: 'Jam Fokus', value: profile.totalHoursWorked ? profile.totalHoursWorked.toFixed(1) : '0', unit: 'h', color: '#0891b2', bg: 'bg-cyan-50/80', border: 'border-cyan-200' },
                            { label: 'Day Streak', value: profile.streak || 0, unit: '', color: streakColor, bg: 'bg-amber-50/80', border: 'border-amber-200' },
                            { label: 'Total Level', value: profile.level || 1, unit: '', color: '#d97706', bg: 'bg-orange-50/80', border: 'border-orange-200' },
                        ].map(stat => (
                            <div key={stat.label} className={`${stat.bg} ${stat.border} border rounded-2xl p-4 md:p-5 text-center backdrop-blur-sm shadow-sm hover:-translate-y-1 transition-transform group`}>
                                <p className="text-3xl md:text-4xl font-black mb-1 transition-transform group-hover:scale-110" style={{ color: stat.color, textShadow: `0 2px 10px ${stat.color}30` }}>
                                    {stat.value}{stat.unit}
                                </p>
                                <p className="text-slate-500 text-[10px] uppercase tracking-widest font-bold">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── QUICK ACTIONS ── */}
                <section>
                    <h2 className="text-purple-600 text-[10px] uppercase tracking-widest font-bold mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">

                        {/* Quest Board */}
                        <button
                            onClick={() => router.push('/quest-board')}
                            className="group relative overflow-hidden bg-white border border-purple-200 rounded-2xl p-5 md:p-6 text-left hover:border-purple-400 hover:shadow-[0_15px_40px_rgba(168,85,247,0.15)] transition-all duration-300 shadow-sm"
                        >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-100 rounded-full blur-2xl group-hover:bg-purple-200 transition-colors" />
                            <p className="text-purple-500 text-[10px] uppercase tracking-widest font-bold mb-1">Misi Aktif</p>
                            <h3 className="text-purple-900 font-black text-xl mb-1">Quest Board</h3>
                            <p className="text-purple-600/70 text-xs">Lihat & submit semua misi dari GM</p>
                            <div className="mt-4 text-purple-600 font-bold text-xs group-hover:text-purple-700 transition-colors">Buka Board</div>
                        </button>

                        {/* Guild Quest */}
                        <button
                            onClick={() => router.push('/guild-quest')}
                            className="group relative overflow-hidden bg-white border border-pink-200 rounded-2xl p-5 md:p-6 text-left hover:border-pink-400 hover:shadow-[0_15px_40px_rgba(236,72,153,0.15)] transition-all duration-300 shadow-sm"
                        >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-pink-100 rounded-full blur-2xl group-hover:bg-pink-200 transition-colors" />
                            <p className="text-pink-500 text-[10px] uppercase tracking-widest font-bold mb-1">Kompetisi</p>
                            <h3 className="text-pink-900 font-black text-xl mb-1">Guild Quest</h3>
                            <p className="text-pink-600/70 text-xs">Quest terbuka — siapa cepat, dia dapat!</p>
                            <div className="mt-4 text-pink-600 font-bold text-xs group-hover:text-pink-700 transition-colors">Ambil Quest</div>
                        </button>

                        {/* Journal */}
                        <button
                            onClick={() => router.push('/journal')}
                            className="group relative overflow-hidden bg-white border border-cyan-200 rounded-2xl p-5 md:p-6 text-left hover:border-cyan-400 hover:shadow-[0_15px_40px_rgba(6,182,212,0.15)] transition-all duration-300 shadow-sm sm:col-span-2 lg:col-span-1"
                        >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-100 rounded-full blur-2xl group-hover:bg-cyan-200 transition-colors" />
                            <p className="text-cyan-500 text-[10px] uppercase tracking-widest font-bold mb-1">Catatan</p>
                            <h3 className="text-cyan-900 font-black text-xl mb-1">Jurnal</h3>
                            <p className="text-cyan-600/70 text-xs">Catat perjalananmu sebagai adventurer</p>
                            <div className="mt-4 text-cyan-600 font-bold text-xs group-hover:text-cyan-700 transition-colors">Buka Jurnal</div>
                        </button>
                    </div>
                </section>

                {/* ── No Partner State ── */}
                {!hasPartner && (
                    <section>
                        <div className="bg-white/60 border border-purple-100/50 rounded-2xl p-6 text-center backdrop-blur-sm shadow-sm">
                            <p className="text-purple-900 font-bold mb-1">Belum terhubung dengan Game Master</p>
                            <p className="text-purple-600/70 text-sm mb-4">Hubungkan akunmu dengan GM untuk mulai menerima quest.</p>
                            <button onClick={() => router.push('/network')} className="text-purple-600 hover:text-white font-bold text-sm border border-purple-200 hover:bg-purple-600 px-4 py-2 rounded-xl transition-all shadow-sm">
                                Cari GM
                            </button>
                        </div>
                    </section>
                )}

            </div>

            <style jsx>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </div>
    );
}