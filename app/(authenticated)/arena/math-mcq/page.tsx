'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import Toast from '@/components/ui/Toast';

export default function MathMCQArena() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [timeLeft, setTimeLeft] = useState(60);
    const [score, setScore] = useState(0);
    const [num1, setNum1] = useState(0);
    const [num2, setNum2] = useState(0);
    const [options, setOptions] = useState<number[]>([]);
    const [showToast, setShowToast] = useState(false);

    const generateOptions = (correct: number) => {
        const opts = new Set<number>([correct]);
        while (opts.size < 4) {
            const fake = correct + (Math.floor(Math.random() * 20) - 10);
            if (fake > 0 && fake !== correct) opts.add(fake);
        }
        return Array.from(opts).sort(() => Math.random() - 0.5);
    };

    const generateQuestion = () => {
        const n1 = Math.floor(Math.random() * 15) + 2;
        const n2 = Math.floor(Math.random() * 15) + 2;
        setNum1(n1); setNum2(n2); setOptions(generateOptions(n1 * n2));
    };

    const startGame = () => { setIsPlaying(true); setScore(0); setTimeLeft(60); generateQuestion(); };

    useEffect(() => {
        if (isPlaying && timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0 && isPlaying) { setIsPlaying(false); setShowToast(true); }
    }, [isPlaying, timeLeft]);

    const handleAnswerClick = (selected: number) => {
        if (selected === num1 * num2) setScore(score + 10);
        else setScore(Math.max(0, score - 5));
        generateQuestion();
    };

    return (
        <div className="min-h-full p-4 flex flex-col items-center justify-center relative">
            <Link href="/arena" className="absolute top-6 left-6 inline-flex items-center gap-1.5 text-brand font-bold hover:text-brand-hover transition-colors">
                <ArrowLeft className="w-4 h-4" /> Arena
            </Link>
            <GlassCard className="max-w-lg w-full text-center p-6 md:p-10">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3 shadow-card" style={{ backgroundImage: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)' }}>🎯</div>
                <h1 className="text-3xl font-extrabold text-ink mb-1">Multiplication MCQ</h1>
                <p className="text-ink-soft font-medium mb-8">Tebak hasil perkalian — salah tebak skor berkurang!</p>

                {!isPlaying && timeLeft === 60 ? (
                    <Button variant="primary" onClick={startGame} size="lg" className="w-full">Mulai Tantangan</Button>
                ) : (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center bg-surface-2 p-4 rounded-xl">
                            <div className="text-left">
                                <p className="text-[10px] text-ink-muted font-extrabold uppercase tracking-widest">Sisa Waktu</p>
                                <p className={`text-2xl font-black ${timeLeft <= 10 ? 'text-danger animate-pulse' : 'text-ink'}`}>00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-ink-muted font-extrabold uppercase tracking-widest">Skor</p>
                                <p className="text-2xl font-black text-xp">{score}</p>
                            </div>
                        </div>

                        {timeLeft > 0 ? (
                            <div className="py-2">
                                <div className="bg-brand-soft py-8 rounded-2xl mb-6">
                                    <p className="text-6xl md:text-7xl font-black text-ink">{num1} <span className="text-4xl text-brand">×</span> {num2}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    {options.map((opt, idx) => (
                                        <button key={idx} onClick={() => handleAnswerClick(opt)} className="w-full py-4 md:py-5 rounded-2xl text-2xl font-bold bg-surface text-ink border-2 border-line hover:border-brand/40 hover:bg-brand-soft hover:text-brand transition-all active:scale-95">
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="py-6">
                                <p className="text-2xl font-bold text-ink mb-2">Waktu Habis!</p>
                                <p className="text-ink-soft mb-6">Skor akhir: <span className="font-black text-xp text-3xl ml-1">{score}</span></p>
                                <Button variant="primary" onClick={startGame} className="w-full">Main Lagi</Button>
                            </div>
                        )}
                    </div>
                )}
            </GlassCard>
            <Toast isVisible={showToast} onClose={() => setShowToast(false)} message={`MCQ selesai! Kamu mengumpulkan ${score} poin.`} type="success" />
        </div>
    );
}
