'use client';

import React from 'react';
import { Heart, Sparkles, Coffee, ExternalLink, MapPin } from 'lucide-react';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full py-12 px-6 mt-auto border-t border-purple-100/50 bg-white/30">
            <div className="max-w-6xl mx-auto flex flex-col items-center justify-center">

                {/* Garis Pemisah dengan Kontras Tinggi */}
                <div className="flex items-center gap-4 w-full max-w-lg mb-8 opacity-40">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-400 to-purple-500" />
                    <Sparkles className="w-5 h-5 text-purple-500 animate-pulse" />
                    <div className="h-px flex-1 bg-gradient-to-l from-transparent via-purple-400 to-purple-500" />
                </div>

                {/* Konten Utama Footer */}
                <div className="flex flex-col items-center gap-3 text-center">
                    {/* Satu-satunya Link Utama: NARZZA */}
                    <p className="text-sm font-black text-slate-700 uppercase tracking-[0.2em] flex items-center gap-2" style={{ fontFamily: 'var(--font-nunito), sans-serif' }}>
                        Build with
                        <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" />
                        by
                        <a
                            href="https://narzza.studio"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-pink-600 hover:scale-105 transition-transform flex items-center gap-1.5 font-black"
                        >
                            Narzza <ExternalLink className="w-3.5 h-3.5 text-pink-500" />
                        </a>
                    </p>

                    {/* Baris Detail (Tanpa Double Link) */}
                    <div className="flex flex-wrap items-center justify-center gap-4 mt-1">
                        <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                            © {currentYear} Narzza Quest
                        </p>

                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />

                        {/* Pengganti Link: Lokasi/Status Markas */}
                        <p className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-purple-600" /> Local Pride HQ
                        </p>

                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />

                        <p className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1.5">
                            Stay Focused <Coffee className="w-4 h-4 text-amber-600" />
                        </p>
                    </div>

                    {/* Pesan Penutup */}
                    <p className="text-xs italic text-slate-500 mt-4 font-semibold max-w-xs leading-relaxed">
                        "Your progress is the only trophy that matters."
                    </p>
                </div>
            </div>
        </footer>
    );
}