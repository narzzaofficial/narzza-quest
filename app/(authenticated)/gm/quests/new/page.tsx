'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { createQuest, getLinkedProfiles } from '@/lib/db';
import { UserProfile } from '@/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Toast from '@/components/ui/Toast';

export default function CreateQuestPage() {
    const { profile } = useAuth();
    const router = useRouter();

    const [linkedHeroes, setLinkedHeroes] = useState<UserProfile[]>([]);
    const [loadingHeroes, setLoadingHeroes] = useState(true);

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [motivation, setMotivation] = useState('');
    const [expReward, setExpReward] = useState<number | ''>(50);
    const [moneyReward, setMoneyReward] = useState<number | ''>(''); // NEW: State untuk Uang/Bounty
    const [difficulty, setDifficulty] = useState<'E' | 'D' | 'C' | 'B' | 'A' | 'S'>('E');
    const [category, setCategory] = useState<'daily' | 'weekly' | 'main' | 'side'>('daily');
    const [deadline, setDeadline] = useState('');
    const [assignedTo, setAssignedTo] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        if (profile?.partnerIds && profile.partnerIds.length > 0) {
            getLinkedProfiles(profile.partnerIds).then(heroes => {
                const playersOnly = heroes.filter(h => h.role === 'player');
                setLinkedHeroes(playersOnly);

                if (playersOnly.length > 0) {
                    setAssignedTo(playersOnly[0].uid);
                }
                setLoadingHeroes(false);
            });
        } else {
            setLoadingHeroes(false);
        }
    }, [profile]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile) return;

        if (!assignedTo) {
            alert("Pilih minimal satu Hero untuk ditugaskan!");
            return;
        }

        if (expReward === '' || expReward < 10) {
            alert("EXP minimal 10.");
            return;
        }

        setIsSubmitting(true);
        try {
            await createQuest({
                title,
                description,
                motivation,
                expReward: Number(expReward),
                moneyReward: Number(moneyReward),
                difficulty,
                category,
                deadline: new Date(deadline).toISOString(),
                status: 'pending',
                assignedTo: assignedTo,
                createdBy: profile.uid,
            }, { uid: profile.uid, displayName: profile.displayName }); // Pass gmProfile untuk notifikasi ke hero

            setShowToast(true);
            setTimeout(() => {
                router.push('/gm/quests');
            }, 1500);
        } catch (error) {
            console.error("Gagal membuat quest:", error);
            alert("Gagal membuat quest. Coba lagi.");
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
                background: 'linear-gradient(135deg, #F8FAFC 0%, #F3E8FF 100%)',
                fontFamily: 'var(--font-nunito), sans-serif'
            }}
        >
            <div className="max-w-2xl mx-auto relative z-10 pt-4">
                <header className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-purple-950" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                        Rancang Misi Baru 📜
                    </h1>
                    <p className="text-slate-500 font-medium mt-2">Buat quest dan tugaskan kepada Hero di guild-mu.</p>
                    <div className="mt-4">
                        <Button
                            variant="outline"
                            onClick={() => router.push('/gm/quests/new/json')}
                            className="text-indigo-700 border-indigo-200 hover:bg-indigo-50"
                        >
                            Buka Form JSON Batch
                        </Button>
                    </div>
                </header>

                {linkedHeroes.length === 0 ? (
                    <Card className="text-center p-10 bg-white shadow-sm border-purple-100">
                        <span className="text-5xl block mb-4 opacity-50">🔗</span>
                        <h2 className="text-xl font-bold text-purple-900 mb-2">Guild Masih Kosong</h2>
                        <p className="text-slate-500 mb-6">Kamu belum memiliki Hero untuk diberi tugas. Silakan undang Hero di Dashboard.</p>
                        <Button onClick={() => router.push('/dashboard')}>Kembali ke Dashboard</Button>
                    </Card>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Card className="p-6 md:p-8 bg-white shadow-[0_10px_40px_rgba(168,85,247,0.08)] border-purple-100">

                            <div className="mb-6 p-4 bg-purple-50 rounded-2xl border border-purple-100">
                                <label className="block text-sm font-extrabold text-purple-900 mb-2 uppercase tracking-widest">
                                    Tugaskan Kepada 🧙‍♂️
                                </label>
                                <select
                                    value={assignedTo}
                                    onChange={(e) => setAssignedTo(e.target.value)}
                                    className="w-full p-3 rounded-xl border border-purple-200 bg-white font-bold text-purple-800 focus:ring-2 focus:ring-purple-400 focus:outline-none cursor-pointer"
                                    required
                                >
                                    <option value="" disabled>-- Pilih Hero --</option>
                                    {linkedHeroes.map(hero => (
                                        <option key={hero.uid} value={hero.uid}>
                                            {hero.displayName} (Lv. {hero.level})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-bold text-slate-700 mb-2">Judul Quest</label>
                                <input
                                    type="text"
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Contoh: Selesaikan Modul ReactJS Bab 1"
                                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-purple-400 focus:outline-none transition-colors font-bold text-slate-800"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-bold text-slate-700 mb-2">Deskripsi Misi</label>
                                <textarea
                                    required
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={4}
                                    placeholder="Catat apa saja yang harus diselesaikan Hero..."
                                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-purple-400 focus:outline-none transition-colors font-medium text-slate-700 resize-none"
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-bold text-pink-600 mb-2">Penyemangat / Surat Cinta 💌 (Opsional)</label>
                                <textarea
                                    value={motivation}
                                    onChange={(e) => setMotivation(e.target.value)}
                                    rows={2}
                                    placeholder="Tulis kata-kata manis biar Hero makin semangat ngerjainnya..."
                                    className="w-full p-3 rounded-xl border border-pink-200 bg-pink-50 focus:bg-white focus:ring-2 focus:ring-pink-400 focus:outline-none transition-colors font-medium text-pink-900 resize-none"
                                />
                            </div>

                            {/* Grid Atribut Quest (Ditambah Kolom Bounty) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">EXP Reward ✨</label>
                                    <input
                                        type="number"
                                        required min={10} max={1000}
                                        value={expReward}
                                        onChange={(e) => setExpReward(e.target.value === '' ? '' : Number(e.target.value))}
                                        className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-black text-purple-600 focus:ring-2 focus:ring-purple-400 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-emerald-600 mb-2">Bounty Reward 💰 (Opsional)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-emerald-500">Rp</span>
                                        <input
                                            type="number"
                                            min={0}
                                            value={moneyReward}
                                            onChange={(e) => setMoneyReward(e.target.value === '' ? '' : Number(e.target.value))}
                                            placeholder="50000"
                                            className="w-full pl-10 pr-3 py-3 rounded-xl border border-emerald-200 bg-emerald-50 font-black text-emerald-700 focus:ring-2 focus:ring-emerald-400 focus:outline-none focus:bg-white transition-colors"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Tenggat Waktu (Deadline)</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={deadline}
                                        onChange={(e) => setDeadline(e.target.value)}
                                        className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 focus:ring-2 focus:ring-purple-400 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Rank (Difficulty)</label>
                                    <select
                                        value={difficulty}
                                        onChange={(e) => setDifficulty(e.target.value as any)}
                                        className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 focus:ring-2 focus:ring-purple-400 focus:outline-none cursor-pointer"
                                    >
                                        <option value="E">Rank E (Sangat Mudah)</option>
                                        <option value="D">Rank D (Mudah)</option>
                                        <option value="C">Rank C (Normal)</option>
                                        <option value="B">Rank B (Sulit)</option>
                                        <option value="A">Rank A (Sangat Sulit)</option>
                                        <option value="S">Rank S (Epic)</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Kategori</label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value as any)}
                                        className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 focus:ring-2 focus:ring-purple-400 focus:outline-none cursor-pointer"
                                    >
                                        <option value="daily">Daily</option>
                                        <option value="weekly">Weekly</option>
                                        <option value="main">Main Quest</option>
                                        <option value="side">Side Quest</option>
                                    </select>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                variant="primary"
                                isLoading={isSubmitting}
                                className="w-full py-4 text-lg bg-gradient-to-r from-purple-600 to-pink-500 shadow-lg shadow-purple-500/30 border-none"
                            >
                                Sebarkan Quest ke Hero ✨
                            </Button>
                        </Card>
                    </form>
                )}
            </div>
            <Toast isVisible={showToast} onClose={() => setShowToast(false)} message="Quest berhasil disebarkan ke Hero!" type="success" />
        </div>
    );
}
