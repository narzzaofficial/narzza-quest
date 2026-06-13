import React from 'react';
import Link from 'next/link';
import { Map, Home } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center relative overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-brand/15 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-sky/15 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center">
                <div className="w-24 h-24 glass rounded-2xl flex items-center justify-center shadow-card mb-6 relative">
                    <Map className="w-10 h-10 text-brand" />
                    <span className="absolute -top-2 -right-2 text-3xl">❓</span>
                </div>

                <h1 className="text-7xl font-black text-brand mb-2">404</h1>
                <h2 className="text-2xl md:text-3xl font-extrabold text-ink mb-3">Wilayah Belum Dipetakan!</h2>
                <p className="text-ink-soft max-w-md mx-auto mb-10 font-medium leading-relaxed text-sm md:text-base">
                    Sepertinya kamu mengembara terlalu jauh dari jalur utama. Area yang kamu cari tidak ditemukan di peta Guild.
                </p>

                <Link href="/dashboard" className="inline-flex items-center gap-2 px-8 py-4 bg-brand text-white font-bold rounded-xl shadow-card hover:bg-brand-hover hover:-translate-y-0.5 transition-all">
                    <Home className="w-5 h-5" /> Kembali ke Markas
                </Link>
            </div>
        </div>
    );
}
