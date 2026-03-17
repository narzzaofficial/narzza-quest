'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { subscribeToGMGuildQuests } from '@/lib/db';
import { GuildQuest } from '@/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Swords, Plus, Users, CheckCircle2, Lock } from 'lucide-react';

export default function GMGuildQuestPage() {
    const { profile } = useAuth();
    const router = useRouter();
    const [quests, setQuests] = useState<GuildQuest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!profile || profile.role !== 'gm') return;
        const unsub = subscribeToGMGuildQuests(profile.uid, (qs) => {
            setQuests(qs);
            setLoading(false);
        });
        return () => unsub();
    }, [profile]);

    if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-purple-600">Memuat Guild Quest...</div>;
    if (profile?.role !== 'gm') return <div className="min-h-screen flex items-center justify-center text-slate-500">Akses ditolak.</div>;

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

            <div className="max-w-4xl mx-auto relative z-10 pt-4 space-y-6">

                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <p className="text-purple-600 font-extrabold text-[10px] tracking-widest uppercase mb-1 flex items-center gap-1.5">
                            <Swords className="w-3 h-3" /> GM Panel
                        </p>
                        <h1 className="text-3xl font-bold text-purple-950" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                            Guild Quest Board
                        </h1>
                        <p className="text-purple-700/80 text-sm mt-1 font-medium">Quest terbuka yang bisa diambil hero-mu.</p>
                    </div>
                    <Button
                        onClick={() => router.push('/gm/guild-quest/new')}
                        variant="primary"
                        className="bg-gradient-to-r from-purple-600 to-pink-500 border-none shadow-[0_5px_20px_rgba(236,72,153,0.3)] hover:-translate-y-0.5 flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Buka Quest Baru
                    </Button>
                </header>

                {quests.length === 0 ? (
                    <Card className="text-center py-16 bg-white/60 border-purple-100 shadow-sm backdrop-blur-sm">
                        <Swords className="w-12 h-12 text-purple-400 mx-auto mb-4" strokeWidth={1.5} />
                        <p className="text-purple-900 font-bold text-lg">Belum Ada Guild Quest</p>
                        <p className="text-purple-600/70 text-sm mt-1 mb-6">Buka quest yang bisa diambil oleh semua hero-mu sekaligus.</p>
                        <Button onClick={() => router.push('/gm/guild-quest/new')} variant="primary" className="bg-purple-600 border-none">
                            Buat Sekarang
                        </Button>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {quests.map(gq => {
                            const claimedCount = gq.claimedBy.length;
                            const isFull = gq.status === 'closed';
                            const quotaPercent = Math.round((claimedCount / gq.maxClaims) * 100);

                            return (
                                <Card key={gq.id} className={`bg-white/80 border-l-4 backdrop-blur-sm shadow-sm hover:shadow-md transition-all ${isFull ? 'border-l-emerald-400 border-emerald-100' : 'border-l-purple-500 border-purple-100'}`}>
                                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                        <div className="flex-1">
                                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                                <Badge variant={gq.difficulty}>Rank {gq.difficulty}</Badge>
                                                <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wider ${isFull ? 'text-emerald-700 bg-emerald-100 border-emerald-200' : 'text-purple-700 bg-purple-100 border-purple-200'}`}>
                                                    {isFull ? <><CheckCircle2 className="w-3 h-3" /> Kuota Penuh</> : <><Users className="w-3 h-3" /> Terbuka</>}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-bold text-purple-950 leading-tight">{gq.title}</h3>
                                            <p className="text-slate-600 text-sm mt-1 line-clamp-2">{gq.description}</p>
                                        </div>

                                        <div className="flex-shrink-0 text-right">
                                            <p className="text-purple-500 text-xs font-bold uppercase tracking-wide mb-1">Slot Terisi</p>
                                            <p className="text-2xl font-black text-purple-900">{claimedCount}<span className="text-sm text-purple-400">/{gq.maxClaims}</span></p>
                                        </div>
                                    </div>

                                    {/* Quota bar */}
                                    <div className="mt-4">
                                        <div className="h-2 bg-purple-100/50 rounded-full overflow-hidden border border-purple-100">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${isFull ? 'bg-emerald-400' : 'bg-purple-500'}`}
                                                style={{ width: `${quotaPercent}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-[10px] font-bold text-purple-500 mt-1">
                                            <span>Deadline: {new Date(gq.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                            <span className="text-pink-600">+{gq.expReward} EXP</span>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
