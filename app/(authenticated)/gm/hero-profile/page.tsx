'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getLinkedProfiles } from '@/lib/db';
import { UserProfile } from '@/types';
import Card from '@/components/ui/Card';
import ExpBar from '@/components/ui/ExpBar';
import { Users, BookOpen, Send, ShieldAlert, Award, Shield } from 'lucide-react';

export default function GMHeroProfilePage() {
    const { profile, loading: authLoading } = useAuth();
    const router = useRouter();

    const [linkedHeroes, setLinkedHeroes] = useState<UserProfile[]>([]);
    const [selectedHeroId, setSelectedHeroId] = useState<string>('');
    const [loadingHeroes, setLoadingHeroes] = useState(true);

    useEffect(() => {
        if (profile && profile.role === 'gm') {
            if (profile.partnerIds && profile.partnerIds.length > 0) {
                getLinkedProfiles(profile.partnerIds).then((data) => {
                    const heroesOnly = data.filter(p => p.role === 'player');
                    setLinkedHeroes(heroesOnly);
                    if (heroesOnly.length > 0) {
                        setSelectedHeroId(heroesOnly[0].uid);
                    }
                    setLoadingHeroes(false);
                }).catch((err) => {
                    console.error("Gagal menarik data Hero:", err);
                    setLoadingHeroes(false);
                });
            } else {
                setLoadingHeroes(false);
            }
        }
    }, [profile]);

    const heroProfile = linkedHeroes.find(h => h.uid === selectedHeroId);

    if (authLoading || loadingHeroes) {
        return <div className="min-h-screen flex items-center justify-center font-bold text-purple-600">Membuka arsip Guild...</div>;
    }

    if (!profile?.partnerIds || profile.partnerIds.length === 0 || linkedHeroes.length === 0) {
        return (
            <div className="min-h-screen p-6 flex flex-col items-center justify-center text-center bg-slate-50">
                <ShieldAlert className="w-16 h-16 text-purple-300 mb-4" />
                <h2 className="text-2xl font-bold text-purple-900 mb-2" style={{ fontFamily: 'var(--font-playfair), serif' }}>Belum Ada Hero</h2>
                <p className="text-purple-600/80 mb-6 text-sm max-w-sm">Kamu belum terhubung dengan Hero mana pun. Undang anggota ke Guild-mu terlebih dahulu.</p>
                <button onClick={() => router.push('/network')} className="px-6 py-3 bg-purple-600 hover:bg-purple-700 transition-colors text-white font-bold rounded-xl shadow-sm">
                    Buka Halaman Network
                </button>
            </div>
        );
    }

    if (!heroProfile) return null;

    // Fallback Avatar jika Hero belum upload foto
    const heroAvatarUrl = heroProfile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(heroProfile.displayName)}&background=fce7f3&color=db2777&bold=true&size=250`;

    return (
        <div
            className="min-h-screen p-4 md:p-6 lg:p-8 relative overflow-hidden text-slate-800 flex flex-col justify-center"
            style={{
                background: 'linear-gradient(135deg, #F8FAFC 0%, #F3E8FF 100%)',
                fontFamily: 'var(--font-nunito), sans-serif'
            }}
        >
            {/* Dekorasi Background */}
            <div className="absolute top-[-10%] right-[-5%] w-[40rem] h-[40rem] bg-purple-300/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-5%] w-[30rem] h-[30rem] bg-pink-300/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-5xl mx-auto w-full relative z-10 flex flex-col gap-6 md:gap-8">

                {/* ─── HEADER & SELECTOR (Satu Baris di Desktop) ─── */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/50 backdrop-blur-sm p-4 md:p-6 rounded-3xl border border-purple-100 shadow-sm overflow-hidden">
                    <header className="text-center md:text-left flex-shrink-0">
                        <p className="text-purple-500 font-extrabold text-[10px] tracking-widest uppercase mb-1 flex items-center justify-center md:justify-start gap-1.5">
                            <Shield className="w-3.5 h-3.5" /> Database Guild
                        </p>
                        <h1 className="text-3xl lg:text-4xl font-bold text-purple-950" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                            Hero Dossier
                        </h1>
                    </header>

                    {/* PERBAIKAN DROPDOWN DI SINI: max-w-full, min-w-0, text-ellipsis */}
                    <div className="flex items-center gap-2 w-full md:w-auto md:max-w-xs bg-white p-1.5 rounded-2xl border border-purple-100 shadow-sm overflow-hidden">
                        <div className="pl-2 text-purple-400 hidden sm:block flex-shrink-0">
                            <Users className="w-5 h-5" />
                        </div>
                        <div className="w-full flex-1 min-w-0">
                            <select
                                value={selectedHeroId}
                                onChange={(e) => setSelectedHeroId(e.target.value)}
                                className="w-full p-2.5 rounded-xl bg-purple-50/50 hover:bg-purple-50 font-bold text-purple-900 focus:ring-2 focus:ring-purple-400 focus:outline-none cursor-pointer transition-all border-transparent text-ellipsis overflow-hidden whitespace-nowrap"
                            >
                                {linkedHeroes.map(hero => (
                                    <option key={hero.uid} value={hero.uid}>
                                        {hero.displayName} (Lv. {hero.level || 1})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* ─── KARTU IDENTITAS HERO (LAYOUT HORIZONTAL / ROW) ─── */}
                <Card className="flex flex-col lg:flex-row p-6 lg:p-8 border-purple-100 shadow-[0_15px_50px_rgba(168,85,247,0.08)] bg-white overflow-hidden gap-8 lg:gap-10">

                    {/* KOLOM KIRI: Identitas & PP */}
                    <div className="flex flex-col items-center text-center lg:w-[35%] lg:border-r border-purple-100 lg:pr-10">
                        {/* Frame PP Hero */}
                        <div className="relative mb-5 group">
                            <div className="absolute inset-0 bg-gradient-to-tr from-purple-400 to-pink-400 rounded-full transform rotate-6 group-hover:rotate-12 transition-transform duration-500 opacity-20" />
                            <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-full border-4 border-white shadow-lg overflow-hidden relative z-10 bg-slate-50">
                                <img
                                    src={heroAvatarUrl}
                                    alt={heroProfile.displayName}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            </div>
                        </div>

                        <h2 className="text-2xl lg:text-3xl font-bold text-purple-950 mb-1.5" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                            {heroProfile.displayName}
                        </h2>
                        <p className="text-pink-500 font-bold text-sm flex items-center justify-center gap-1.5 mb-2 bg-pink-50 px-3 py-1 rounded-full border border-pink-100 inline-flex">
                            <Award className="w-4 h-4" />
                            {heroProfile.title || "Rookie Adventurer"}
                        </p>
                        <p className="text-xs font-medium text-slate-400 mb-8 truncate w-full px-4">{heroProfile.email}</p>

                        {/* Tombol Aksi di Kiri Bawah */}
                        <div className="flex flex-col sm:flex-row lg:flex-col w-full gap-3 mt-auto">
                            <button onClick={() => router.push('/journal')} className="w-full py-3.5 rounded-xl font-bold text-xs bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-100 transition-colors flex items-center justify-center gap-2">
                                <BookOpen className="w-4 h-4" /> Lihat Jurnal Hero
                            </button>
                            <button onClick={() => router.push('/gm/encourage')} className="w-full py-3.5 rounded-xl font-bold text-xs bg-gradient-to-r from-pink-500 to-rose-400 text-white shadow-md hover:-translate-y-0.5 transition-transform flex items-center justify-center gap-2">
                                <Send className="w-4 h-4" /> Kirim Semangat
                            </button>
                        </div>
                    </div>

                    {/* KOLOM KANAN: Statistik & Level */}
                    <div className="flex flex-col justify-center lg:w-[65%] gap-6">

                        {/* Area Level & EXP */}
                        <div className="bg-purple-50/50 rounded-3xl p-6 md:p-8 border border-purple-100/60 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200/30 rounded-bl-full pointer-events-none" />

                            <div className="flex justify-between items-end mb-4 relative z-10">
                                <div>
                                    <p className="text-[10px] text-purple-400 font-black uppercase tracking-widest mb-1">Current Rank</p>
                                    <span className="text-2xl lg:text-3xl font-black text-purple-900 flex items-center gap-2" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                                        Level {heroProfile.level || 1}
                                    </span>
                                </div>

                            </div>

                            <div className="relative z-10">
                                <ExpBar currentExp={heroProfile.exp || 0} maxExp={heroProfile.expToNextLevel || 100} level={heroProfile.level || 1} />
                            </div>

                            <p className="text-xs text-slate-500 mt-5 font-medium relative z-10 bg-white/60 p-3 rounded-xl border border-white inline-block">
                                Butuh <span className="font-bold text-pink-600">{(heroProfile.expToNextLevel || 100) - (heroProfile.exp || 0)} EXP</span> lagi untuk promosi ke pangkat berikutnya.
                            </p>
                        </div>

                        {/* Grid Statistik Horizontal */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-purple-200 hover:shadow-md transition-all flex flex-col items-center justify-center">
                                <p className="text-3xl font-black text-purple-900 leading-none mb-2" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                                    {heroProfile.totalQuestsCompleted || 0}
                                </p>
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Quest Selesai</p>
                            </div>

                            <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-purple-200 hover:shadow-md transition-all flex flex-col items-center justify-center">
                                <p className="text-3xl font-black text-purple-900 leading-none mb-2" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                                    {heroProfile.totalHoursWorked ? heroProfile.totalHoursWorked.toFixed(1) : 0}
                                </p>
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Jam Fokus</p>
                            </div>

                            <div className="bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-100 rounded-2xl p-5 hover:shadow-md transition-all flex flex-col items-center justify-center relative overflow-hidden">
                                <div className="absolute -right-2 -bottom-2 text-5xl opacity-20">🔥</div>
                                <p className="text-3xl font-black text-pink-600 leading-none mb-2 relative z-10" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                                    {heroProfile.streak || 0}
                                </p>
                                <p className="text-[10px] text-pink-400 font-black uppercase tracking-widest relative z-10">Day Streak</p>
                            </div>
                        </div>

                    </div>
                </Card>

            </div>
        </div>
    );
}