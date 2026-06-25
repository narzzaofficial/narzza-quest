'use client';

import React from 'react';
import { useEncourageHero } from '@/hooks/useEncourageHero';
import PageHeader from '@/components/ui/PageHeader';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import Toast from '@/components/ui/Toast';
import { BUFF_OPTIONS } from '@/constants/gm';
import { Send, Users, HeartHandshake, Loader2 } from 'lucide-react';

export default function EncourageHeroPage() {
    const {
        linkedHeroes,
        loadingHeroes,
        selectedHeroId,
        setSelectedHeroId,
        message,
        setMessage,
        buffType,
        setBuffType,
        isSending,
        showToast,
        setShowToast,
        send,
    } = useEncourageHero();

    const handleSend = async (ev: React.FormEvent) => {
        ev.preventDefault();
        await send();
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
                                onChange={(ev) => setSelectedHeroId(ev.target.value)}
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
                                {BUFF_OPTIONS.map((buff) => {
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
                                onChange={(ev) => setMessage(ev.target.value)}
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
