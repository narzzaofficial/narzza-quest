'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import Footer from '@/components/layout/Footer'; // <--- IMPORT FOOTER BARU
import Toast from '@/components/ui/Toast';

export default function AuthenticatedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, profile, loading } = useAuth();
    const router = useRouter();

    // State untuk Pop-up Global
    const [globalToast, setGlobalToast] = useState({ show: false, message: '', type: 'info' as 'info' | 'success' });

    // 1. Route Protection
    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    // 2. RADAR GLOBAL UNTUK NOTIFIKASI BARU (REAL-TIME)
    useEffect(() => {
        if (!profile) return;

        const q = query(
            collection(db, 'notifications'),
            where('toUid', '==', profile.uid),
            orderBy('createdAt', 'desc'),
            limit(5)
        );

        let isInitialLoad = true;

        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (isInitialLoad) {
                isInitialLoad = false;
                return;
            }

            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    const notif = change.doc.data();
                    setGlobalToast({
                        show: true,
                        message: `${notif.fromName}: ${notif.title}`,
                        type: notif.type === 'quest_approved' ? 'success' : 'info'
                    });

                    setTimeout(() => {
                        setGlobalToast(prev => ({ ...prev, show: false }));
                    }, 4000);
                }
            });
        });

        return () => unsubscribe();
    }, [profile]);

    if (loading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-purple-50/30">
                <div className="animate-pulse flex flex-col items-center">
                    <span className="text-4xl mb-4">✨</span>
                    <p className="text-purple-600 font-bold" style={{ fontFamily: 'var(--font-nunito), sans-serif' }}>
                        Mempersiapkan petualangan...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50">
            {/* Desktop Sidebar */}
            <Sidebar />

            <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
                {/* Mobile TopBar */}
                <TopBar />

                {/* AREA SCROLL UTAMA */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden relative scroll-smooth flex flex-col">

                    {/* ISI KONTEN HALAMAN */}
                    <div className="flex-1">
                        {children}
                    </div>

                    {/* ─── GLOBAL CUTE FOOTER ─── */}
                    {/* Ditaruh di sini agar ikut kescroll bersama konten halaman */}
                    <Footer />
                </main>
            </div>

            {/* Komponen Toast Global */}
            <Toast
                isVisible={globalToast.show}
                onClose={() => setGlobalToast(prev => ({ ...prev, show: false }))}
                message={globalToast.message}
                type={globalToast.type}
            />
        </div>
    );
}