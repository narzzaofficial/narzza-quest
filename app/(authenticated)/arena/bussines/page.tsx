'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Toast from '@/components/ui/Toast';

const businessBank = [
    { question: 'Minimum Viable Product (Singkatan)', answer: 'mvp' },
    { question: 'Business to Business (Singkatan)', answer: 'b2b' },
    { question: 'Return on Investment (Singkatan)', answer: 'roi' },
    { question: 'Investor yang mendanai startup di tahap sangat awal', answer: 'angel investor' },
    { question: 'Presentasi singkat ke investor (2 kata)', answer: 'pitch deck' },
];

export default function BusinessArena() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [timeLeft, setTimeLeft] = useState(60);
    const [score, setScore] = useState(0);

    const [currentWord, setCurrentWord] = useState(businessBank[0]);
    const [userAnswer, setUserAnswer] = useState('');
    const [showToast, setShowToast] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const generateQuestion = () => {
        const randomIndex = Math.floor(Math.random() * businessBank.length);
        setCurrentWord(businessBank[randomIndex]);
        setUserAnswer('');
        if (inputRef.current) inputRef.current.focus();
    };

    const startGame = () => {
        setIsPlaying(true);
        setScore(0);
        setTimeLeft(60);
        generateQuestion();
    };

    useEffect(() => {
        if (isPlaying && timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0 && isPlaying) {
            setIsPlaying(false);
            setShowToast(true);
        }
    }, [isPlaying, timeLeft]);

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setUserAnswer(val);
        if (val.toLowerCase().trim() === currentWord.answer.toLowerCase()) {
            setScore(score + 15);
            generateQuestion();
        }
    };

    return (
        <div className="min-h-screen p-4 flex flex-col items-center justify-center relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 50%, #FDE68A 100%)', fontFamily: 'var(--font-nunito), sans-serif' }}>
            <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-amber-300/20 rounded-full blur-[100px] pointer-events-none" />

            <Link href="/arena" className="absolute top-8 left-8 text-amber-600 font-bold hover:text-amber-800 transition-colors">
                Kembali ke Arena
            </Link>

            <Card className="max-w-lg w-full text-center p-8 md:p-12 relative z-10 shadow-[0_20px_50px_rgba(245,158,11,0.1)] border-amber-100">
                <h1 className="text-4xl font-bold text-amber-950 mb-2" style={{ fontFamily: 'var(--font-playfair), serif' }}>Startup Terms 💼</h1>
                <p className="text-amber-600 font-medium mb-8">Tebak istilah startup & bisnis digital!</p>

                {!isPlaying && timeLeft === 60 ? (
                    <Button variant="primary" onClick={startGame} className="w-full py-4 text-xl bg-gradient-to-r from-amber-500 to-orange-400">Mulai Latihan</Button>
                ) : (
                    <div className="space-y-8">
                        <div className="flex justify-between items-center bg-amber-50 p-4 rounded-2xl border border-amber-100">
                            <div className="text-left">
                                <p className="text-xs text-amber-500 font-extrabold uppercase tracking-widest">Waktu</p>
                                <p className={`text-2xl font-black ${timeLeft <= 10 ? 'text-rose-500 animate-pulse' : 'text-amber-700'}`}>
                                    00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-amber-500 font-extrabold uppercase tracking-widest">Score</p>
                                <p className="text-2xl font-black text-orange-500">{score}</p>
                            </div>
                        </div>

                        {timeLeft > 0 ? (
                            <div className="py-6">
                                <p className="text-xl font-bold text-amber-900 mb-6 drop-shadow-sm">{currentWord.question}</p>
                                <input ref={inputRef} type="text" value={userAnswer} onChange={handleInput} placeholder="Ketik istilahnya..." className="w-full text-center text-2xl font-bold bg-white border-2 border-amber-200 rounded-2xl p-4 text-amber-900 focus:ring-4 focus:ring-amber-100 focus:border-amber-400 focus:outline-none transition-all" autoFocus />
                            </div>
                        ) : (
                            <div className="py-6">
                                <p className="text-2xl font-bold text-amber-900 mb-2">Waktu Habis!</p>
                                <p className="text-amber-600 mb-6">Total Skor: <span className="font-black text-orange-500">{score}</span></p>
                                <Button variant="primary" onClick={startGame} className="bg-gradient-to-r from-amber-500 to-orange-400">Main Lagi</Button>
                            </div>
                        )}
                    </div>
                )}
            </Card>
            <Toast isVisible={showToast} onClose={() => setShowToast(false)} message={`Latihan selesai! Kamu mendapatkan +${Math.floor(score / 3)} EXP.`} type="success" />
        </div>
    );
}