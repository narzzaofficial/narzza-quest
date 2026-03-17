'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { createGuildQuest, getLinkedProfiles } from '@/lib/db';
import { UserProfile } from '@/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Toast from '@/components/ui/Toast';
import { Swords, Users, Clock, Zap, AlertCircle } from 'lucide-react';

export default function CreateGuildQuestPage() {
    const { profile } = useAuth();
    const router = useRouter();

    const [linkedHeroes, setLinkedHeroes] = useState<UserProfile[]>([]);
    const [loadingHeroes, setLoadingHeroes] = useState(true);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [motivation, setMotivation] = useState('');
    const [expReward, setExpReward] = useState<number | ''>(50);
    const [moneyReward, setMoneyReward] = useState<number | ''>('');
    const [difficulty, setDifficulty] = useState<'E' | 'D' | 'C' | 'B' | 'A' | 'S'>('E');
    const [category, setCategory] = useState<'daily' | 'weekly' | 'main' | 'side'>('daily');
    const [deadline, setDeadline] = useState('');
    const [maxClaims, setMaxClaims] = useState<number | ''>(2);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        if (profile?.partnerIds && profile.partnerIds.length > 0) {
            getLinkedProfiles(profile.partnerIds).then(heroes => {
                const playersOnly = heroes.filter(h => h.role === 'player');
                setLinkedHeroes(playersOnly);
                setMaxClaims(Math.max(1, playersOnly.length)); // Default: semua hero bisa ambil
                setLoadingHeroes(false);
            });
        } else {
            setLoadingHeroes(false);
        }
    }, [profile]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile) return;

        if (linkedHeroes.length === 0) {
            alert("Kamu belum punya Hero yang terhubung!");
            return;
        }

        if (maxClaims === '' || maxClaims < 1 || maxClaims > linkedHeroes.length) {
            alert(`Kuota harus antara 1 sampai ${linkedHeroes.length} (jumlah hero kamu).`);
            return;
        }

        if (expReward === '' || expReward < 10) {
            alert("EXP minimal 10.");
            return;
        }

        setIsSubmitting(true);
        try {
            const partnerIds = linkedHeroes.map(h => h.uid);
            await createGuildQuest({
                title,
                description,
                motivation,
                category,
                difficulty,
                expReward: Number(expReward),
                moneyReward: Number(moneyReward),
                deadline: new Date(deadline).toISOString(),
                createdBy: profile.uid,
                createdByName: profile.displayName,
                maxClaims: Number(maxClaims),
            }, partnerIds);

            setShowToast(true);
            setTimeout(() => router.push('/gm/guild-quest'), 1500);
        } catch (error) {
            console.error("Gagal membuat Guild Quest:", error);
            alert("Gagal membuat Guild Quest. Coba lagi.");
            setIsSubmitting(false);
        }
    };

    if (loadingHeroes) {
        return <div className="min-h-screen flex items-center justify-center font-bold text-purple-600">Memuat daftar Hero...</div>;
    }

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

            <div className="max-w-2xl mx-auto relative z-10 pt-4">
                <header className="mb-8">
                    <p className="text-purple-600 font-extrabold text-[10px] tracking-widest uppercase mb-2 flex items-center gap-2">
                        <Swords className="w-3.5 h-3.5" /> Guild Quest Board
                    </p>
                    <h1 className="text-3xl md:text-4xl font-bold text-purple-950 mb-2" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                        Buka Guild Quest
                    </h1>
                    <p className="text-purple-700/80 font-medium text-sm">Quest terbuka yang bisa diambil hero-mu. Siapa cepat dia yang dapat!</p>
                </header>

                {linkedHeroes.length === 0 ? (
                    <Card className="text-center p-10 bg-white/60 border-purple-100 shadow-sm backdrop-blur-sm">
                        <AlertCircle className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-purple-900 mb-2">Guild Masih Kosong</h2>
                        <p className="text-purple-600/70 mb-6 text-sm">Kamu belum memiliki Hero yang terhubung.</p>
                        <Button onClick={() => router.push('/network')} variant="primary" className="bg-purple-600 border-none">Undang Hero</Button>
                    </Card>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Quota Info Banner */}
                        <div className="bg-purple-50/80 border border-purple-200 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
                            <Users className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-purple-900 font-bold text-sm">Quest ini bisa diambil oleh beberapa hero sekaligus.</p>
                                <p className="text-purple-700/80 text-xs mt-0.5">Kamu punya <span className="text-purple-700 font-bold">{linkedHeroes.length} hero</span> terhubung. Atur kuota di bawah.</p>
                            </div>
                        </div>

                        <Card className="p-6 bg-white/80 backdrop-blur-sm border-purple-100 shadow-sm space-y-5">

                            <div>
                                <label className="block text-sm font-bold text-purple-900 mb-2">Judul Quest</label>
                                <input
                                    type="text"
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Contoh: Buat 1 project portfolio minggu ini"
                                    className="w-full p-3 rounded-xl bg-white border border-purple-200 text-purple-950 placeholder-slate-400 font-bold focus:ring-2 focus:ring-purple-400 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-purple-900 mb-2">Deskripsi Misi</label>
                                <textarea
                                    required
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={3}
                                    placeholder="Apa yang harus diselesaikan oleh hero yang mengambil quest ini..."
                                    className="w-full p-3 rounded-xl bg-white border border-purple-200 text-slate-700 placeholder-slate-400 font-medium focus:ring-2 focus:ring-purple-400 focus:outline-none resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-pink-600 mb-2">Penyemangat 💌 (Opsional)</label>
                                <textarea
                                    value={motivation}
                                    onChange={(e) => setMotivation(e.target.value)}
                                    rows={2}
                                    placeholder="Kata-kata semangat buat semua hero yang ambil quest ini..."
                                    className="w-full p-3 rounded-xl bg-pink-50/50 border border-pink-200 text-pink-900 placeholder-pink-300 font-medium focus:ring-2 focus:ring-pink-400 focus:outline-none resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-purple-900 mb-2">EXP Reward ✨</label>
                                    <input
                                        type="number"
                                        required min={10} max={1000}
                                        value={expReward}
                                        onChange={(e) => setExpReward(e.target.value === '' ? '' : Number(e.target.value))}
                                        className="w-full p-3 rounded-xl bg-white border border-purple-200 text-purple-700 font-black focus:ring-2 focus:ring-purple-400 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-emerald-700 mb-2">Bounty 💰 (Opsional)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-emerald-600 text-sm">Rp</span>
                                        <input
                                            type="number"
                                            min={0}
                                            value={moneyReward}
                                            onChange={(e) => setMoneyReward(e.target.value === '' ? '' : Number(e.target.value))}
                                            placeholder="0"
                                            className="w-full pl-10 pr-3 py-3 rounded-xl bg-white border border-emerald-200 text-emerald-700 font-black focus:ring-2 focus:ring-emerald-400 focus:outline-none placeholder-emerald-300"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-purple-900 mb-2">Deadline</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={deadline}
                                        onChange={(e) => setDeadline(e.target.value)}
                                        className="w-full p-3 rounded-xl bg-white border border-purple-200 text-purple-950 font-bold focus:ring-2 focus:ring-purple-400 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-purple-900 mb-2">Rank (Difficulty)</label>
                                    <select
                                        value={difficulty}
                                        onChange={(e) => setDifficulty(e.target.value as any)}
                                        className="w-full p-3 rounded-xl bg-white border border-purple-200 text-purple-900 font-bold focus:ring-2 focus:ring-purple-400 focus:outline-none cursor-pointer"
                                    >
                                        <option value="E">Rank E</option>
                                        <option value="D">Rank D</option>
                                        <option value="C">Rank C</option>
                                        <option value="B">Rank B</option>
                                        <option value="A">Rank A</option>
                                        <option value="S">Rank S (Epic)</option>
                                    </select>
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-bold text-purple-900 mb-2">Kategori</label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value as any)}
                                        className="w-full p-3 rounded-xl bg-white border border-purple-200 text-purple-900 font-bold focus:ring-2 focus:ring-purple-400 focus:outline-none cursor-pointer"
                                    >
                                        <option value="daily">Daily</option>
                                        <option value="weekly">Weekly</option>
                                        <option value="main">Main Quest</option>
                                        <option value="side">Side Quest</option>
                                    </select>
                                </div>
                            </div>

                            {/* Quota Setting */}
                            <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4">
                                <label className="block text-sm font-bold text-amber-900 mb-3 flex items-center gap-2">
                                    <Users className="w-4 h-4" /> Kuota Maksimal Hero yang Bisa Ambil
                                </label>
                                <input
                                    type="number"
                                    required
                                    min={1}
                                    max={linkedHeroes.length}
                                    value={maxClaims}
                                    onChange={(e) => setMaxClaims(e.target.value === '' ? '' : Number(e.target.value))}
                                    className="w-full p-3 rounded-xl bg-white border border-amber-300 text-amber-700 font-black text-2xl text-center focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                />
                                <p className="text-amber-700/70 text-xs mt-2 text-center">
                                    Maks {linkedHeroes.length} hero (semua hero terhubung). Begitu kuota penuh, quest otomatis ditutup.
                                </p>
                            </div>

                            <Button
                                type="submit"
                                variant="primary"
                                isLoading={isSubmitting}
                                className="w-full py-4 text-lg bg-gradient-to-r from-purple-600 to-pink-500 shadow-[0_5px_15px_rgba(236,72,153,0.3)] hover:shadow-[0_8px_25px_rgba(236,72,153,0.4)] border-none text-white hover:-translate-y-0.5 transition-all"
                            >
                                Publikasikan Guild Quest ⚔️
                            </Button>
                        </Card>
                    </form>
                )}
            </div>

            <Toast isVisible={showToast} onClose={() => setShowToast(false)} message="Guild Quest berhasil dipublikasikan!" type="success" />
        </div>
    );
}
