'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { createQuest, getLinkedProfiles } from '@/lib/db';
import { UserProfile } from '@/types';
import PageHeader from '@/components/ui/PageHeader';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import Toast from '@/components/ui/Toast';
import { ScrollText, Zap, Link2Off, Loader2 } from 'lucide-react';

const field = 'w-full p-3 rounded-xl border border-line bg-surface text-ink font-bold outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/15 transition';
const label = 'block text-sm font-bold text-ink-soft mb-2';

export default function CreateQuestPage() {
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
    const [assignedTo, setAssignedTo] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        if (profile?.partnerIds && profile.partnerIds.length > 0) {
            getLinkedProfiles(profile.partnerIds).then((heroes) => {
                const players = heroes.filter((h) => h.role === 'player');
                setLinkedHeroes(players);
                if (players.length > 0) setAssignedTo(players[0].uid);
                setLoadingHeroes(false);
            });
        } else {
            setLoadingHeroes(false);
        }
    }, [profile]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile) return;
        if (!assignedTo) { alert('Pilih minimal satu Hero untuk ditugaskan!'); return; }
        if (expReward === '' || expReward < 10) { alert('EXP minimal 10.'); return; }

        setIsSubmitting(true);
        try {
            await createQuest({
                title, description, motivation,
                expReward: Number(expReward), moneyReward: Number(moneyReward),
                difficulty, category,
                deadline: new Date(deadline).toISOString(),
                status: 'pending', assignedTo, createdBy: profile.uid,
            }, { uid: profile.uid, displayName: profile.displayName });
            setShowToast(true);
            setTimeout(() => router.push('/gm/quests'), 1200);
        } catch (error) {
            console.error('Gagal membuat quest:', error);
            alert('Gagal membuat quest. Coba lagi.');
            setIsSubmitting(false);
        }
    };

    if (loadingHeroes) {
        return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-8 h-8 text-brand animate-spin" /></div>;
    }

    return (
        <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-6">
            <PageHeader
                icon={<ScrollText className="w-6 h-6 text-white" />}
                title="Rancang Misi Baru"
                subtitle="Buat quest & tugaskan ke hero di guild-mu."
                actions={
                    <Link href="/gm/quests/new/json" className="inline-flex items-center gap-2 rounded-xl bg-white/15 ring-1 ring-white/25 text-white px-4 py-2.5 font-bold text-sm hover:bg-white/25 transition">
                        <Zap className="w-4 h-4" /> JSON Batch
                    </Link>
                }
            />

            {linkedHeroes.length === 0 ? (
                <EmptyState icon={Link2Off} title="Guild masih kosong" desc="Undang hero dulu untuk bisa memberi tugas." action={<Link href="/network" className="inline-flex items-center gap-2 rounded-xl bg-brand text-white px-5 py-2.5 font-bold text-sm hover:bg-brand-hover transition">Buka Network</Link>} />
            ) : (
                <form onSubmit={handleSubmit}>
                    <GlassCard className="p-6 md:p-8 space-y-5">
                        <div className="p-4 bg-brand-soft rounded-xl">
                            <label className="block text-sm font-extrabold text-brand mb-2 uppercase tracking-widest">Tugaskan Kepada</label>
                            <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} required className={field}>
                                <option value="" disabled>-- Pilih Hero --</option>
                                {linkedHeroes.map((h) => <option key={h.uid} value={h.uid}>{h.displayName} (Lv. {h.level})</option>)}
                            </select>
                        </div>

                        <div>
                            <label className={label}>Judul Quest</label>
                            <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Contoh: Selesaikan Modul React Bab 1" className={field} />
                        </div>
                        <div>
                            <label className={label}>Deskripsi Misi</label>
                            <textarea required value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Apa yang harus diselesaikan hero…" className={`${field} resize-none`} />
                        </div>
                        <div>
                            <label className={label}>Penyemangat 💌 (opsional)</label>
                            <textarea value={motivation} onChange={(e) => setMotivation(e.target.value)} rows={2} placeholder="Kata-kata semangat untuk hero…" className={`${field} resize-none`} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className={label}>EXP Reward ✨</label>
                                <input type="number" required min={10} max={1000} value={expReward} onChange={(e) => setExpReward(e.target.value === '' ? '' : Number(e.target.value))} className={field} />
                            </div>
                            <div>
                                <label className={label}>Bounty 💰 (opsional)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-ink-muted">Rp</span>
                                    <input type="number" min={0} value={moneyReward} onChange={(e) => setMoneyReward(e.target.value === '' ? '' : Number(e.target.value))} placeholder="50000" className={`${field} pl-10`} />
                                </div>
                            </div>
                            <div>
                                <label className={label}>Deadline</label>
                                <input type="datetime-local" required value={deadline} onChange={(e) => setDeadline(e.target.value)} className={field} />
                            </div>
                            <div>
                                <label className={label}>Rank</label>
                                <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as typeof difficulty)} className={field}>
                                    <option value="E">Rank E (Sangat Mudah)</option>
                                    <option value="D">Rank D (Mudah)</option>
                                    <option value="C">Rank C (Normal)</option>
                                    <option value="B">Rank B (Sulit)</option>
                                    <option value="A">Rank A (Sangat Sulit)</option>
                                    <option value="S">Rank S (Epic)</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className={label}>Kategori</label>
                                <select value={category} onChange={(e) => setCategory(e.target.value as typeof category)} className={field}>
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="main">Main Quest</option>
                                    <option value="side">Side Quest</option>
                                </select>
                            </div>
                        </div>

                        <Button type="submit" variant="primary" isLoading={isSubmitting} className="w-full" size="lg">
                            Sebarkan Quest ke Hero ✨
                        </Button>
                    </GlassCard>
                </form>
            )}

            <Toast isVisible={showToast} onClose={() => setShowToast(false)} message="Quest berhasil disebarkan ke Hero!" type="success" />
        </div>
    );
}
