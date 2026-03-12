'use client';

import React from 'react';
import { Compass } from 'lucide-react';

export default function Loading() {
    return (
        <div className="w-full h-full min-h-[80vh] flex items-center justify-center relative overflow-hidden">
            {/* Dekorasi Aura */}
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-400/10 rounded-full blur-[80px] animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-pink-400/10 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '1s' }} />

            <div className="flex flex-col items-center relative z-10">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-[0_10px_30px_rgba(168,85,247,0.15)] flex items-center justify-center mb-6 border border-purple-100 animate-bounce">
                    <Compass className="w-8 h-8 text-purple-500" style={{ animation: 'spin 4s linear infinite' }} />
                </div>
                
                <h2 className="text-2xl font-bold text-purple-950 mb-2" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                    Mempersiapkan Peta...
                </h2>
                <p className="text-slate-500 font-medium text-sm animate-pulse" style={{ fontFamily: 'var(--font-nunito), sans-serif' }}>
                    Menyinkronkan data Guild dan Misi
                </p>
            </div>
        </div>
    );
}