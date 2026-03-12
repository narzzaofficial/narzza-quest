import React from 'react';
import Link from 'next/link';
import { Map, Home } from 'lucide-react';

export default function NotFound() {
    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center p-4 text-center relative overflow-hidden"
            style={{
                background: 'linear-gradient(135deg, #F8FAFC 0%, #F3E8FF 100%)',
                fontFamily: 'var(--font-nunito), sans-serif'
            }}
        >
            {/* Dekorasi Background (Kabut Misterius) */}
            <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-300/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-pink-300/20 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center">
                {/* Ikon Peta Tersesat */}
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-purple-100 mb-6 relative animate-bounce" style={{ animationDuration: '3s' }}>
                    <Map className="w-10 h-10 text-purple-400" />
                    <span className="absolute -top-2 -right-2 text-4xl animate-pulse">❓</span>
                </div>

                <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500 mb-2" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                    404
                </h1>

                <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-3" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                    Wilayah Belum Dipetakan!
                </h2>

                <p className="text-slate-500 max-w-md mx-auto mb-10 font-medium leading-relaxed text-sm md:text-base">
                    Sepertinya kamu mengembara terlalu jauh dari jalur utama. Misi atau area yang kamu cari tidak ditemukan di dalam peta Guild.
                </p>

                {/* Tombol Pulang */}
                <Link
                    href="/dashboard"
                    className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold rounded-2xl shadow-[0_10px_20px_rgba(168,85,247,0.3)] hover:shadow-[0_15px_30px_rgba(236,72,153,0.4)] hover:-translate-y-1 transition-all duration-300"
                >
                    <Home className="w-5 h-5" />
                    <span>Kembali ke Markas</span>
                </Link>
            </div>
        </div>
    );
}