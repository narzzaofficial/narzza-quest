'use client';

import React, { useEffect } from 'react';
import { ShieldAlert, RefreshCcw } from 'lucide-react';
import Button from '@/components/ui/Button'; // Pastikan path ini sesuai dengan lokasimu

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Otomatis mencatat error di console saat terjadi
        console.error("Terjadi Anomali Sistem:", error);
    }, [error]);

    return (
        <div className="w-full h-full min-h-[80vh] flex flex-col items-center justify-center p-4 text-center relative">
            <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center border border-rose-100 mb-6 shadow-sm transform -rotate-6">
                <ShieldAlert className="w-10 h-10 text-rose-500" />
            </div>

            <h2 className="text-3xl font-bold text-slate-800 mb-3" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                Aduh, Misi Gagal Dimuat!
            </h2>
            <p className="text-slate-500 max-w-md mx-auto mb-8 font-medium leading-relaxed" style={{ fontFamily: 'var(--font-nunito), sans-serif' }}>
                Terjadi gangguan sihir pada sistem Guild. Jangan panik, progres milikmu tetap aman. Silakan segarkan halaman ini.
            </p>

            <Button
                variant="primary"
                onClick={() => reset()}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-500 hover:shadow-lg transition-all px-8 py-4"
            >
                <RefreshCcw className="w-4 h-4" />
                <span>Coba Lagi</span>
            </Button>
        </div>
    );
}