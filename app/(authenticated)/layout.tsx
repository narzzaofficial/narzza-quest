'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
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

        // Ambil 5 notif terbaru dari user ini
        const q = query(
            collection(db, 'notifications'),
            where('toUid', '==', profile.uid),
            orderBy('createdAt', 'desc'),
            limit(5)
        );

        let isInitialLoad = true; // Trik Sakti: Tandai kalau ini baru pertama kali load halaman

        const unsubscribe = onSnapshot(q, (snapshot) => {
            // Jika ini load pertama saat buka halaman, abaikan (jangan munculkan notif lama)
            if (isInitialLoad) {
                isInitialLoad = false;
                return;
            }

            // Jika ada perubahan setelah load pertama, periksa apa itu tambahan dokumen baru?
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    const notif = change.doc.data();

                    // Bunyikan Alarm (Munculkan Toast)!
                    setGlobalToast({
                        show: true,
                        message: `${notif.fromName}: ${notif.title}`,
                        type: notif.type === 'quest_approved' ? 'success' : 'info'
                    });

                    // Otomatis matikan toast setelah 4 detik (backup timer)
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
            <Sidebar />

            <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
                <TopBar />
                <main className="flex-1 overflow-y-auto overflow-x-hidden relative scroll-smooth">
                    {children}
                </main>
            </div>

            {/* Komponen Toast dipasang di luar agar menimpa seluruh layar */}
            <Toast
                isVisible={globalToast.show}
                onClose={() => setGlobalToast(prev => ({ ...prev, show: false }))}
                message={globalToast.message}
                type={globalToast.type}
            />
        </div>
    );
}