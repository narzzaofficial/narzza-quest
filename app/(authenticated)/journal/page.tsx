'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getPlayerQuests, getLinkedProfiles } from '@/lib/db';
import { Quest, UserProfile } from '@/types';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { BookOpen, Calendar, MessageSquare, Award, Feather, Users } from 'lucide-react';

export default function JournalPage() {
    const { profile, loading } = useAuth();

    const [linkedHeroes, setLinkedHeroes] = useState<UserProfile[]>([]);
    const [selectedHeroId, setSelectedHeroId] = useState<string>('');
    const [completedQuests, setCompletedQuests] = useState<Quest[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    useEffect(() => {
        if (!profile) return;
        if (profile.role === 'gm' && profile.partnerIds && profile.partnerIds.length > 0) {
            getLinkedProfiles(profile.partnerIds).then(heroes => {
                const playersOnly = heroes.filter(h => h.role === 'player');
                setLinkedHeroes(playersOnly);
                if (playersOnly.length > 0) setSelectedHeroId(playersOnly[0].uid);
                else setIsLoadingData(false);
            });
        } else if (profile.role === 'player') {
            setSelectedHeroId(profile.uid);
        } else {
            setIsLoadingData(false);
        }
    }, [profile]);

    useEffect(() => {
        if (selectedHeroId) {
            setIsLoadingData(true);
            getPlayerQuests(selectedHeroId).then(quests => {
                const approved = quests.filter(q => q.status === 'approved');
                approved.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
                setCompletedQuests(approved);
                setIsLoadingData(false);
            }).catch(err => {
                console.error("Gagal mengambil jurnal:", err);
                setIsLoadingData(false);
            });
        }
    }, [selectedHeroId]);

    const totalExpEarned = completedQuests.reduce((sum, quest) => sum + quest.expReward + (quest.bonusExp || 0), 0);

    if (loading || (isLoadingData && !selectedHeroId)) {
        return <div className="min-h-screen flex items-center justify-center text-purple-600 font-bold">Membuka arsip jurnal...</div>;
    }

    return (
        <div
            className="min-h-screen p-4 md:p-6 text-slate-800"
            style={{
                background: 'linear-gradient(135deg, #F8FAFC 0%, #F3E8FF 100%)',
                fontFamily: 'var(--font-inter), sans-serif'
            }}
        >
            <div className="max-w-6xl mx-auto space-y-6 pt-2">

                {/* Header */}
                <header className="text-center py-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-[0_4px_16px_rgba(168,85,247,0.15)] mb-4 border border-purple-100 text-purple-600">
                        <BookOpen className="w-8 h-8" />
                    </div>
                    <p className="text-purple-500 text-xs tracking-widest uppercase mb-1.5 font-bold">War Room</p>
                    <h1 className="text-3xl md:text-4xl font-bold text-purple-950 mb-2"
                        style={{ fontFamily: 'var(--font-noto-serif), serif' }}>
                        Hero's Journal
                    </h1>
                    <p className="text-slate-400 text-sm max-w-xl mx-auto">
                        Kumpulan pencapaian, catatan perjalanan, dan memori dari quest yang telah diselesaikan.
                    </p>
                </header>

                {/* GM Dropdown */}
                {profile?.role === 'gm' && linkedHeroes.length > 0 && (
                    <div className="bg-white px-4 py-3 rounded-xl border border-purple-100 shadow-sm flex flex-col md:flex-row items-center gap-3 justify-between">
                        <div className="flex items-center gap-2 text-purple-900 font-bold text-sm">
                            <Users className="w-4 h-4" />
                            <span>Pilih Jurnal Hero:</span>
                        </div>
                        <select
                            value={selectedHeroId}
                            onChange={(e) => setSelectedHeroId(e.target.value)}
                            className="w-full md:w-56 p-2.5 rounded-lg border border-purple-200 bg-purple-50 font-bold text-sm text-purple-800 focus:ring-2 focus:ring-purple-400 focus:outline-none cursor-pointer"
                        >
                            {linkedHeroes.map(hero => (
                                <option key={hero.uid} value={hero.uid}>
                                    {hero.displayName} (Lv. {hero.level})
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-5 bg-white rounded-xl border border-purple-100 shadow-sm hover:-translate-y-0.5 transition-transform">
                        <p className="text-xs text-purple-400 uppercase tracking-widest font-bold mb-1.5">Quests Selesai</p>
                        <p className="text-4xl font-extrabold text-purple-900" style={{ fontFamily: 'var(--font-noto-serif), serif' }}>
                            {completedQuests.length}
                        </p>
                    </div>
                    <div className="text-center p-5 bg-white rounded-xl border border-pink-100 shadow-sm hover:-translate-y-0.5 transition-transform">
                        <p className="text-xs text-pink-400 uppercase tracking-widest font-bold mb-1.5">Total EXP Diraih</p>
                        <p className="text-4xl font-extrabold text-pink-600" style={{ fontFamily: 'var(--font-noto-serif), serif' }}>
                            {totalExpEarned}
                        </p>
                    </div>
                </div>

                {/* Timeline */}
                <div className="space-y-3">
                    <h2 className="text-base font-bold text-purple-900 border-b border-purple-100 pb-3"
                        style={{ fontFamily: 'var(--font-noto-serif), serif' }}>
                        Catatan Terbaru
                    </h2>

                    {isLoadingData ? (
                        <div className="text-center py-8 text-purple-500 font-bold text-sm">Membuka lembaran jurnal...</div>
                    ) : completedQuests.length === 0 ? (
                        <div className="text-center py-10 bg-white/50 rounded-2xl border border-purple-100 border-dashed">
                            <Feather className="w-8 h-8 text-purple-300 mx-auto mb-2" />
                            <p className="text-purple-900 font-bold text-sm">Jurnal masih kosong.</p>
                            <p className="text-purple-600/70 text-xs mt-1">Belum ada quest yang disetujui. Selesaikan quest untuk mengukir sejarah!</p>
                        </div>
                    ) : (
                        completedQuests.map((quest) => (
                            <div key={quest.id} className="relative bg-white rounded-xl border border-slate-100 shadow-sm p-5 overflow-hidden">

                                {/* Rank Badge */}
                                <div className="absolute top-0 right-0 bg-gradient-to-bl from-amber-100 to-amber-50 text-amber-700 font-extrabold text-base w-12 h-12 flex items-start justify-end p-2 rounded-bl-2xl border-b border-l border-amber-200"
                                    style={{ fontFamily: 'var(--font-noto-serif), serif' }}>
                                    {quest.difficulty}
                                </div>

                                <div className="pr-10">
                                    {/* Meta */}
                                    <div className="flex flex-wrap gap-2 items-center mb-2">
                                        <Badge variant={quest.category}>{quest.category}</Badge>
                                        <span className="text-xs font-bold text-slate-400 flex items-center gap-1 bg-slate-50 px-2.5 py-0.5 rounded-full border border-slate-100">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(quest.reviewedAt || quest.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </span>
                                    </div>

                                    {/* Title & EXP */}
                                    <h3 className="text-lg font-bold text-purple-950 mb-1.5"
                                        style={{ fontFamily: 'var(--font-noto-serif), serif' }}>
                                        {quest.title}
                                    </h3>
                                    <p className="text-sm font-bold text-pink-600 mb-3 flex items-center gap-1.5">
                                        <Award className="w-3.5 h-3.5" />
                                        +{quest.expReward + (quest.bonusExp || 0)} EXP
                                    </p>
                                </div>

                                {/* Notes Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="bg-slate-50 border border-slate-100 px-4 py-3.5 rounded-xl">
                                        <div className="flex items-center gap-1.5 mb-2 text-slate-400">
                                            <Feather className="w-3.5 h-3.5" />
                                            <p className="text-[10px] font-bold uppercase tracking-wider">Catatan Hero</p>
                                        </div>
                                        <p className="text-slate-600 font-medium text-sm leading-relaxed">"{quest.submissionNote || 'Tidak ada catatan yang ditinggalkan.'}"</p>
                                    </div>

                                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 px-4 py-3.5 rounded-xl">
                                        <div className="flex items-center gap-1.5 mb-2 text-pink-400">
                                            <MessageSquare className="w-3.5 h-3.5" />
                                            <p className="text-[10px] font-bold uppercase tracking-wider">Review GM</p>
                                        </div>
                                        <p className="text-purple-900 font-bold text-sm leading-relaxed">"{quest.reviewNote || 'Kerja bagus!'}"</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {completedQuests.length > 0 && (
                    <div className="text-center py-6">
                        <p className="text-slate-300 font-bold text-xs tracking-widest uppercase">-- Akhir dari jurnal --</p>
                    </div>
                )}

            </div>
        </div>
    );
}