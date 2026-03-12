'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { subscribeToQuests } from '@/lib/db';
import { Quest } from '@/types';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

export default function QuestBoardPage() {
    const { profile } = useAuth();
    const [quests, setQuests] = useState<Quest[]>([]);
    const [activeFilter, setActiveFilter] = useState('All');
    const [loading, setLoading] = useState(true);

    const filters = ['All', 'Available', 'Active', 'Completed'];

    useEffect(() => {
        if (profile && profile.role === 'player') {
            const unsubscribe = subscribeToQuests(profile.uid, (fetchedQuests) => {
                setQuests(fetchedQuests);
                setLoading(false);
            });
            return () => unsubscribe();
        }
    }, [profile]);

    const filteredQuests = quests.filter(quest => {
        if (activeFilter === 'All') return true;
        if (activeFilter === 'Available') return quest.status === 'pending';
        if (activeFilter === 'Active') return quest.status === 'in_progress';
        if (activeFilter === 'Completed') return quest.status === 'submitted' || quest.status === 'approved';
        return true;
    });

    return (
        <div
            className="min-h-screen p-4 md:p-8 relative overflow-hidden text-slate-800"
            style={{
                background: 'linear-gradient(135deg, #E9D5FF 0%, #F3E8FF 40%, #FBCFE8 100%)',
                fontFamily: 'var(--font-nunito), sans-serif'
            }}
        >
            <div className="absolute top-[-10%] right-[-5%] w-[40rem] h-[40rem] bg-purple-400/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-5%] w-[30rem] h-[30rem] bg-pink-400/20 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-6xl mx-auto space-y-10 relative z-10">

                <header className="text-center md:text-left pt-4">
                    <p className="text-purple-600 text-sm tracking-widest uppercase mb-2 font-bold">Job Board</p>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 text-purple-950" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                        Quest Board
                    </h1>
                    <p className="text-purple-700/80 text-lg font-medium max-w-2xl">
                        Pilih dan selesaikan misi-misi di bawah ini untuk mendapatkan EXP. Buktikan pada GM Azizah bahwa kamu adalah Hero yang bisa diandalkan!
                    </p>
                </header>

                {/* Filter / Tabs - Diperbaiki menjadi seukuran konten (inline-flex) */}
                <div className="inline-flex flex-wrap items-center gap-2 bg-white/60 p-2 rounded-2xl border border-purple-100 shadow-sm backdrop-blur-md">
                    {filters.map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`px-5 py-2 rounded-xl font-bold text-sm transition-all duration-300 ${activeFilter === filter
                                    ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md'
                                    : 'text-purple-700 hover:bg-purple-100/50'
                                }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>

                {/* Quest Grid */}
                {loading ? (
                    <div className="text-center py-20 text-purple-600 font-bold">Mengumpulkan quest dari guild...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredQuests.map((quest) => {
                            const isCompleted = ['submitted', 'approved'].includes(quest.status);

                            return (
                                <Card
                                    key={quest.id}
                                    className={`flex flex-col group transition-all duration-300 relative overflow-hidden ${isCompleted
                                            ? 'bg-slate-50/90 border-slate-200 shadow-sm' // Desain solid yang kalem, tidak transparan pucat
                                            : 'bg-white hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(236,72,153,0.15)] hover:border-pink-300 shadow-md border-purple-100'
                                        }`}
                                >
                                    {/* Header Card: Rank & EXP */}
                                    <div className="flex justify-between items-start mb-4">
                                        <Badge variant={quest.difficulty}>Rank {quest.difficulty}</Badge>
                                        <span className={`font-black text-xs px-3 py-1.5 rounded-xl border shadow-sm ${isCompleted ? 'bg-slate-100 text-slate-500 border-slate-200' : 'bg-pink-50 text-pink-600 border-pink-100'
                                            }`}>
                                            +{quest.expReward} EXP
                                        </span>
                                    </div>

                                    {/* Judul & Deskripsi */}
                                    <h3 className={`text-xl font-bold mb-2 leading-snug transition-colors ${isCompleted ? 'text-slate-700' : 'text-purple-950 group-hover:text-purple-700'
                                        }`}>
                                        {quest.title}
                                    </h3>

                                    <p className={`text-sm mb-6 line-clamp-2 ${isCompleted ? 'text-slate-500' : 'text-slate-600'}`}>
                                        {quest.description || "Tidak ada deskripsi misi."}
                                    </p>

                                    {/* Area Bawah: Info & Tombol */}
                                    <div className="mt-auto space-y-4 pt-4 border-t border-slate-100/80">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg border ${isCompleted ? 'bg-slate-100 text-slate-500 border-slate-200' : 'bg-purple-50 text-purple-500 border-purple-100'
                                                }`}>
                                                ⏱️ {new Date(quest.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </span>
                                            <Badge variant={quest.category}>{quest.category}</Badge>
                                            <Badge variant={quest.status}>{quest.status.replace('_', ' ').toUpperCase()}</Badge>
                                        </div>

                                        <Link href={`/quest-board/${quest.id}`} className="block mt-2">
                                            <button className={`w-full py-3 rounded-xl font-bold text-sm transition-all duration-300 ${isCompleted
                                                    ? 'bg-slate-200 text-slate-600 hover:bg-slate-300' // Tombol solid abu-abu yang jelas
                                                    : 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-[0_4px_15px_rgba(168,85,247,0.3)] hover:shadow-[0_6px_20px_rgba(236,72,153,0.4)] hover:-translate-y-0.5' // Tombol utama yang menonjol
                                                }`}>
                                                {isCompleted ? 'Lihat Arsip' : 'Lihat Detail & Submit'}
                                            </button>
                                        </Link>
                                    </div>
                                </Card>
                            );
                        })}

                        {filteredQuests.length === 0 && (
                            <div className="col-span-full py-20 text-center">
                                <span className="text-6xl mb-4 block opacity-50">🍃</span>
                                <h3 className="text-2xl font-bold text-purple-900 mb-2" style={{ fontFamily: 'var(--font-playfair), serif' }}>Tidak ada quest di kategori ini</h3>
                                <p className="text-purple-600/70">Coba ubah filter atau minta GM Azizah untuk membuat quest baru.</p>
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
}