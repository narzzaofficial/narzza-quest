'use client';

import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot, limit, doc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { markNotificationRead } from '@/lib/db';
import { Notification } from '@/types';
import Card from '@/components/ui/Card';

export default function NotificationsPage() {
    const { profile } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (profile) {
            const q = query(
                collection(db, 'notifications'),
                where('toUid', '==', profile.uid),
                orderBy('createdAt', 'desc'),
                limit(30)
            );

            const unsubscribe = onSnapshot(q, (snap) => {
                const fetchedNotifs = snap.docs.map(d => ({ id: d.id, ...d.data() } as Notification));
                setNotifications(fetchedNotifs);
                setLoading(false);
            });

            return () => unsubscribe();
        } else {
            setLoading(false);
        }
    }, [profile]);

    const handleMarkAsRead = async (id: string, isRead: boolean) => {
        if (isRead) return;
        try {
            await markNotificationRead(id);
        } catch (error) {
            console.error("Gagal menandai dibaca:", error);
        }
    };

    const handleMarkAllAsRead = async () => {
        const unreadNotifs = notifications.filter(n => !n.isRead);
        if (unreadNotifs.length === 0) return;

        try {
            const batch = writeBatch(db);
            unreadNotifs.forEach((notif) => {
                const notifRef = doc(db, 'notifications', notif.id);
                batch.update(notifRef, { isRead: true });
            });
            await batch.commit();
        } catch (error) {
            console.error("Gagal menandai semua dibaca:", error);
        }
    };

    const getNotifStyle = (type: string) => {
        switch (type) {
            case 'encouragement':
                return { icon: '💌', bgColor: 'bg-pink-50', borderColor: 'border-pink-200', textColor: 'text-pink-600' };
            case 'quest_approved':
                return { icon: '✨', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200', textColor: 'text-emerald-600' };
            case 'quest_rejected':
                return { icon: '⚠️', bgColor: 'bg-rose-50', borderColor: 'border-rose-200', textColor: 'text-rose-600' };
            case 'quest_assigned':
                return { icon: '📜', bgColor: 'bg-purple-50', borderColor: 'border-purple-200', textColor: 'text-purple-600' };
            default:
                return { icon: '🔔', bgColor: 'bg-slate-50', borderColor: 'border-slate-200', textColor: 'text-slate-600' };
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center font-bold text-purple-600">Mengecek kotak pos...</div>;
    }

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div
            className="min-h-screen p-4 md:p-8 relative overflow-hidden text-slate-800"
            style={{
                background: 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)',
                fontFamily: 'var(--font-nunito), sans-serif'
            }}
        >
            <div className="max-w-5xl mx-auto relative z-10">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pt-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 flex items-center gap-3" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                            Notifications
                            {unreadCount > 0 && (
                                <span className="bg-pink-500 text-white text-sm font-black px-3 py-1 rounded-full shadow-sm animate-bounce">
                                    {unreadCount} Baru
                                </span>
                            )}
                        </h1>
                        <p className="text-slate-500 font-medium mt-1">Pemberitahuan dari sistem dan Game Master.</p>
                    </div>

                    <button
                        onClick={handleMarkAllAsRead}
                        disabled={unreadCount === 0}
                        className="text-sm font-bold text-purple-600 hover:text-purple-800 bg-white px-5 py-2.5 rounded-full shadow-sm border border-slate-200 hover:bg-purple-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Tandai semua dibaca ✓
                    </button>
                </header>

                <div className="space-y-4">
                    {notifications.length === 0 ? (
                        <Card className="p-10 text-center shadow-sm border-slate-200 bg-white/50 backdrop-blur-sm">
                            <span className="text-5xl block mb-4 opacity-30">📭</span>
                            <p className="text-slate-500 font-bold text-lg">Kotak masukmu bersih!</p>
                            <p className="text-slate-400 text-sm mt-1">Belum ada notifikasi baru saat ini.</p>
                        </Card>
                    ) : (
                        notifications.map((notif) => {
                            const style = getNotifStyle(notif.type);

                            return (
                                <Card
                                    key={notif.id}
                                    onClick={() => handleMarkAsRead(notif.id, notif.isRead)}
                                    className={`p-5 md:p-6 flex gap-4 md:gap-5 transition-all cursor-pointer ${notif.isRead
                                        ? 'opacity-70 bg-white/60 border-transparent shadow-none'
                                        : `bg-white shadow-[0_10px_30px_rgba(0,0,0,0.04)] border-l-4 hover:-translate-y-1 ${style.borderColor}`
                                        }`}
                                >
                                    <div className={`w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-2xl flex items-center justify-center text-2xl border ${style.bgColor} ${style.borderColor}`}>
                                        {style.icon}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1 gap-2">
                                            <h3 className={`text-base md:text-lg font-bold truncate ${notif.isRead ? 'text-slate-600' : 'text-slate-900'}`} style={{ fontFamily: 'var(--font-playfair), serif' }}>
                                                {notif.title}
                                            </h3>
                                            <span className="text-[10px] md:text-xs font-bold text-slate-400 whitespace-nowrap pt-1">
                                                {new Date(notif.createdAt).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>

                                        <p className={`text-sm md:text-base leading-relaxed break-words ${notif.type === 'encouragement' ? 'text-pink-700 italic font-bold' : 'text-slate-500 font-medium'}`}>
                                            {notif.message}
                                        </p>

                                        <div className="mt-3 flex items-center gap-2">
                                            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-400 px-2 py-1 rounded-md">
                                                Dari: {notif.fromName}
                                            </span>
                                        </div>
                                    </div>

                                    {!notif.isRead && (
                                        <div className="w-3 h-3 bg-pink-500 rounded-full mt-2 shrink-0 animate-pulse shadow-[0_0_10px_rgba(236,72,153,0.8)]" />
                                    )}
                                </Card>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}