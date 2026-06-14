'use client';

import React, { useEffect, useState } from 'react';
import { Trophy, Flame, Sparkles, Crown, X } from 'lucide-react';
import type { Milestone } from '@/hooks/useMilestone';

// ── GM speeches ────────────────────────────────────────────────

const LEVEL_SPEECHES: Record<number, string> = {
    2: "Kamu sudah menapaki langkah pertamamu. Tapi ini baru awal — dungeon sesungguhnya menanti.",
    3: "Skill-mu mulai terbentuk. Pertahankan ritme ini, Journeyman.",
    4: "Kamu bukan lagi pemula. Skilled Fighter layak menyandang tanggung jawab lebih besar.",
    5: "Di sinilah banyak petualang menyerah. Tapi bukan kamu, Elite Warrior.",
    6: "Bukan hanya soal kekuatan, tapi juga kebijaksanaan. Kamu mulai menunjukkan keduanya.",
    7: "Master Tactician — apakah kamu siap menghadapi tantangan yang belum pernah kamu bayangkan?",
    8: "Grand Champion. Nama-mu mulai dikenal di antara para petualang terhebat.",
    9: "Hampir tidak ada yang bisa mencapai titik ini. Kamu bukan hampir semua orang.",
    10: "Mythic Legend. Ini bukan akhir — ini adalah awal dari legenda sejati.",
};

const STREAK_SPEECHES: Record<number, string> = {
    7: "7 hari tanpa henti. Konsistensi itu langka — kamu membuktikan kamu punya itu.",
    14: "Dua minggu berturut-turut. Ini bukan lagi kebetulan. Ini adalah karakter.",
    30: "Satu bulan penuh. Kamu telah membangun kebiasaan yang kebanyakan orang hanya impikan.",
    100: "100 hari. Luar biasa. Sejarah dicatat hari ini, Legenda.",
};

// ── Config per milestone type ──────────────────────────────────

interface Config {
    icon: React.ReactNode;
    accentFrom: string;
    accentTo: string;
    heading: string;
    sub: string;
    speech: string;
    particles: string[];
}

function getConfig(m: Milestone): Config {
    switch (m.type) {
        case 'level_up':
            return {
                icon: <Trophy className="w-8 h-8 text-white" />,
                accentFrom: '#4f7cff',
                accentTo: '#38bdf8',
                heading: 'Level Up!',
                sub: `Level ${m.level}  ${m.title ?? ''}`,
                speech: LEVEL_SPEECHES[m.level ?? 2] ?? "Terus maju, petualang!",
                particles: ['#4f7cff', '#38bdf8', '#a855f7', '#ec4899', '#ffffff'],
            };
        case 'first_quest':
            return {
                icon: <Sparkles className="w-8 h-8 text-white" />,
                accentFrom: '#10b981',
                accentTo: '#34d399',
                heading: 'Quest Pertama Selesai!',
                sub: 'Petualanganmu resmi dimulai',
                speech: "Selamat datang di dunia petualangan! Ini adalah momen yang akan kamu kenang. Petualangan terbesar selalu dimulai dari langkah pertama.",
                particles: ['#10b981', '#34d399', '#4f7cff', '#f59e0b', '#ffffff'],
            };
        case 'streak_7':
        case 'streak_14':
        case 'streak_30':
        case 'streak_100': {
            const n = Number(m.type.split('_')[1]) as 7 | 14 | 30 | 100;
            const isLegend = n >= 100;
            return {
                icon: isLegend
                    ? <Crown className="w-8 h-8 text-white" />
                    : <Flame className="w-8 h-8 text-white" />,
                accentFrom: isLegend ? '#f59e0b' : '#f97316',
                accentTo: isLegend ? '#fbbf24' : '#fb923c',
                heading: `${n} Hari Streak!`,
                sub: n >= 100 ? 'Legenda sejati' : n >= 30 ? 'Luar biasa!' : 'Konsistensi luar biasa',
                speech: STREAK_SPEECHES[n] ?? "Pertahankan semangat ini!",
                particles: ['#f97316', '#fb923c', '#fbbf24', '#ef4444', '#ffffff'],
            };
        }
    }
}

// ── Particle confetti ──────────────────────────────────────────

function Particles({ colors }: { colors: string[] }) {
    const items = Array.from({ length: 24 }, (_, i) => ({
        id: i,
        color: colors[i % colors.length],
        left: `${Math.random() * 100}%`,
        size: `${6 + Math.random() * 8}px`,
        delay: `${Math.random() * 0.8}s`,
        duration: `${1.6 + Math.random() * 1.2}s`,
    }));

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
            {items.map(p => (
                <div
                    key={p.id}
                    className="absolute bottom-0 rounded-full opacity-0"
                    style={{
                        left: p.left,
                        width: p.size,
                        height: p.size,
                        backgroundColor: p.color,
                        animation: `floatUp ${p.duration} ease-out ${p.delay} forwards`,
                    }}
                />
            ))}
        </div>
    );
}

// ── Modal ──────────────────────────────────────────────────────

interface Props {
    milestone: Milestone | null;
    onDismiss: () => void;
}

export function MilestoneModal({ milestone, onDismiss }: Props) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (milestone) {
            // tiny delay so CSS transition plays
            requestAnimationFrame(() => setVisible(true));
        } else {
            setVisible(false);
        }
    }, [milestone]);

    if (!milestone) return null;

    const cfg = getConfig(milestone);

    const handleDismiss = () => {
        setVisible(false);
        setTimeout(onDismiss, 200);
    };

    return (
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            style={{
                background: 'rgba(22, 32, 58, 0.55)',
                backdropFilter: 'blur(6px)',
                opacity: visible ? 1 : 0,
                transition: 'opacity 0.2s ease',
            }}
            onClick={handleDismiss}
        >
            <div
                className="relative w-full max-w-md rounded-card shadow-pop bg-surface overflow-hidden"
                style={{
                    transform: visible ? 'scale(1) translateY(0)' : 'scale(0.9) translateY(16px)',
                    transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Particle confetti */}
                <Particles colors={cfg.particles} />

                {/* Gradient header */}
                <div
                    className="px-8 pt-10 pb-8 flex flex-col items-center gap-4 text-center"
                    style={{ background: `linear-gradient(135deg, ${cfg.accentFrom} 0%, ${cfg.accentTo} 100%)` }}
                >
                    {/* Icon */}
                    <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center shadow-card">
                        {cfg.icon}
                    </div>
                    <div>
                        <h2 className="text-white font-extrabold text-3xl leading-tight">{cfg.heading}</h2>
                        <p className="text-white/75 text-base font-semibold mt-1">{cfg.sub}</p>
                    </div>
                </div>

                {/* Body */}
                <div className="px-8 py-6 space-y-4">
                    {/* GM quote */}
                    <div className="bg-brand-soft rounded-xl px-4 py-3 flex gap-2.5">
                        <Sparkles className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                        <p className="text-ink-soft text-sm italic leading-relaxed">
                            "{cfg.speech}"
                        </p>
                    </div>

                    {/* CTA */}
                    <button
                        onClick={handleDismiss}
                        className="w-full py-3 rounded-xl font-bold text-sm text-white transition-colors"
                        style={{ background: `linear-gradient(135deg, ${cfg.accentFrom} 0%, ${cfg.accentTo} 100%)` }}
                    >
                        Lanjutkan Petualangan
                    </button>
                </div>

                {/* Close */}
                <button
                    onClick={handleDismiss}
                    className="absolute top-3 right-3 p-1.5 text-white/50 hover:text-white hover:bg-white/15 rounded-lg transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
