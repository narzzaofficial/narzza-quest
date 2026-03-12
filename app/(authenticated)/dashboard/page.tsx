'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { subscribeToQuests, getLinkedProfiles } from '@/lib/db';
import { Quest, UserProfile } from '@/types';
import Card from '@/components/ui/Card';
import ExpBar from '@/components/ui/ExpBar';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Wallet } from 'lucide-react';

export default function DashboardPage() {
    const { user, profile, loading } = useAuth();
    const router = useRouter();

    const [activeQuests, setActiveQuests] = useState<Quest[]>([]);
    const [loadingQuests, setLoadingQuests] = useState(true);

    // State untuk GM: melihat daftar Hero-nya
    const [linkedPartners, setLinkedPartners] = useState<UserProfile[]>([]);

    // 1. ROUTE PROTECTION & FETCH PARTNERS (Hanya buat GM)
    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }

        if (profile?.role === 'gm' && profile?.partnerIds && profile.partnerIds.length > 0) {
            getLinkedProfiles(profile.partnerIds).then(partners => {
                setLinkedPartners(partners.filter(p => p.role === 'player')); // Pastikan cuma Hero yang muncul
            });
        }
    }, [user, loading, router, profile]);

    // 2. FETCH REALTIME QUESTS (Khusus Hero)
    useEffect(() => {
        if (profile && profile.role === 'player') {
            const unsubscribe = subscribeToQuests(profile.uid, (quests) => {
                const filtered = quests.filter(q => q.status === 'in_progress' || q.status === 'pending');
                setActiveQuests(filtered);
                setLoadingQuests(false);
            });
            return () => unsubscribe();
        } else {
            setLoadingQuests(false);
        }
    }, [profile]);

    if (loading || !profile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-purple-50/30">
                <div className="animate-pulse flex flex-col items-center">
                    <span className="text-4xl mb-4">✨</span>
                    <p className="text-purple-600 font-bold">Memuat data petualangan...</p>
                </div>
            </div>
        );
    }

    const hasPartner = profile.partnerIds && profile.partnerIds.length > 0;

    // ─── TAMPILAN DASHBOARD GAME MASTER (AZIZAH) ───
    if (profile.role === 'gm') {
        return (
            <div className="min-h-screen p-4 md:p-8 text-slate-800 relative" style={{ background: 'linear-gradient(135deg, #E9D5FF 0%, #FBCFE8 100%)', fontFamily: 'var(--font-nunito), sans-serif' }}>
                <div className="max-w-6xl mx-auto mt-2 md:mt-6 relative z-10 space-y-6 md:space-y-8">

                    {/* GM Header */}
                    <header className="text-center md:text-left mb-6 md:mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="w-full md:w-auto">
                            <span className="text-4xl mb-2 block drop-shadow-md">👑</span>
                            <h1 className="text-3xl md:text-4xl font-bold text-purple-950" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                                Selamat Datang, GM {profile.displayName}
                            </h1>
                            <p className="text-purple-700/80 font-medium mt-1 text-sm md:text-base">Pantau progres anggota guild-mu hari ini.</p>
                        </div>
                        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
                            <button onClick={() => router.push('/network')} className="w-full sm:w-auto bg-white/80 backdrop-blur-sm px-6 py-3 md:py-4 rounded-full text-purple-700 font-bold border border-purple-200 hover:bg-white transition-all text-sm md:text-base">
                                Kelola Guild 🌐
                            </button>
                            <button onClick={() => router.push('/gm/quests')} disabled={!hasPartner} className="w-full sm:w-auto bg-purple-600 px-8 py-3 md:py-4 rounded-full text-white font-bold shadow-[0_10px_30px_rgba(168,85,247,0.3)] hover:-translate-y-1 disabled:opacity-50 transition-all text-sm md:text-base">
                                Buat Quest Baru
                            </button>
                        </div>
                    </header>

                    {/* Daftar Anggota Hero yang Dimiliki GM */}
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

                                        {/* FIX: PP Hero Ditampilkan Di Sini */}
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

    // ─── TAMPILAN DASHBOARD HERO (NARDI) ───
    return (
        <div
            className="min-h-screen p-4 md:p-8 relative overflow-hidden text-slate-800"
            style={{ background: 'linear-gradient(135deg, #E9D5FF 0%, #F3E8FF 40%, #FBCFE8 100%)', fontFamily: 'var(--font-nunito), sans-serif' }}
        >
            <div className="absolute top-0 right-0 w-[30rem] md:w-[40rem] h-[30rem] md:h-[40rem] bg-purple-400/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[20rem] md:w-[30rem] h-[20rem] md:h-[30rem] bg-pink-400/20 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-6xl mx-auto space-y-6 md:space-y-10 relative z-10 pt-2 md:pt-4">

                {/* Header Hero */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6 pb-2">
                    <div className="text-left w-full md:w-auto text-center md:text-left">
                        <p className="text-purple-600 text-xs md:text-sm tracking-widest uppercase mb-1 md:mb-2 font-bold flex items-center justify-center md:justify-start gap-2">
                            Welcome back, Hero
                        </p>
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-1 text-purple-950 truncate" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                            {profile.displayName}
                        </h1>
                        <p className="text-purple-700/80 text-sm md:text-lg font-medium">"{profile.title || 'Petualang Baru'}"</p>
                    </div>

                    <div className="w-full md:w-auto flex items-center justify-center md:justify-end gap-4 bg-white px-5 py-3 md:px-6 md:py-4 rounded-2xl md:rounded-3xl border border-purple-100 shadow-[0_10px_40px_rgba(168,85,247,0.15)]">
                        <div className="text-center md:text-right">
                            <p className="text-[10px] md:text-xs text-purple-400 uppercase tracking-widest font-bold mb-0.5 md:mb-1">Day Streak</p>
                            <p className="text-xl md:text-2xl font-extrabold text-pink-500 flex items-center justify-center md:justify-end gap-1.5 md:gap-2">
                                {profile.streak || 0} <span className="text-xl md:text-2xl drop-shadow-sm">🔥</span>
                            </p>
                        </div>
                    </div>
                </header>

                {/* Top Grid: Level & Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
                    <div className="lg:col-span-2 bg-white border border-purple-100 rounded-3xl p-6 md:p-8 shadow-[0_10px_40px_rgba(168,85,247,0.12)] flex flex-col justify-center relative overflow-hidden">
                        <h2 className="text-xl md:text-2xl font-semibold text-purple-900 mb-6 md:mb-8 flex items-center justify-center md:justify-start gap-3" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                            <span className="text-purple-500">✨</span> Hero Progression
                        </h2>
                        <div className="mb-5 md:mb-6 p-4 md:p-5 bg-purple-50 rounded-2xl border border-purple-100/50">
                            <ExpBar currentExp={profile.exp || 0} maxExp={profile.expToNextLevel || 100} level={profile.level || 1} />
                        </div>
                        <p className="text-xs md:text-sm text-slate-500 mt-auto leading-relaxed font-medium text-center md:text-left">
                            Selesaikan <span className="text-pink-600 font-bold">{Math.ceil(((profile.expToNextLevel || 100) - (profile.exp || 0)) / 50)} quest rank E</span> lagi untuk mencapai Level {(profile.level || 1) + 1}!
                        </p>
                    </div>

                    <div className="bg-white border border-purple-100 rounded-3xl p-6 md:p-8 shadow-[0_10px_40px_rgba(168,85,247,0.12)]">
                        <h2 className="text-xl md:text-2xl font-semibold text-purple-900 mb-6 md:mb-8 flex items-center justify-center md:justify-start gap-3" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                            <span className="text-pink-400">💜</span> Attributes
                        </h2>
                        <div className="space-y-4 md:space-y-5">
                            <div className="flex justify-between items-center group">
                                <span className="text-xs md:text-sm text-slate-600 capitalize font-medium group-hover:text-purple-600 transition-colors">Quest Selesai</span>
                                <span className="text-purple-700 font-bold bg-purple-50 px-3 md:px-4 py-1 md:py-1.5 rounded-full border border-purple-100 shadow-sm text-xs md:text-sm">
                                    {profile.totalQuestsCompleted || 0}
                                </span>
                            </div>
                            <div className="flex justify-between items-center group">
                                <span className="text-xs md:text-sm text-slate-600 capitalize font-medium group-hover:text-purple-600 transition-colors">Jam Fokus</span>
                                <span className="text-purple-700 font-bold bg-purple-50 px-3 md:px-4 py-1 md:py-1.5 rounded-full border border-purple-100 shadow-sm text-xs md:text-sm">
                                    {profile.totalHoursWorked ? profile.totalHoursWorked.toFixed(1) : 0}h
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Active Quests Section */}
                <div>
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4 md:mb-6">
                        <h2 className="text-xl md:text-2xl font-semibold text-purple-900 flex items-center gap-3" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                            <span className="text-purple-500">📜</span> Active Quests
                        </h2>
                        <button onClick={() => router.push('/quest-board')} className="w-full sm:w-auto text-xs md:text-sm font-bold text-purple-600 bg-purple-50 px-5 py-2.5 rounded-full hover:bg-purple-100 transition-colors border border-purple-100">
                            View All Board
                        </button>
                    </div>

                    {loadingQuests ? (
                        <div className="text-center py-10 text-purple-500 font-bold">Memuat quest dari GM...</div>
                    ) : !hasPartner ? (
                        <div className="bg-white/60 border border-white/80 rounded-3xl p-6 md:p-10 text-center shadow-sm max-w-2xl mx-auto" style={{ backdropFilter: 'blur(12px)' }}>
                            <span className="text-4xl md:text-5xl block mb-3 opacity-50">🔗</span>
                            <p className="text-purple-900 font-bold text-lg md:text-xl mb-1">Menunggu Koneksi Jaringan</p>
                            <p className="text-purple-600/70 text-xs md:text-sm mb-6 max-w-sm mx-auto">Kamu belum terhubung dengan Game Master manapun untuk menerima tugas.</p>
                            <Button onClick={() => router.push('/network')} variant="primary" className="shadow-lg shadow-purple-500/20 w-full sm:w-auto">
                                Cari Koneksi Sekarang
                            </Button>
                        </div>
                    ) : activeQuests.length === 0 ? (
                        <div className="bg-white/60 border border-white/80 rounded-3xl p-6 md:p-10 text-center shadow-sm max-w-2xl mx-auto" style={{ backdropFilter: 'blur(12px)' }}>
                            <span className="text-4xl md:text-5xl block mb-3 opacity-50">🍃</span>
                            <p className="text-purple-900 font-bold text-lg md:text-xl mb-1">Semua quest sudah bersih!</p>
                            <p className="text-purple-600/70 text-xs md:text-sm">Saatnya istirahat atau tunggu GM memberi misi baru.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                            {activeQuests.map((quest) => (
                                <div key={quest.id} onClick={() => router.push(`/quest-board/${quest.id}`)} className="cursor-pointer bg-white border border-purple-100 rounded-3xl p-5 md:p-6 shadow-[0_8px_30px_rgba(168,85,247,0.08)] flex flex-col hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(236,72,153,0.15)] hover:border-pink-200 transition-all duration-300">

                                    {/* AREA LENCANA (RANK, UANG, EXP) */}
                                    <div className="flex justify-between items-start mb-4 md:mb-5">
                                        <Badge variant={quest.difficulty}>Rank {quest.difficulty}</Badge>

                                        {/* Container flex untuk menampung badge uang & EXP */}
                                        <div className="flex flex-wrap items-center gap-1.5 justify-end">
                                            {/* Badge Uang (Tampil jika moneyReward > 0) */}
                                            {quest.moneyReward && quest.moneyReward > 0 ? (
                                                <span className="text-emerald-700 font-black text-[10px] md:text-xs bg-emerald-100 px-2.5 md:px-3 py-1 md:py-1.5 rounded-full border border-emerald-200 flex items-center gap-1">
                                                    <Wallet className="w-3 h-3 md:w-3.5 md:h-3.5" />
                                                    Rp {quest.moneyReward.toLocaleString('id-ID')}
                                                </span>
                                            ) : null}

                                            {/* Badge EXP */}
                                            <span className="text-pink-600 font-bold text-[10px] md:text-xs bg-pink-50 px-2.5 md:px-3 py-1 md:py-1.5 rounded-full border border-pink-100">
                                                +{quest.expReward} EXP
                                            </span>
                                        </div>
                                    </div>

                                    <h3 className="text-base md:text-lg font-bold text-purple-950 mb-3 leading-snug">{quest.title}</h3>

                                    <div className="mt-auto pt-4 md:pt-5 border-t border-purple-50 flex justify-between items-center text-[10px] md:text-xs font-bold text-purple-400">
                                        <Badge variant={quest.category}>{quest.category}</Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}