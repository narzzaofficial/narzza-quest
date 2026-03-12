'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';

export default function TopBar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    const { profile, logout } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);

    // Hitung Notifikasi Real-time
    useEffect(() => {
        if (profile?.uid) {
            const q = query(
                collection(db, 'notifications'),
                where('toUid', '==', profile.uid),
                where('isRead', '==', false)
            );
            const unsubscribe = onSnapshot(q, (snap) => {
                setUnreadCount(snap.docs.length);
            });
            return () => unsubscribe();
        }
    }, [profile]);

    // Tutup menu otomatis setiap kali pindah halaman
    useEffect(() => {
        setIsMenuOpen(false);
    }, [pathname]);

    const heroLinks = [
        { name: 'Dashboard', href: '/dashboard', icon: '📊' },
        { name: 'Quest Board', href: '/quest-board', icon: '📜' },
        { name: 'War Room', href: '/journal', icon: '📖' },
        { name: 'Arena', href: '/arena', icon: '⚔️' },
        { name: 'Notifications', href: '/notifications', icon: '🔔' },
    ];

    const gmLinks = [
        { name: 'Dashboard', href: '/dashboard', icon: '📊' },
        { name: 'Manage Quests', href: '/gm/quests', icon: '👑' },
        { name: 'Review Submissions', href: '/gm/review', icon: '🔍' },
        { name: 'Send Encouragement', href: '/gm/encourage', icon: '💌' },
        { name: 'Notifications', href: '/notifications', icon: '🔔' },
    ];

    const handleLogout = async () => {
        try {
            await logout();
            setIsMenuOpen(false);
            router.push('/login');
        } catch (error) {
            console.error("Gagal logout:", error);
        }
    };

    if (!profile) return null; // Sembunyikan jika belum login

    const links = profile.role === 'gm' ? gmLinks : heroLinks;

    return (
        <>
            <header
                className="flex md:hidden items-center justify-between w-full p-4 sticky top-0 z-40 border-b"
                style={{
                    background: 'linear-gradient(135deg, rgba(255, 240, 245, 0.85) 0%, rgba(255, 255, 255, 0.6) 100%)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    boxShadow: '0 4px 24px rgba(212, 175, 55, 0.05)'
                }}
            >
                {/* Hamburger Menu Button */}
                <button
                    onClick={() => setIsMenuOpen(true)}
                    className="relative p-2 rounded-xl bg-white/40 text-pink-800 hover:bg-white/70 transition-colors border border-white/60 shadow-sm"
                    aria-label="Open Menu"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                    </svg>

                    {/* Titik Merah Notif di Tombol Hamburger */}
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-pink-500 border-2 border-white"></span>
                        </span>
                    )}
                </button>

                {/* Brand / Logo */}
                <Link href="/dashboard" className="flex-1 text-center">
                    <h1
                        className="text-2xl font-bold tracking-wider"
                        style={{
                            fontFamily: '"Cinzel", serif',
                            background: 'linear-gradient(to right, #D4AF37, #AA771C)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            textShadow: '0px 2px 4px rgba(212, 175, 55, 0.2)'
                        }}
                    >
                        Life Quest
                    </h1>
                </Link>

                {/* Mini Profile Indicator */}
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center border-2 border-amber-300 shadow-sm relative">
                        <span className="text-xl">
                            {profile.role === 'gm' ? '👑' : '🧙‍♂️'}
                        </span>
                    </div>
                </div>
            </header>

            {/* ─── MOBILE SLIDE-OUT MENU OVERLAY ─── */}
            {/* Background Dimmer */}
            <div
                className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 md:hidden transition-opacity duration-300 ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
                onClick={() => setIsMenuOpen(false)}
            />

            {/* Slide Panel */}
            <div
                className={`fixed top-0 left-0 h-full w-[80%] max-w-sm bg-white z-50 md:hidden shadow-2xl flex flex-col transition-transform duration-300 ease-in-out transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                {/* Header Profil Menu */}
                <div className="p-6 border-b border-purple-100 bg-gradient-to-br from-purple-50 to-pink-50 relative">
                    <button
                        onClick={() => setIsMenuOpen(false)}
                        className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-2xl font-black"
                    >
                        ×
                    </button>
                    <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center mb-3 border border-purple-100 shadow-sm">
                        <span className="text-3xl">{profile.role === 'gm' ? '👑' : '🧙‍♂️'}</span>
                    </div>
                    <h2 className="text-xl font-bold text-purple-950 mb-1 leading-tight" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                        {profile.displayName}
                    </h2>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full bg-white text-pink-600 border border-pink-100 inline-block shadow-sm">
                        {profile.role === 'gm' ? 'Game Master' : `Lv. ${profile.level || 1} Hero`}
                    </span>
                </div>

                {/* Links Area */}
                <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                    {links.map((link) => {
                        const isActive = pathname === link.href || pathname?.startsWith(`${link.href}/`);
                        const isNotif = link.name === 'Notifications';

                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`flex items-center justify-between px-4 py-4 rounded-2xl transition-all duration-300 font-bold ${isActive
                                    ? 'bg-purple-50 text-purple-700 border border-purple-100 shadow-sm'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-purple-600'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <span className="text-2xl">{link.icon}</span>
                                    <span className="text-base">{link.name}</span>
                                </div>

                                {/* Badge Notifikasi */}
                                {isNotif && unreadCount > 0 && (
                                    <span className="bg-pink-500 text-white text-xs font-black px-2.5 py-0.5 rounded-full shadow-sm animate-pulse">
                                        {unreadCount}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer / Logout */}
                <div className="p-4 border-t border-purple-100 bg-slate-50">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-3 px-4 py-4 rounded-2xl text-rose-500 bg-rose-50 hover:bg-rose-100 transition-colors font-bold"
                    >
                        <span className="text-xl">🚪</span>
                        <span>Keluar dari Akun</span>
                    </button>
                </div>
            </div>
        </>
    );
}