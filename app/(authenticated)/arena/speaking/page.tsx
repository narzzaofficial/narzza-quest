'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Toast from '@/components/ui/Toast';

const speechBank = [
    { question: 'Halo semua, perkenalkan nama saya Nardi.', answer: 'Halo semua, perkenalkan nama saya Nardi.' },
    { question: 'Narzza Media Digital siap membantu bisnis anda.', answer: 'Narzza Media Digital siap membantu bisnis anda.' },
    { question: 'Tabe, permisi numpang lewat.', answer: 'Tabe, permisi numpang lewat.' }, // Aksen lokal!
    { question: 'Visi kami adalah menciptakan inovasi tanpa batas.', answer: 'Visi kami adalah menciptakan inovasi tanpa batas.' },
];

export default function SpeakingArena() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [timeLeft, setTimeLeft] = useState(45);
    const [score, setScore] = useState(0);

    const [currentWord, setCurrentWord] = useState(speechBank[0]);
    const [userAnswer, setUserAnswer] = useState('');
    const [showToast, setShowToast] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const generateQuestion = () => {
        const randomIndex = Math.floor(Math.random() * speechBank.length);
        setCurrentWord(speechBank[randomIndex]);
        setUserAnswer('');
        if (inputRef.current) inputRef.current.focus();
    };

    const startGame = () => {
        setIsPlaying(true);
        setScore(0);
        setTimeLeft(45);
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
        // Harus mengetik persis sama (termasuk huruf besar/kecil & tanda baca) untuk melatih ketelitian naskah
        if (val === currentWord.answer) {
            setScore(score + 25);
            generateQuestion();
        }
    };

    return (
        <div className="min-h-screen p-4 flex flex-col items-center justify-center relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #FDF2F8 0%, #FCE7F3 50%, #FBCFE8 100%)', fontFamily: 'var(--font-nunito), sans-serif' }}>
            <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-pink-300/20 rounded-full blur-[100px] pointer-events-none" />

            <Link href="/arena" className="absolute top-8 left-8 text-pink-600 font-bold hover:text-pink-800 transition-colors">
                Kembali ke Arena
            </Link>

            <Card className="max-w-lg w-full text-center p-8 md:p-12 relative z-10 shadow-[0_20px_50px_rgba(244,114,182,0.1)] border-pink-100">
                <h1 className="text-4xl font-bold text-pink-950 mb-2" style={{ fontFamily: 'var(--font-playfair), serif' }}>Public Speaking 🎙️</h1>
                <p className="text-pink-600 font-medium mb-8">Ketik ulang naskah berikut dengan teliti (perhatikan huruf besar/kecil)!</p>

                {!isPlaying && timeLeft === 45 ? (
                    <Button variant="primary" onClick={startGame} className="w-full py-4 text-xl bg-gradient-to-r from-pink-500 to-rose-400">Mulai Latihan</Button>
                ) : (
                    <div className="space-y-8">
                        <div className="flex justify-between items-center bg-pink-50 p-4 rounded-2xl border border-pink-100">
                            <div className="text-left">
                                <p className="text-xs text-pink-500 font-extrabold uppercase tracking-widest">Waktu</p>
                                <p className={`text-2xl font-black ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-pink-700'}`}>
                                    00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-pink-500 font-extrabold uppercase tracking-widest">Score</p>
                                <p className="text-2xl font-black text-rose-500">{score}</p>
                            </div>
                        </div>

                        {timeLeft > 0 ? (
                            <div className="py-6">
                                <p className="text-xl font-medium text-pink-900 mb-6 drop-shadow-sm italic">"{currentWord.question}"</p>
                                <textarea ref={inputRef as any} value={userAnswer} onChange={handleInput as any} placeholder="Ketik ulang di sini..." rows={3} className="w-full text-center text-lg font-bold bg-white border-2 border-pink-200 rounded-2xl p-4 text-pink-900 focus:ring-4 focus:ring-pink-100 focus:border-pink-400 focus:outline-none transition-all resize-none" autoFocus />
                            </div>
                        ) : (
                            <div className="py-6">
                                <p className="text-2xl font-bold text-pink-900 mb-2">Sesi Selesai!</p>
                                <p className="text-pink-600 mb-6">Artikulasi Skor: <span className="font-black text-rose-500">{score}</span></p>
                                <Button variant="primary" onClick={startGame} className="bg-gradient-to-r from-pink-500 to-rose-400">Main Lagi</Button>
                            </div>
                        )}
                    </div>
                )}
            </Card>
            <Toast isVisible={showToast} onClose={() => setShowToast(false)} message={`Sesi Public Speaking selesai! +${Math.floor(score / 5)} EXP.`} type="success" />
        </div>
    );
}