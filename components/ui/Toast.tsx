'use client';

import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Bell, X } from 'lucide-react';

interface ToastProps {
    isVisible: boolean;
    onClose: () => void;
    message: string;
    type?: 'success' | 'error' | 'info';
}

export default function Toast({ isVisible, onClose, message, type = 'success' }: ToastProps) {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(onClose, 4000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    const meta = {
        success: { soft: 'bg-success-soft', color: 'var(--color-success)', Icon: CheckCircle2 },
        error: { soft: 'bg-danger-soft', color: 'var(--color-danger)', Icon: AlertTriangle },
        info: { soft: 'bg-brand-soft', color: 'var(--color-brand)', Icon: Bell },
    }[type];

    return (
        <div
            className={`fixed top-20 right-4 md:top-8 md:right-8 z-[9999] transition-all duration-500 ease-out transform ${isVisible ? 'translate-x-0 opacity-100 visible' : 'translate-x-full opacity-0 invisible'}`}
        >
            <div className="glass px-5 py-4 rounded-card shadow-pop flex items-center gap-3 font-bold text-sm max-w-sm">
                <div className={`${meta.soft} w-9 h-9 rounded-xl flex items-center justify-center shrink-0`}>
                    <meta.Icon className="w-5 h-5" style={{ color: meta.color }} />
                </div>
                <p className="leading-snug text-ink font-bold flex-1">{message}</p>
                <button onClick={onClose} className="text-ink-muted hover:text-danger transition-colors shrink-0" aria-label="Tutup">
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
