'use client';

import React, { useEffect } from 'react';

interface ToastProps {
    isVisible: boolean;
    onClose: () => void;
    message: string;
    type?: 'success' | 'error' | 'info';
}

export default function Toast({ isVisible, onClose, message, type = 'success' }: ToastProps) {

    // Auto-hide setelah 4 detik
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    return (
        <div
            // PERUBAHAN DI SINI: top-20 untuk mobile, md:top-8 untuk desktop. 
            // Posisinya sekarang fix di Kanan Atas!
            className={`fixed top-20 right-4 md:top-8 md:right-8 z-[9999] transition-all duration-500 ease-out transform ${isVisible ? 'translate-x-0 opacity-100 visible' : 'translate-x-full opacity-0 invisible'
                }`}
        >
            <div className={`px-6 py-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border-2 flex items-center gap-3 font-bold text-sm max-w-sm backdrop-blur-md ${type === 'success' ? 'bg-emerald-50/90 text-emerald-700 border-emerald-200' :
                    type === 'error' ? 'bg-rose-50/90 text-rose-700 border-rose-200' :
                        'bg-white/90 text-purple-700 border-purple-200'
                }`}>
                <span className="text-2xl drop-shadow-sm">
                    {type === 'success' ? '✨' : type === 'error' ? '⚠️' : '🔔'}
                </span>
                <p className="leading-snug text-slate-700 font-extrabold">{message}</p>

                <button onClick={onClose} className="ml-3 text-slate-400 hover:text-rose-500 text-2xl transition-colors font-black leading-none pb-1">
                    ×
                </button>
            </div>
        </div>
    );
}