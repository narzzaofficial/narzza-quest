'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { sendNotification, getLinkedProfiles } from '@/lib/db';
import { UserProfile } from '@/types';
import PageHeader from '@/components/ui/PageHeader';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import Toast from '@/components/ui/Toast';
import { Heart, Brain, Zap, Coffee, Send, Users, HeartHandshake, Loader2 } from 'lucide-react';

const buffOptions = [
    { name: 'Kasih Sayang', icon: Heart },
    { name: 'Fokus Penuh', icon: Brain },
    { name: 'Extra Energi', icon: Zap },
    { name: 'Secangkir Kopi', icon: Coffee },
];

export default function EncourageHeroPage() {
    const { profile } = useAuth();
    const [linkedHeroes, setLinkedHeroes] = useState<UserProfile[]>([]);
    const [loadingHeroes, setLoadingHeroes] = useState(true);
    const [selectedHeroId, setSelectedHeroId] = useState('');
    const [message, setMessage] = useState('');
    const [buffType, setBuffType] = useState('Kasih Sayang');
    const [isSending, setIsSending] = useState(false);
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        if (profile?.partnerIds && profile.partnerIds.length > 0) {
            getLinkedProfiles(profile.partnerIds).then((heroes) => {
                const players = heroes.filter((h) => h.role === 'player');
                setLinkedHeroes(players);
                if (players.length > 0) setSelectedHeroId(players[0].uid);
                setLoadingHeroes(false);
            });
        } else {
            setLoadingHeroes(false);
        }
    }, [profile]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile || !selectedHeroId || !message.trim()) {
            if (!selectedHeroId) alert('Pilih Hero terlebih dahulu!');
            return;
        }
        setIsSending(true);
        try {
            await sendNotification({
                toUid: selectedHeroId,
                fromUid: profile.uid,
                fromName: profile.displayName,
                type: 'encouragement',
                title: `Mantra Semangat: ${buffType}`,
                message,
            });
            setShowToast(true);
            setMessage('');
        } catch (error) {
            console.error('Gagal mengirim semangat:', error);
            alert('Gagal mengirim pesan. Coba lagi.');
        } finally {
            setIsSending(false);
        }
    };

    if (loadingHeroes) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-brand animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-6">
            <PageHeader
                grad="amber"
                icon={<HeartHandshake className="w-6 h-6 text-white" />}
                title="Kirim Semangat"
                subtitle="Berikan buff spesial agar hero makin produktif!"
            />

            {linkedHeroes.length === 0 ? (
                <EmptyState icon={Users} title="Guild masih kosong" desc="Undang hero di Network untuk mulai mengirim semangat." />
            ) : (
                <GlassCard className="p-5 md:p-6">
                    <form onSubmit={handleSend} className="space-y-6">
                        <div>
                            <label className="flex items-center gap-2 text-xs font-extrabold text-ink-soft mb-2 uppercase tracking-widest">
                                <Users className="w-4 h-4" /> Target Hero
                            </label>
                            <select
                                value={selectedHeroId}
                                onChange={(e) => setSelectedHeroId(e.target.value)}
                                required
                                className="w-full p-3.5 rounded-xl border border-line bg-surface font-bold text-ink outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/15 cursor-pointer transition"
                            >
                                {linkedHeroes.map((hero) => (
                                    <option key={hero.uid} value={hero.uid}>{hero.displayName} (Lv. {hero.level})</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-extrabold text-ink-soft mb-3 uppercase tracking-widest">Jenis Buff</label>
                            <div className="grid grid-cols-2 gap-3">
                                {buffOptions.map((buff) => {
                                    const active = buffType === buff.name;
                                    return (
                                        <button
                                            type="button"
                                            key={buff.name}
                                            onClick={() => setBuffType(buff.name)}
                                            className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition-all ${active ? 'border-brand/30 bg-brand-soft text-brand' : 'border-line bg-surface text-ink-soft hover:bg-surface-2'}`}
                                        >
                                            <buff.icon className="w-5 h-5" />
                                            <span className="text-xs md:text-sm">{buff.name}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-extrabold text-ink-soft mb-2 uppercase tracking-widest">Pesan Pribadi</label>
                            <textarea
                                required
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows={4}
                                placeholder="Ketik pesan semangatmu di sini…"
                                className="w-full bg-surface border border-line rounded-xl p-4 text-ink font-medium outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/15 resize-none transition placeholder:text-ink-muted"
                            />
                        </div>

                        <Button type="submit" variant="primary" isLoading={isSending} className="w-full">
                            <Send className="w-5 h-5 mr-2" /> Kirim Mantra Semangat
                        </Button>
                    </form>
                </GlassCard>
            )}

            <Toast isVisible={showToast} onClose={() => setShowToast(false)} message="Pesan semangat berhasil terkirim ke Hero!" type="success" />
        </div>
    );
}
