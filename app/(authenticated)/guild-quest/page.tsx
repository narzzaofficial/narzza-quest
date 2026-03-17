'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { subscribeToOpenGuildQuests, claimGuildQuest } from '@/lib/db';
import { GuildQuest } from '@/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Toast from '@/components/ui/Toast';
import { Swords, Users, CheckCircle2, Lock, Zap } from 'lucide-react';

export default function HeroGuildQuestPage() {
    const { profile } = useAuth();
    const [quests, setQuests] = useState<GuildQuest[]>([]);
    const [loading, setLoading] = useState(true);
    const [claimingId, setClaimingId] = useState<string | null>(null);
    const [toast, setToast] = useState({ show: false, msg: '', type: 'success' as 'success' | 'error' | 'info' });

    useEffect(() => {
        if (!profile || profile.role !== 'player') return;

        // Subscribe ke guild quests dari semua GM yang terhubung
        const gmUids = profile.partnerIds || [];
        const unsub = subscribeToOpenGuildQuests(gmUids, (qs) => {
            setQuests(qs);
            setLoading(false);
        });
        return () => unsub();
    }, [profile]);

    const handleClaim = async (gq: GuildQuest) => {
        if (!profile) return;
        setClaimingId(gq.id);
        try {
            const result = await claimGuildQuest(gq.id, profile);

            switch (result) {
                case 'claimed':
                    setToast({ show: true, msg: `Quest "${gq.title}" berhasil diambil! Cek Quest Board-mu.`, type: 'success' });
                    break;
                case 'already_claimed':
                    setToast({ show: true, msg: 'Kamu sudah mengambil quest ini sebelumnya!', type: 'info' });
                    break;
                case 'quota_full':
                    setToast({ show: true, msg: 'Sayang sekali! Kuota quest ini sudah penuh.', type: 'error' });
                    break;
                case 'closed':
                    setToast({ show: true, msg: 'Quest ini sudah ditutup oleh GM.', type: 'error' });
                    break;
            }
        } catch (err) {
            console.error(err);
            setToast({ show: true, msg: 'Gagal mengambil quest. Coba lagi.', type: 'error' });
        } finally {
            setClaimingId(null);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-purple-600">Memuat Guild Quest...</div>;

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

            <div className="max-w-4xl mx-auto relative z-10 pt-4 space-y-8">

                <header>
                    <p className="text-purple-600 font-extrabold text-[10px] tracking-widest uppercase mb-2 flex items-center gap-2">
                        <Swords className="w-3.5 h-3.5" /> Public Quest Board
                    </p>
                    <h1 className="text-4xl font-bold text-purple-950 mb-2" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                        Guild Quest
                    </h1>
                    <p className="text-purple-700/80 font-medium">Quest terbuka dari GM-mu. Ambil sebelum slot habis!</p>
                </header>

                {(!profile?.partnerIds || profile.partnerIds.length === 0) ? (
                    <Card className="text-center py-16 bg-white/60 border-purple-100 shadow-sm backdrop-blur-sm">
                        <Swords className="w-12 h-12 text-purple-400 mx-auto mb-4" strokeWidth={1.5} />
                        <p className="text-purple-900 font-bold text-lg">Belum terhubung dengan GM</p>
                        <p className="text-purple-600/70 text-sm mt-1">Hubungi GM untuk terhubung dan akses Guild Quest.</p>
                    </Card>
                ) : quests.length === 0 ? (
                    <Card className="text-center py-16 bg-white/60 border-purple-100 shadow-sm backdrop-blur-sm">
                        <Swords className="w-12 h-12 text-purple-400 mx-auto mb-4" strokeWidth={1.5} />
                        <p className="text-purple-900 font-bold text-lg">Belum Ada Guild Quest</p>
                        <p className="text-purple-600/70 text-sm mt-1">GM belum membuka guild quest saat ini. Pantau terus!</p>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {quests.map(gq => {
                            const isClaimed = gq.claimedBy.includes(profile?.uid || '');
                            const isFull = gq.status === 'closed';
                            const claimedCount = gq.claimedBy.length;
                            const slotsLeft = gq.maxClaims - claimedCount;
                            const isExpired = new Date(gq.deadline) < new Date();
                            const disabled = isClaimed || isFull || isExpired;

                            return (
                                <Card
                                    key={gq.id}
                                    className={`flex flex-col bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md border-l-4 transition-all duration-300
                                        ${isClaimed ? 'border-emerald-100 border-l-emerald-400' : isFull ? 'border-red-100 border-l-red-400' : 'border-purple-100 border-l-purple-500 hover:-translate-y-1'}
                                    `}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <Badge variant={gq.difficulty}>Rank {gq.difficulty}</Badge>
                                        <div className="text-right">
                                            {isClaimed ? (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full">
                                                    <CheckCircle2 className="w-3 h-3" /> Sudah Diambil
                                                </span>
                                            ) : isFull ? (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-black text-red-700 bg-red-100 border border-red-200 px-2 py-0.5 rounded-full">
                                                    <Lock className="w-3 h-3" /> Slot Penuh
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-700 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full">
                                                    <Users className="w-3 h-3" /> {slotsLeft} Slot Tersisa
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* GM Name */}
                                    <div className="mb-2">
                                        <span className="text-[10px] font-black text-purple-500 uppercase tracking-wide bg-purple-50 px-2 py-1 rounded border border-purple-100">dari: {gq.createdByName}</span>
                                    </div>

                                    <h3 className="text-lg font-bold text-purple-950 leading-tight mb-2">{gq.title}</h3>
                                    <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-3">{gq.description}</p>

                                    {gq.motivation && (
                                        <div className="bg-pink-50/80 border border-pink-100 rounded-xl p-3 mb-4">
                                            <p className="text-pink-700 text-xs italic">💌 "{gq.motivation}"</p>
                                        </div>
                                    )}

                                    {/* Stats */}
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        <span className="text-[10px] font-bold text-pink-700 bg-pink-100 border border-pink-200 px-2.5 py-1 rounded-lg">
                                            +{gq.expReward} EXP
                                        </span>
                                        {gq.moneyReward && gq.moneyReward > 0 && (
                                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg">
                                                💰 Rp {gq.moneyReward.toLocaleString('id-ID')}
                                            </span>
                                        )}
                                        <span className="text-[10px] font-bold text-purple-700 bg-purple-100 border border-purple-200 px-2.5 py-1 rounded-lg">
                                            ⏱️ {new Date(gq.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                        </span>
                                    </div>

                                    {/* Quota Progress */}
                                    <div className="mb-4">
                                        <div className="h-1.5 bg-purple-100 rounded-full overflow-hidden border border-purple-200/50">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${isFull ? 'bg-red-400' : 'bg-purple-500'}`}
                                                style={{ width: `${Math.min(100, (claimedCount / gq.maxClaims) * 100)}%` }}
                                            />
                                        </div>
                                        <p className="text-[10px] font-bold text-purple-500 mt-1">{claimedCount}/{gq.maxClaims} hero telah mengambil</p>
                                    </div>

                                    <Button
                                        variant="primary"
                                        onClick={() => handleClaim(gq)}
                                        disabled={disabled || claimingId === gq.id}
                                        isLoading={claimingId === gq.id}
                                        className={`w-full mt-auto flex items-center justify-center gap-2 ${
                                            isClaimed
                                                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 cursor-not-allowed hover:bg-emerald-100'
                                                : isFull || isExpired
                                                ? 'bg-slate-100 text-slate-500 border border-slate-200 cursor-not-allowed hover:bg-slate-100'
                                                : 'bg-gradient-to-r from-purple-600 to-pink-500 border-none shadow-[0_5px_15px_rgba(236,72,153,0.3)] hover:shadow-[0_8px_25px_rgba(236,72,153,0.4)] hover:-translate-y-0.5 text-white'
                                        }`}
                                    >
                                        {isClaimed ? (
                                            <><CheckCircle2 className="w-4 h-4" /> Quest Sudah Kamu Ambil</>
                                        ) : isFull ? (
                                            <><Lock className="w-4 h-4" /> Slot Habis</>
                                        ) : isExpired ? (
                                            'Quest Sudah Kedaluwarsa'
                                        ) : (
                                            <><Zap className="w-4 h-4" /> Ambil Quest Ini!</>
                                        )}
                                    </Button>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>

            <Toast isVisible={toast.show} onClose={() => setToast(t => ({ ...t, show: false }))} message={toast.msg} type={toast.type as any} />
        </div>
    );
}
