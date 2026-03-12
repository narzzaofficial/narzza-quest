    'use client';

    import React, { useState, useEffect, useRef } from 'react';
    import Link from 'next/link';
    import Card from '@/components/ui/Card';
    import Button from '@/components/ui/Button';
    import Toast from '@/components/ui/Toast';

    export default function SpeedMathArena() {
        const [isPlaying, setIsPlaying] = useState(false);
        const [timeLeft, setTimeLeft] = useState(30); // 30 detik
        const [score, setScore] = useState(0);

        // Game State
        const [num1, setNum1] = useState(0);
        const [num2, setNum2] = useState(0);
        const [userAnswer, setUserAnswer] = useState('');

        // Notifikasi
        const [showToast, setShowToast] = useState(false);
        const inputRef = useRef<HTMLInputElement>(null);

        // Generate soal baru
        const generateQuestion = () => {
            setNum1(Math.floor(Math.random() * 50) + 1);
            setNum2(Math.floor(Math.random() * 50) + 1);
            setUserAnswer('');
            if (inputRef.current) inputRef.current.focus();
        };

        const startGame = () => {
            setIsPlaying(true);
            setScore(0);
            setTimeLeft(30);
            generateQuestion();
        };

        // Timer Logic
        useEffect(() => {
            if (isPlaying && timeLeft > 0) {
                const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
                return () => clearTimeout(timer);
            } else if (timeLeft === 0 && isPlaying) {
                setIsPlaying(false);
                setShowToast(true); // Game Over, show reward
            }
        }, [isPlaying, timeLeft]);

        // Cek Jawaban otomatis saat ngetik
        const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
            const val = e.target.value;
            setUserAnswer(val);

            if (parseInt(val) === num1 + num2) {
                setScore(score + 10);
                generateQuestion();
            }
        };

        return (
            <div
                className="min-h-screen p-4 flex flex-col items-center justify-center relative overflow-hidden"
                style={{
                    background: 'linear-gradient(135deg, #D1FAE5 0%, #ECFDF5 50%, #F0FDF4 100%)', // Emerald pastel theme
                    fontFamily: 'var(--font-nunito), sans-serif'
                }}
            >
                <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-emerald-300/20 rounded-full blur-[100px] pointer-events-none" />

                <Link href="/arena" className="absolute top-8 left-8 text-emerald-600 font-bold hover:text-emerald-800 transition-colors">
                    Kembali ke Arena Hub
                </Link>

                <Card className="max-w-lg w-full text-center p-8 md:p-12 relative z-10 shadow-[0_20px_50px_rgba(16,185,129,0.1)] border-emerald-100">
                    <h1 className="text-4xl font-bold text-emerald-950 mb-2" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                        Speed Math 🧮
                    </h1>
                    <p className="text-emerald-600 font-medium mb-8">Selesaikan sebanyak mungkin dalam 30 detik!</p>

                    {!isPlaying && timeLeft === 30 ? (
                        <Button variant="primary" onClick={startGame} className="w-full py-4 text-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:shadow-[0_8px_25px_rgba(16,185,129,0.3)]">
                            Mulai Pertarungan
                        </Button>
                    ) : (
                        <div className="space-y-8">
                            {/* HUD (Heads Up Display) */}
                            <div className="flex justify-between items-center bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                                <div className="text-left">
                                    <p className="text-xs text-emerald-500 font-extrabold uppercase tracking-widest">Waktu</p>
                                    <p className={`text-2xl font-black ${timeLeft <= 5 ? 'text-rose-500 animate-pulse' : 'text-emerald-700'}`}>
                                        00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-emerald-500 font-extrabold uppercase tracking-widest">Score</p>
                                    <p className="text-2xl font-black text-amber-500">{score}</p>
                                </div>
                            </div>

                            {/* Area Bermain */}
                            {timeLeft > 0 ? (
                                <div className="py-6">
                                    <p className="text-6xl font-black text-emerald-900 mb-6 drop-shadow-sm" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                                        {num1} + {num2}
                                    </p>
                                    <input
                                        ref={inputRef}
                                        type="number"
                                        value={userAnswer}
                                        onChange={handleInput}
                                        placeholder="?"
                                        className="w-32 text-center text-4xl font-black bg-slate-50 border-2 border-emerald-200 rounded-2xl p-4 text-emerald-900 focus:ring-4 focus:ring-emerald-200 focus:border-emerald-400 focus:outline-none transition-all"
                                        autoFocus
                                    />
                                </div>
                            ) : (
                                <div className="py-6">
                                    <p className="text-2xl font-bold text-emerald-900 mb-2">Waktu Habis!</p>
                                    <p className="text-emerald-600 mb-6">Skor Akhirmu: <span className="font-black text-amber-500">{score}</span></p>
                                    <Button variant="primary" onClick={startGame} className="bg-gradient-to-r from-emerald-500 to-teal-400">
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
                    message={`Latihan selesai! Kamu mendapatkan +${Math.floor(score / 2)} EXP.`}
                    type="success"
                />
            </div>
        );
    }