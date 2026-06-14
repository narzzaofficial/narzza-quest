'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import Footer from '@/components/layout/Footer';
import Toast from '@/components/ui/Toast';
import GoalOnboarding from '@/components/system/GoalOnboarding';
import { MilestoneModal } from '@/components/milestone/MilestoneModal';
import { useMilestone } from '@/hooks/useMilestone';
import Loading from './loading';

export default function AuthenticatedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, profile, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const { milestone, dismiss } = useMilestone(profile ?? null);
    const isFullscreen = pathname === '/chat';

    const [globalToast, setGlobalToast] = useState({ show: false, message: '', type: 'info' as 'info' | 'success' });

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

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
        return <Loading />;
    }

    return (
        <div className="flex h-screen overflow-hidden bg-transparent">
            <Sidebar />

            <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
                <TopBar />

                <main className={`flex-1 overflow-x-hidden relative scroll-smooth flex flex-col ${isFullscreen ? 'overflow-hidden' : 'overflow-y-auto'}`}>
                    <div className={isFullscreen ? 'flex-1 flex flex-col overflow-hidden' : 'flex-1'}>
                        {children}
                    </div>
                    {!isFullscreen && <Footer />}
                </main>
            </div>

            <GoalOnboarding />
            <MilestoneModal milestone={milestone} onDismiss={dismiss} />

            <Toast
                isVisible={globalToast.show}
                onClose={() => setGlobalToast(prev => ({ ...prev, show: false }))}
                message={globalToast.message}
                type={globalToast.type}
            />
        </div>
    );
}