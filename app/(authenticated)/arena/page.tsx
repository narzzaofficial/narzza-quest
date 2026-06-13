'use client';

import React from 'react';
import Link from 'next/link';
import { Swords, Sparkles } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import GlassCard from '@/components/ui/GlassCard';

const arenaGames = [
    { id: 'vocab-en', title: 'English Vocabulary', icon: '🇬🇧', description: 'Tebak kosakata bahasa Inggris untuk persiapan karir internasional.', category: 'Language', expReward: '+10 EXP', grad: 'from-blue-500 to-cyan-400' },
    { id: 'vocab-jp', title: 'Japanese Kanji', icon: '🇯🇵', description: 'Latihan membaca & menebak arti Kanji, Hiragana, dan Katakana.', category: 'Language', expReward: '+15 EXP', grad: 'from-rose-500 to-red-400' },
    { id: 'math', title: 'Speed Math', icon: '🧮', description: 'Asah kecepatan komputasi dengan perhitungan matematika cepat.', category: 'Logic', expReward: '+10 EXP', grad: 'from-emerald-500 to-teal-400' },
    { id: 'logic', title: 'Logic & IQ', icon: '🧩', description: 'Pecahkan teka-teki logika & silogisme untuk menaikkan Intelligence.', category: 'Logic', expReward: '+20 EXP', grad: 'from-violet-600 to-indigo-500' },
    { id: 'math-mcq', title: 'Multiplication MCQ', icon: '🎯', description: 'Pilih jawaban benar dari perkalian acak. Salah = skor berkurang!', category: 'Logic', expReward: '+15 EXP', grad: 'from-indigo-500 to-blue-500' },
    { id: 'business', title: 'Startup Terms', icon: '💼', description: 'Tebak istilah bisnis, marketing, dan startup.', category: 'Career', expReward: '+15 EXP', grad: 'from-amber-500 to-orange-400' },
    { id: 'speaking', title: 'Public Speaking', icon: '🎙️', description: 'Latihan intonasi, artikulasi, dan kelancaran bicara dengan timer.', category: 'Career', expReward: '+25 EXP', grad: 'from-pink-500 to-rose-400' },
];

export default function ArenaHubPage() {
    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
            <PageHeader
                icon={<Swords className="w-6 h-6 text-white" />}
                title="Arena"
                subtitle="Asah kemampuanmu kapan saja & raih EXP tambahan."
                badge="Training Grounds"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {arenaGames.map((game) => (
                    <Link key={game.id} href={`/arena/${game.id}`} className="group">
                        <GlassCard className="relative overflow-hidden p-5 flex flex-col h-full hover:shadow-pop hover:-translate-y-1 transition-all">
                            <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-10 bg-gradient-to-br ${game.grad} group-hover:scale-150 transition-transform duration-700`} />
                            <div className="relative z-10 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm bg-gradient-to-br ${game.grad}`}>
                                        {game.icon}
                                    </div>
                                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-surface-2 text-ink-soft">{game.category}</span>
                                </div>
                                <h3 className="text-xl font-extrabold text-ink mb-1.5">{game.title}</h3>
                                <p className="text-ink-soft text-sm leading-relaxed mb-5 flex-1">{game.description}</p>
                                <div className="mt-auto pt-4 border-t border-line flex justify-between items-center">
                                    <span className="text-xs font-extrabold text-brand bg-brand-soft px-3 py-1.5 rounded-full">{game.expReward}</span>
                                    <span className="inline-flex items-center gap-1 text-sm font-bold text-brand group-hover:gap-2 transition-all">
                                        Mulai <Sparkles className="w-3.5 h-3.5" />
                                    </span>
                                </div>
                            </div>
                        </GlassCard>
                    </Link>
                ))}
            </div>
        </div>
    );
}
