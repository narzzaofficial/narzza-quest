'use client';

import React from 'react';
import { useRouter } from 'next/navigation'; // <-- 1. Tambahkan impor useRouter
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

// Data daftar Mini Games di Arena
const arenaGames = [
    {
        id: 'vocab-en',
        title: 'English Vocabulary',
        icon: '🇬🇧',
        description: 'Tebak kosakata bahasa Inggris untuk persiapan karir internasional dan interview internship.',
        category: 'Language',
        expReward: '+10 EXP / Menang',
        color: 'from-blue-500 to-cyan-400',
        bgLight: 'bg-blue-50',
        borderLight: 'border-blue-100',
        textDark: 'text-blue-900',
    },
    {
        id: 'vocab-jp',
        title: 'Japanese Kanji',
        icon: '🇯🇵',
        description: 'Latihan membaca dan menebak arti dari huruf Kanji, Hiragana, dan Katakana dasar.',
        category: 'Language',
        expReward: '+15 EXP / Menang',
        color: 'from-rose-500 to-red-400',
        bgLight: 'bg-rose-50',
        borderLight: 'border-rose-100',
        textDark: 'text-rose-900',
    },
    {
        id: 'math',
        title: 'Speed Math',
        icon: '🧮',
        description: 'Asah otak dan kecepatan komputasi (layaknya NumPy!) dengan perhitungan matematika cepat.',
        category: 'Logic',
        expReward: '+10 EXP / Menang',
        color: 'from-emerald-500 to-teal-400',
        bgLight: 'bg-emerald-50',
        borderLight: 'border-emerald-100',
        textDark: 'text-emerald-900',
    },
    {
        id: 'logic',
        title: 'Logic & IQ',
        icon: '🧩',
        description: 'Pecahkan teka-teki logika pemrograman dan silogisme untuk meningkatkan atribut Intelligence.',
        category: 'Logic',
        expReward: '+20 EXP / Menang',
        color: 'from-purple-600 to-indigo-500',
        bgLight: 'bg-purple-50',
        borderLight: 'border-purple-100',
        textDark: 'text-purple-900',
    },
    {
        id: 'math-mcq', // Ini akan menjadi rute URL: /arena/math-mcq
        title: 'Multiplication MCQ',
        icon: '🎯',
        description: 'Pilih jawaban yang benar dari hasil perkalian acak. Hati-hati, jawaban salah mengurangi skormu!',
        category: 'Logic',
        expReward: '+15 EXP / Menang',
        color: 'from-indigo-500 to-blue-500',
        bgLight: 'bg-indigo-50',
        borderLight: 'border-indigo-100',
        textDark: 'text-indigo-900',
    },
    {
        id: 'business',
        title: 'Startup Terms',
        icon: '💼',
        description: 'Tebak istilah bisnis, marketing, dan startup untuk bekal membesarkan Narzza Media Digital.',
        category: 'Career',
        expReward: '+15 EXP / Menang',
        color: 'from-amber-500 to-orange-400',
        bgLight: 'bg-amber-50',
        borderLight: 'border-amber-100',
        textDark: 'text-amber-900',
    },
    {
        id: 'speaking',
        title: 'Public Speaking',
        icon: '🎙️',
        description: 'Latihan intonasi, artikulasi, hingga berlatih kelancaran aksen Makassar dengan timer.',
        category: 'Career',
        expReward: '+25 EXP / Menang',
        color: 'from-pink-500 to-rose-400',
        bgLight: 'bg-pink-50',
        borderLight: 'border-pink-100',
        textDark: 'text-pink-900',
    }
];

export default function ArenaHubPage() {
    const router = useRouter(); // <-- 2. Panggil useRouter

    return (
        <div
            className="min-h-screen p-4 md:p-8 relative overflow-hidden text-slate-800"
            style={{
                background: 'linear-gradient(135deg, #E9D5FF 0%, #F3E8FF 40%, #FBCFE8 100%)',
                fontFamily: 'var(--font-nunito), sans-serif'
            }}
        >
            {/* Background Blobs */}
            <div className="absolute top-[-5%] left-[-5%] w-[35rem] h-[35rem] bg-purple-400/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-pink-400/20 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-6xl mx-auto space-y-10 relative z-10">

                {/* Header Section */}
                <header className="text-center pt-8 pb-4">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white shadow-[0_10px_30px_rgba(168,85,247,0.15)] mb-6 border border-purple-100 rotate-3 hover:rotate-0 transition-transform duration-300">
                        <span className="text-4xl">⚔️</span>
                    </div>
                    <p className="text-purple-600 text-sm tracking-widest uppercase mb-2 font-bold">
                        Training Grounds
                    </p>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 text-purple-950"
                        style={{ fontFamily: 'var(--font-playfair), serif' }}>
                        The Arena Hub
                    </h1>
                    <p className="text-purple-700/80 text-lg font-medium max-w-2xl mx-auto">
                        Asah kemampuanmu kapan saja! Pilih mode latihan di bawah ini untuk mendapatkan EXP tambahan.
                    </p>
                </header>

                {/* Grid Arena */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {arenaGames.map((game) => (
                        <Card
                            key={game.id}
                            onClick={() => router.push(`/arena/${game.id}`)} // <-- 3. Redirect ke halaman saat card diklik
                            className="group relative overflow-hidden cursor-pointer hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(236,72,153,0.15)] hover:border-pink-200 transition-all duration-500 flex flex-col"
                        >
                            {/* Dekorasi Warna Latar Ikon */}
                            <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-10 bg-gradient-to-br ${game.color} group-hover:scale-150 transition-transform duration-700`} />

                            <div className="relative z-10 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-6">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm border ${game.bgLight} ${game.borderLight}`}>
                                        {game.icon}
                                    </div>
                                    <Badge variant="default" className="bg-slate-50 border-slate-100 text-slate-500">
                                        {game.category}
                                    </Badge>
                                </div>

                                <h3 className={`text-2xl font-bold mb-2 ${game.textDark}`} style={{ fontFamily: 'var(--font-playfair), serif' }}>
                                    {game.title}
                                </h3>

                                <p className="text-slate-500 font-medium leading-relaxed mb-6 flex-1">
                                    {game.description}
                                </p>

                                <div className="mt-auto pt-5 border-t border-slate-100 flex justify-between items-center">
                                    <span className="text-xs font-extrabold text-pink-500 bg-pink-50 px-3 py-1.5 rounded-full border border-pink-100">
                                        {game.expReward}
                                    </span>

                                    {/* 4. Ganti <Link> dan <Button> dengan div gaya tombol agar tidak bentrok dengan onClick Card */}
                                    <div className={`px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-colors duration-300 ${game.bgLight} ${game.textDark} group-hover:bg-white group-hover:shadow-md`}>
                                        Mulai 🚀
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

            </div>
        </div>
    );
}