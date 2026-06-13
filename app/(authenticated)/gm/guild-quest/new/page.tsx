'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { createGuildQuest, getLinkedProfiles } from '@/lib/db';
import { UserProfile } from '@/types';
import PageHeader from '@/components/ui/PageHeader';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import Toast from '@/components/ui/Toast';
import { Swords, Users, AlertCircle, Loader2 } from 'lucide-react';

const field = 'w-full p-3 rounded-xl border border-line bg-surface text-ink font-bold outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/15 transition';
const label = 'block text-sm font-bold text-ink-soft mb-2';

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
            getLinkedProfiles(profile.partnerIds).then((heroes) => {
                const players = heroes.filter((h) => h.role === 'player');
                setLinkedHeroes(players);
                setMaxClaims(Math.max(1, players.length));
                setLoadingHeroes(false);
            });
        } else {
            setLoadingHeroes(false);
        }
    }, [profile]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile) return;
        if (linkedHeroes.length === 0) { alert('Kamu belum punya Hero yang terhubung!'); return; }
        if (maxClaims === '' || maxClaims < 1 || maxClaims > linkedHeroes.length) { alert(`Kuota harus 1 sampai ${linkedHeroes.length}.`); return; }
        if (expReward === '' || expReward < 10) { alert('EXP minimal 10.'); return; }

        setIsSubmitting(true);
        try {
            await createGuildQuest({
                title, description, motivation, category, difficulty,
                expReward: Number(expReward), moneyReward: Number(moneyReward),
                deadline: new Date(deadline).toISOString(),
                createdBy: profile.uid, createdByName: profile.displayName,
                maxClaims: Number(maxClaims),
            }, linkedHeroes.map((h) => h.uid));
            setShowToast(true);
            setTimeout(() => router.push('/gm/guild-quest'), 1200);
        } catch (error) {
            console.error('Gagal membuat Guild Quest:', error);
            alert('Gagal membuat Guild Quest. Coba lagi.');
            setIsSubmitting(false);
        }
    };

    if (loadingHeroes) {
        return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-8 h-8 text-brand animate-spin" /></div>;
    }

    return (
        <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-6">
            <PageHeader
                grad="sky"
                icon={<Swords className="w-6 h-6 text-white" />}
                title="Buka Guild Quest"
                subtitle="Quest terbuka yang bisa diambil hero-mu. Siapa cepat dia dapat!"
            />

            {linkedHeroes.length === 0 ? (
                <EmptyState icon={AlertCircle} title="Guild masih kosong" desc="Kamu belum punya hero terhubung." action={<Link href="/network" className="inline-flex items-center gap-2 rounded-xl bg-brand text-white px-5 py-2.5 font-bold text-sm hover:bg-brand-hover transition">Undang Hero</Link>} />
            ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                    <GlassCard className="p-4 flex items-start gap-3">
                        <Users className="w-5 h-5 text-brand shrink-0 mt-0.5" />
                        <div>
                            <p className="text-ink font-bold text-sm">Bisa diambil beberapa hero sekaligus.</p>
                            <p className="text-ink-soft text-xs mt-0.5">Kamu punya <span className="font-bold text-brand">{linkedHeroes.length} hero</span> terhubung. Atur kuota di bawah.</p>
                        </div>
                    </GlassCard>

                    <GlassCard className="p-6 space-y-5">
                        <div>
                            <label className={label}>Judul Quest</label>
                            <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Contoh: Buat 1 project portfolio minggu ini" className={field} />
                        </div>
                        <div>
                            <label className={label}>Deskripsi Misi</label>
                            <textarea required value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Apa yang harus diselesaikan…" className={`${field} resize-none`} />
                        </div>
                        <div>
                            <label className={label}>Penyemangat 💌 (opsional)</label>
                            <textarea value={motivation} onChange={(e) => setMotivation(e.target.value)} rows={2} placeholder="Kata-kata semangat…" className={`${field} resize-none`} />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className={label}>EXP Reward ✨</label>
                                <input type="number" required min={10} max={1000} value={expReward} onChange={(e) => setExpReward(e.target.value === '' ? '' : Number(e.target.value))} className={field} />
                            </div>
                            <div>
                                <label className={label}>Bounty 💰 (opsional)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-ink-muted text-sm">Rp</span>
                                    <input type="number" min={0} value={moneyReward} onChange={(e) => setMoneyReward(e.target.value === '' ? '' : Number(e.target.value))} placeholder="0" className={`${field} pl-10`} />
                                </div>
                            </div>
                            <div>
                                <label className={label}>Deadline</label>
                                <input type="datetime-local" required value={deadline} onChange={(e) => setDeadline(e.target.value)} className={field} />
                            </div>
                            <div>
                                <label className={label}>Rank</label>
                                <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as typeof difficulty)} className={field}>
                                    <option value="E">Rank E</option><option value="D">Rank D</option><option value="C">Rank C</option>
                                    <option value="B">Rank B</option><option value="A">Rank A</option><option value="S">Rank S (Epic)</option>
                                </select>
                            </div>
                            <div className="sm:col-span-2">
                                <label className={label}>Kategori</label>
                                <select value={category} onChange={(e) => setCategory(e.target.value as typeof category)} className={field}>
                                    <option value="daily">Daily</option><option value="weekly">Weekly</option>
                                    <option value="main">Main Quest</option><option value="side">Side Quest</option>
                                </select>
                            </div>
                        </div>

                        <div className="bg-xp-soft rounded-xl p-4">
                            <label className="text-sm font-bold text-ink mb-3 flex items-center gap-2"><Users className="w-4 h-4 text-xp" /> Kuota Maksimal Hero</label>
                            <input type="number" required min={1} max={linkedHeroes.length} value={maxClaims} onChange={(e) => setMaxClaims(e.target.value === '' ? '' : Number(e.target.value))} className="w-full p-3 rounded-xl border border-line bg-surface text-ink font-black text-2xl text-center outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/15" />
                            <p className="text-ink-muted text-xs mt-2 text-center">Maks {linkedHeroes.length} hero. Begitu penuh, quest otomatis ditutup.</p>
                        </div>

                        <Button type="submit" variant="primary" isLoading={isSubmitting} className="w-full" size="lg">
                            Publikasikan Guild Quest ⚔️
                        </Button>
                    </GlassCard>
                </form>
            )}

            <Toast isVisible={showToast} onClose={() => setShowToast(false)} message="Guild Quest berhasil dipublikasikan!" type="success" />
        </div>
    );
}
