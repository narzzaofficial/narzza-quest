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
                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2" style={{ fontFamily: 'var(--font-nunito), sans-serif' }}>
                        Build with
                        <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse" />
                        by
                        <a
                            href="https://narzza.studio"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-pink-600 hover:scale-105 transition-transform flex items-center gap-1.5"
                        >
                            Narzza <ExternalLink className="w-3 h-3 text-pink-500" />
                        </a>
                    </p>

                    {/* Baris Detail (Tanpa Double Link) */}
                    <div className="flex flex-wrap items-center justify-center gap-4 mt-1">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            © {currentYear} Narzza Quest
                        </p>

                        <div className="w-1 h-1 rounded-full bg-slate-300" />

                        {/* Pengganti Link: Lokasi/Status Markas */}
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                            <MapPin className="w-3 h-3 text-purple-500" /> Local Pride HQ
                        </p>

                        <div className="w-1 h-1 rounded-full bg-slate-300" />

                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                            Stay Focused <Coffee className="w-3.5 h-3.5 text-amber-600" />
                        </p>
                    </div>

                    {/* Pesan Penutup */}
                    <p className="text-[10px] italic text-slate-400 mt-4 font-bold max-w-xs leading-relaxed opacity-80">
                        "Your progress is the only trophy that matters."
                    </p>
                </div>
            </div>
        </footer>
    );
}