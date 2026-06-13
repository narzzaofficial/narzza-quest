'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import Toast from '@/components/ui/Toast';

const jpBank = [
    { question: '水 (Air)', answer: 'mizu' },
    { question: '火 (Api)', answer: 'hi' },
    { question: '木 (Pohon)', answer: 'ki' },
    { question: '月 (Bulan)', answer: 'tsuki' },
    { question: 'ありがとう (Terima kasih)', answer: 'arigatou' },
    { question: 'さようなら (Selamat tinggal)', answer: 'sayounara' },
];

export default function JapaneseArena() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [timeLeft, setTimeLeft] = useState(60);
    const [score, setScore] = useState(0);
    const [currentWord, setCurrentWord] = useState(jpBank[0]);
    const [userAnswer, setUserAnswer] = useState('');
    const [showToast, setShowToast] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const generateQuestion = () => {
        setCurrentWord(jpBank[Math.floor(Math.random() * jpBank.length)]);
        setUserAnswer('');
        if (inputRef.current) inputRef.current.focus();
    };

    const startGame = () => { setIsPlaying(true); setScore(0); setTimeLeft(60); generateQuestion(); };

    useEffect(() => {
        if (isPlaying && timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0 && isPlaying) { setIsPlaying(false); setShowToast(true); }
    }, [isPlaying, timeLeft]);

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setUserAnswer(val);
        if (val.toLowerCase().trim() === currentWord.answer.toLowerCase()) { setScore(score + 15); generateQuestion(); }
    };

    return (
        <div className="min-h-full p-4 flex flex-col items-center justify-center relative">
            <Link href="/arena" className="absolute top-6 left-6 inline-flex items-center gap-1.5 text-brand font-bold hover:text-brand-hover transition-colors">
                <ArrowLeft className="w-4 h-4" /> Arena
            </Link>
            <GlassCard className="max-w-lg w-full text-center p-8 md:p-12">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3 shadow-card" style={{ backgroundImage: 'linear-gradient(135deg, #f43f5e 0%, #fb7185 100%)' }}>🇯🇵</div>
                <h1 className="text-3xl font-extrabold text-ink mb-1">Japanese Kanji</h1>
                <p className="text-ink-soft font-medium mb-8">Ketik Romaji (cara baca) dari kata di bawah!</p>

                {!isPlaying && timeLeft === 60 ? (
                    <Button variant="primary" onClick={startGame} size="lg" className="w-full">Mulai Latihan</Button>
                ) : (
                    <div className="space-y-8">
                        <div className="flex justify-between items-center bg-surface-2 p-4 rounded-xl">
                            <div className="text-left">
                                <p className="text-[10px] text-ink-muted font-extrabold uppercase tracking-widest">Waktu</p>
                                <p className={`text-2xl font-black ${timeLeft <= 10 ? 'text-danger animate-pulse' : 'text-ink'}`}>00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-ink-muted font-extrabold uppercase tracking-widest">Score</p>
                                <p className="text-2xl font-black text-xp">{score}</p>
                            </div>
                        </div>
                        {timeLeft > 0 ? (
                            <div className="py-6">
                                <p className="text-4xl font-bold text-ink mb-6">{currentWord.question}</p>
                                <input ref={inputRef} type="text" value={userAnswer} onChange={handleInput} placeholder="Ketik romaji…" autoFocus className="w-full text-center text-2xl font-bold bg-surface border-2 border-line rounded-2xl p-4 text-ink focus:ring-4 focus:ring-brand/15 focus:border-brand/50 outline-none transition" />
                            </div>
                        ) : (
                            <div className="py-6">
                                <p className="text-2xl font-bold text-ink mb-2">Waktu Habis!</p>
                                <p className="text-ink-soft mb-6">Total skor: <span className="font-black text-xp">{score}</span></p>
                                <Button variant="primary" onClick={startGame}>Main Lagi</Button>
                            </div>
                        )}
                    </div>
                )}
            </GlassCard>
            <Toast isVisible={showToast} onClose={() => setShowToast(false)} message={`Latihan selesai! Kamu dapat +${Math.floor(score / 3)} EXP.`} type="success" />
        </div>
    );
}
