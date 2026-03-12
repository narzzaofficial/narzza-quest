'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getLinkedProfiles } from '@/lib/db';
import { UserProfile } from '@/types';
import Card from '@/components/ui/Card';
import ExpBar from '@/components/ui/ExpBar';
import { Users, BookOpen, Send, UserCircle2, ShieldAlert, Award, Shield } from 'lucide-react';

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

    // Ambil data Hero yang sedang dipilih dari array
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
    const heroAvatarUrl = heroProfile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(heroProfile.displayName)}&background=f3e8ff&color=9333ea&bold=true&size=200`;

    return (
        <div
            className="min-h-screen p-4 md:p-8 relative overflow-hidden text-slate-800"
            style={{
                background: 'linear-gradient(135deg, #F8FAFC 0%, #F3E8FF 100%)',
                fontFamily: 'var(--font-nunito), sans-serif'
            }}
        >
            <div className="max-w-xl mx-auto relative z-10 pt-2 md:pt-4">

                {/* Header Minimalis */}
                <header className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-purple-950" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                        Hero Dossier
                    </h1>
                    <p className="text-purple-600/70 text-sm font-medium mt-1">Status dan Statistik Partnermu</p>
                </header>

                {/* DROPDOWN PEMILIH HERO */}
                <div className="mb-6 bg-white p-4 rounded-2xl border border-purple-100 shadow-sm flex flex-col sm:flex-row items-center gap-4 justify-between">
                    <div className="flex items-center gap-2 text-purple-900 font-bold text-sm uppercase tracking-widest">
                        <Users className="w-4 h-4" />
                        <span>Pilih Hero:</span>
                    </div>
                    <select
                        value={selectedHeroId}
                        onChange={(e) => setSelectedHeroId(e.target.value)}
                        className="w-full sm:w-64 p-3 rounded-xl border border-purple-200 bg-purple-50 font-bold text-purple-800 focus:ring-2 focus:ring-purple-400 focus:outline-none cursor-pointer transition-all"
                    >
                        {linkedHeroes.map(hero => (
                            <option key={hero.uid} value={hero.uid}>
                                {hero.displayName} (Lv. {hero.level})
                            </option>
                        ))}
                    </select>
                </div>

                {/* ─── KARTU IDENTITAS HERO (CLEAN) ─── */}
                <Card className="p-6 md:p-8 border-purple-100 shadow-[0_10px_40px_rgba(168,85,247,0.08)] bg-white overflow-hidden">

                    {/* FOTO PROFIL HERO (SYNCED) */}
                    <div className="flex justify-center mb-6">
                        <div className="w-28 h-28 rounded-3xl border-4 border-purple-50 overflow-hidden shadow-md bg-slate-50">
                            <img
                                src={heroAvatarUrl}
                                alt={heroProfile.displayName}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>

                    {/* Info Utama */}
                    <div className="text-center mb-8">
                        <h2 className="text-2xl md:text-3xl font-bold text-purple-950 mb-1" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                            {heroProfile.displayName}
                        </h2>
                        <p className="text-pink-500 font-bold flex items-center justify-center gap-1">
                            <Award className="w-4 h-4" />
                            {heroProfile.title || "Rookie Adventurer"}
                        </p>
                        <p className="text-sm font-medium text-slate-400 mt-1">{heroProfile.email}</p>
                    </div>

                    {/* Area Level & EXP */}
                    <div className="bg-purple-50 rounded-2xl p-5 border border-purple-100 mb-6">
                        <div className="flex justify-between items-end mb-3">
                            <span className="font-bold text-purple-900 flex items-center gap-1.5">
                                <Shield className="w-4 h-4 text-purple-600" />
                                Level {heroProfile.level}
                            </span>
                            <span className="text-xs font-bold text-purple-600">
                                {heroProfile.exp} / {heroProfile.expToNextLevel} EXP
                            </span>
                        </div>
                        <ExpBar currentExp={heroProfile.exp} maxExp={heroProfile.expToNextLevel} level={heroProfile.level} />
                        <p className="text-[10px] text-center text-purple-400 mt-4 font-bold uppercase tracking-wider">
                            Butuh {heroProfile.expToNextLevel - heroProfile.exp} EXP untuk naik pangkat
                        </p>
                    </div>

                    {/* Grid Statistik */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-center">
                            <p className="text-2xl font-black text-purple-900 leading-none mb-1" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                                {heroProfile.totalQuestsCompleted || 0}
                            </p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Quest</p>
                        </div>

                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-center">
                            <p className="text-2xl font-black text-purple-900 leading-none mb-1" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                                {heroProfile.totalHoursWorked ? heroProfile.totalHoursWorked.toFixed(1) : 0}
                            </p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Jam</p>
                        </div>

                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-center">
                            <p className="text-2xl font-black text-pink-500 leading-none mb-1" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                                {heroProfile.streak || 0}
                            </p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Streak</p>
                        </div>
                    </div>
                </Card>

                {/* Tombol Aksi Cepat */}
                <div className="flex flex-col sm:flex-row gap-3 pt-6">
                    <button
                        onClick={() => router.push('/journal')}
                        className="w-full py-4 rounded-xl font-bold text-sm bg-white border border-purple-200 text-purple-700 hover:bg-purple-50 transition-colors shadow-sm flex items-center justify-center gap-2"
                    >
                        <BookOpen className="w-4 h-4" /> Lihat Jurnal Hero
                    </button>

                    <button
                        onClick={() => router.push('/gm/encourage')}
                        className="w-full py-4 rounded-xl font-bold text-sm bg-gradient-to-r from-pink-500 to-rose-400 text-white shadow-[0_4px_15px_rgba(236,72,153,0.3)] hover:-translate-y-0.5 transition-transform flex items-center justify-center gap-2"
                    >
                        <Send className="w-4 h-4" /> Kirim Semangat
                    </button>
                </div>

            </div>
        </div>
    );
}