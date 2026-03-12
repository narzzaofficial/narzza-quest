'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { sendNotification, getLinkedProfiles } from '@/lib/db';
import { UserProfile } from '@/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Toast from '@/components/ui/Toast';
import { Heart, Brain, Zap, Coffee, Send, Users } from 'lucide-react';

export default function EncourageHeroPage() {
    const { profile } = useAuth();

    const [linkedHeroes, setLinkedHeroes] = useState<UserProfile[]>([]);
    const [loadingHeroes, setLoadingHeroes] = useState(true);

    // Form State
    const [selectedHeroId, setSelectedHeroId] = useState('');
    const [message, setMessage] = useState('');
    const [buffType, setBuffType] = useState('Kasih Sayang');

    const [isSending, setIsSending] = useState(false);
    const [showToast, setShowToast] = useState(false);

    // 1. Ambil daftar Hero
    useEffect(() => {
        if (profile?.partnerIds && profile.partnerIds.length > 0) {
            getLinkedProfiles(profile.partnerIds).then(heroes => {
                const playersOnly = heroes.filter(h => h.role === 'player');
                setLinkedHeroes(playersOnly);
                if (playersOnly.length > 0) {
                    setSelectedHeroId(playersOnly[0].uid);
                }
                setLoadingHeroes(false);
            });
        } else {
            setLoadingHeroes(false);
        }
    }, [profile]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile) return;
        if (!selectedHeroId) {
            alert("Pilih Hero terlebih dahulu!");
            return;
        }
        if (!message.trim()) return;

        setIsSending(true);
        try {
            await sendNotification({
                toUid: selectedHeroId, // Kirim ke Hero yang dipilih
                fromUid: profile.uid,
                fromName: profile.displayName,
                type: 'encouragement',
                title: `Mantra Semangat: ${buffType}`,
                message: message,
            });

            setShowToast(true);
            setMessage('');
        } catch (error) {
            console.error("Gagal mengirim semangat:", error);
            alert("Gagal mengirim pesan. Coba lagi.");
        } finally {
            setIsSending(false);
        }
    };

    const buffOptions = [
        { name: 'Kasih Sayang', icon: <Heart className="w-5 h-5" /> },
        { name: 'Fokus Penuh', icon: <Brain className="w-5 h-5" /> },
        { name: 'Extra Energi', icon: <Zap className="w-5 h-5" /> },
        { name: 'Secangkir Kopi', icon: <Coffee className="w-5 h-5" /> }
    ];

    if (loadingHeroes) {
        return <div className="min-h-screen flex items-center justify-center font-bold text-pink-600">Mencari Hero di Guild...</div>;
    }

    return (
        <div
            className="min-h-screen p-4 md:p-8 flex items-center justify-center relative overflow-hidden text-slate-800"
            style={{
                background: 'linear-gradient(135deg, #FDF2F8 0%, #F3E8FF 100%)',
                fontFamily: 'var(--font-nunito), sans-serif'
            }}
        >
            <div className="max-w-xl w-full relative z-10">
                <Card className="border-pink-100 shadow-[0_20px_60px_rgba(244,114,182,0.1)] bg-white">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-pink-50 text-pink-500 mb-4 border border-pink-100 shadow-sm">
                            <Send className="w-8 h-8 ml-1" />
                        </div>
                        <h1 className="text-3xl font-bold text-purple-950 mb-2" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                            Kirim Mantra Semangat
                        </h1>
                        <p className="text-slate-500 font-medium text-sm md:text-base">
                            Berikan buff spesial agar Hero di guild-mu makin produktif!
                        </p>
                    </div>

                    {linkedHeroes.length === 0 ? (
                        <div className="text-center p-6 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-rose-500 font-bold mb-1">Guild Masih Kosong</p>
                            <p className="text-slate-500 text-sm">Undang Hero di Dashboard untuk mulai mengirim semangat.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSend} className="space-y-6">

                            {/* DROPDOWN PILIH HERO */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-extrabold text-purple-900 mb-2 uppercase tracking-widest">
                                    <Users className="w-4 h-4" /> Pilih Target Hero
                                </label>
                                <select
                                    value={selectedHeroId}
                                    onChange={(e) => setSelectedHeroId(e.target.value)}
                                    className="w-full p-3.5 rounded-xl border border-purple-200 bg-purple-50 font-bold text-purple-800 focus:ring-2 focus:ring-pink-400 focus:outline-none cursor-pointer transition-all shadow-sm"
                                    required
                                >
                                    {linkedHeroes.map(hero => (
                                        <option key={hero.uid} value={hero.uid}>
                                            {hero.displayName} (Lv. {hero.level})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* PILIH BUFF */}
                            <div>
                                <label className="block text-sm font-extrabold text-slate-700 mb-3 uppercase tracking-widest">Pilih Jenis Buff</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {buffOptions.map(buff => (
                                        <div
                                            key={buff.name}
                                            onClick={() => setBuffType(buff.name)}
                                            className={`p-3 rounded-xl border flex items-center justify-center gap-2 cursor-pointer font-bold transition-all ${buffType === buff.name
                                                    ? 'border-pink-400 bg-pink-50 text-pink-600 shadow-sm'
                                                    : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:border-slate-300'
                                                }`}
                                        >
                                            {buff.icon}
                                            <span className="text-xs md:text-sm">{buff.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* PESAN */}
                            <div>
                                <label className="block text-sm font-extrabold text-slate-700 mb-2 uppercase tracking-widest">Pesan Pribadi</label>
                                <textarea
                                    required
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    rows={4}
                                    placeholder="Ketik pesan semangatmu di sini..."
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-pink-400 focus:outline-none resize-none transition-all placeholder:text-slate-400"
                                />
                            </div>

                            <Button
                                type="submit"
                                variant="primary"
                                className="w-full py-4 text-base md:text-lg bg-gradient-to-r from-pink-500 to-rose-400 shadow-[0_10px_30px_rgba(244,114,182,0.2)] border-none text-white flex items-center justify-center gap-2 hover:-translate-y-0.5"
                                isLoading={isSending}
                            >
                                <Send className="w-5 h-5" /> Kirim Mantra Semangat
                            </Button>
                        </form>
                    )}
                </Card>
            </div>
            <Toast isVisible={showToast} onClose={() => setShowToast(false)} message="Pesan semangat berhasil terbang ke layar Hero!" type="success" />
        </div>
    );
}