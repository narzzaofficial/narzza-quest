'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Toast from '@/components/ui/Toast';

export default function MathMCQArena() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [timeLeft, setTimeLeft] = useState(60); // 60 detik bermain
    const [score, setScore] = useState(0);

    const [num1, setNum1] = useState(0);
    const [num2, setNum2] = useState(0);
    const [options, setOptions] = useState<number[]>([]);

    const [showToast, setShowToast] = useState(false);

    // Fungsi canggih pembuat pilihan ganda (MCQ) yang mengecoh
    const generateOptions = (correctAnswer: number) => {
        const newOptions = new Set<number>();
        newOptions.add(correctAnswer);

        while (newOptions.size < 4) {
            // Buat angka pengecoh yang dekat-dekat dengan jawaban asli
            const offset = Math.floor(Math.random() * 20) - 10; // -10 sampai +10
            const fakeAnswer = correctAnswer + offset;

            if (fakeAnswer > 0 && fakeAnswer !== correctAnswer) {
                newOptions.add(fakeAnswer);
            }
        }

        // Acak urutan array biar jawaban benar gak selalu di posisi sama
        return Array.from(newOptions).sort(() => Math.random() - 0.5);
    };

    const generateQuestion = () => {
        // Fokus perkalian 1 sampai 20 (bisa dinaikin ke 100 kalau berani!)
        const n1 = Math.floor(Math.random() * 15) + 2;
        const n2 = Math.floor(Math.random() * 15) + 2;

        setNum1(n1);
        setNum2(n2);
        setOptions(generateOptions(n1 * n2));
    };

    const startGame = () => {
        setIsPlaying(true);
        setScore(0);
        setTimeLeft(60);
        generateQuestion();
    };

    // Timer
    useEffect(() => {
        if (isPlaying && timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0 && isPlaying) {
            setIsPlaying(false);
            setShowToast(true);
        }
    }, [isPlaying, timeLeft]);

    // Handle klik jawaban
    const handleAnswerClick = (selectedAnswer: number) => {
        const correctAnswer = num1 * num2;

        if (selectedAnswer === correctAnswer) {
            setScore(score + 10);
        } else {
            // Hukuman kalau salah tebak, biar lebih seru
            setScore(Math.max(0, score - 5));
        }
        generateQuestion();
    };

    return (
        <div
            className="min-h-screen p-4 flex flex-col items-center justify-center relative overflow-hidden"
            style={{
                background: 'linear-gradient(135deg, #E0F2FE 0%, #DBEAFE 50%, #BFDBFE 100%)',
                fontFamily: 'var(--font-nunito), sans-serif'
            }}
        >
            <div className="absolute top-0 left-0 w-[40rem] h-[40rem] bg-blue-400/20 rounded-full blur-[100px] pointer-events-none" />

            <Link href="/arena" className="absolute top-8 left-8 text-blue-600 font-bold hover:text-blue-800 transition-colors z-20">
                ← Kembali ke Arena Hub
            </Link>

            <Card className="max-w-lg w-full text-center p-6 md:p-10 relative z-10 shadow-[0_20px_50px_rgba(59,130,246,0.15)] border-blue-200">
                <h1 className="text-3xl md:text-4xl font-bold text-blue-950 mb-2" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                    Multiplication MCQ 🎯
                </h1>
                <p className="text-blue-600 font-medium mb-8">Tebak hasil perkalian dengan cepat. Hati-hati, salah tebak skor berkurang!</p>

                {!isPlaying && timeLeft === 60 ? (
                    <Button variant="primary" onClick={startGame} className="w-full py-4 text-xl bg-gradient-to-r from-blue-500 to-indigo-500 shadow-blue-300">
                        Mulai Tantangan
                    </Button>
                ) : (
                    <div className="space-y-6">

                        {/* HUD / Header Info */}
                        <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-blue-100 shadow-sm">
                            <div className="text-left">
                                <p className="text-[10px] text-blue-500 font-extrabold uppercase tracking-widest">Sisa Waktu</p>
                                <p className={`text-2xl font-black ${timeLeft <= 10 ? 'text-rose-500 animate-pulse' : 'text-blue-800'}`}>
                                    00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-amber-500 font-extrabold uppercase tracking-widest">Total Skor</p>
                                <p className="text-2xl font-black text-amber-500">{score}</p>
                            </div>
                        </div>

                        {timeLeft > 0 ? (
                            <div className="py-2">
                                {/* Papan Soal */}
                                <div className="bg-blue-50 py-8 rounded-3xl border-2 border-blue-200 mb-6 shadow-inner">
                                    <p className="text-6xl md:text-7xl font-black text-blue-900 drop-shadow-sm" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                                        {num1} <span className="text-4xl text-blue-400">×</span> {num2}
                                    </p>
                                </div>

                                {/* Tombol Pilihan Ganda (Grid 2x2) */}
                                <div className="grid grid-cols-2 gap-4">
                                    {options.map((opt, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleAnswerClick(opt)}
                                            className="w-full py-4 md:py-5 rounded-2xl text-2xl font-bold bg-white text-blue-800 border-2 border-blue-100 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 transition-all active:scale-95 shadow-sm"
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="py-6">
                                <p className="text-2xl font-bold text-blue-900 mb-2">Waktu Habis!</p>
                                <p className="text-blue-600 mb-6">Skor Akhirmu: <span className="font-black text-amber-500 text-3xl ml-2">{score}</span></p>
                                <Button variant="primary" onClick={startGame} className="w-full bg-gradient-to-r from-blue-500 to-indigo-500">
                                    Main Lagi
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </Card>

            <Toast
                isVisible={showToast}
                onClose={() => setShowToast(false)}
                message={`MCQ Selesai! Kamu mengumpulkan ${score} poin.`}
                type="success"
            />
        </div>
    );
}