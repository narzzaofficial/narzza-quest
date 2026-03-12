'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import {
    LayoutDashboard,
    ScrollText,
    BookOpen,
    Swords,
    Bell,
    UserCircle,
    ListTodo,
    ClipboardCheck,
    HeartHandshake,
    LogOut,
    Users,
    Settings,
    Menu,
    X
} from 'lucide-react';

export default function TopBar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    const { profile, logout } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);

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

    useEffect(() => {
        // Mencegah body agar tidak bisa discroll saat menu terbuka
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        setIsMenuOpen(false);
    }, [pathname]);

    // Tambahan useEffect khusus untuk handle body overflow saat manual toggle
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    }, [isMenuOpen]);

    const heroLinks = [
        { name: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
        { name: 'Quest Board', href: '/quest-board', icon: <ScrollText className="w-5 h-5" /> },
        { name: 'War Room', href: '/journal', icon: <BookOpen className="w-5 h-5" /> },
        { name: 'Arena', href: '/arena', icon: <Swords className="w-5 h-5" /> },
        { name: 'My Network', href: '/network', icon: <Users className="w-5 h-5" /> },
        { name: 'Notifications', href: '/notifications', icon: <Bell className="w-5 h-5" /> },
    ];

    const gmLinks = [
        { name: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
        { name: 'Hero Profile', href: '/gm/hero-profile', icon: <UserCircle className="w-5 h-5" /> },
        { name: 'Manage Quests', href: '/gm/quests', icon: <ListTodo className="w-5 h-5" /> },
        { name: 'Review Submissions', href: '/gm/review', icon: <ClipboardCheck className="w-5 h-5" /> },
        { name: 'Send Encouragement', href: '/gm/encourage', icon: <HeartHandshake className="w-5 h-5" /> },
        { name: 'My Network', href: '/network', icon: <Users className="w-5 h-5" /> },
        { name: 'Notifications', href: '/notifications', icon: <Bell className="w-5 h-5" /> },
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

    if (!profile) return null;

    const links = profile.role === 'gm' ? gmLinks : heroLinks;
    const avatarUrl = profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.displayName)}&background=fce7f3&color=db2777&bold=true`;

    return (
        <>
            <header
                className="flex md:hidden items-center justify-between w-full p-4 sticky top-0 z-40 border-b shadow-sm"
                style={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    borderColor: 'rgba(233, 213, 255, 0.6)',
                }}
            >
                <button
                    onClick={() => setIsMenuOpen(true)}
                    className="p-2.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 active:scale-95 transition-transform"
                >
                    <Menu className="w-6 h-6" />
                </button>

                <Link href="/dashboard">
                    <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-pink-500" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                        Life Quest
                    </h1>
                </Link>

                <Link href="/profile" className="w-10 h-10 rounded-full border-2 border-pink-200 overflow-hidden shadow-sm bg-white active:scale-90 transition-transform">
                    <img src={avatarUrl} alt="PP" className="w-full h-full object-cover" />
                </Link>
            </header>

            {/* ─── MOBILE SLIDE-OUT MENU OVERLAY ─── */}
            <div
                className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 md:hidden transition-opacity duration-300 ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
                onClick={() => setIsMenuOpen(false)}
            />

            {/* ─── SLIDE PANEL FIX (Menggunakan inset-y-0 agar tidak goyang) ─── */}
            <div
                className={`fixed inset-y-0 left-0 w-[85%] max-w-sm bg-white z-50 md:hidden shadow-2xl flex flex-col transition-transform duration-300 ease-in-out transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
                style={{ height: '100dvh' }} // Menggunakan Dynamic Viewport Height
            >
                {/* Header Menu */}
                <div className="p-6 border-b border-purple-100 bg-gradient-to-br from-purple-50 via-white to-pink-50 relative flex-shrink-0">
                    <button
                        onClick={() => setIsMenuOpen(false)}
                        className="absolute top-4 right-4 text-slate-400 p-2 hover:text-rose-500 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <div className="flex items-center gap-4 mt-2">
                        <div className="w-14 h-14 rounded-2xl border-2 border-pink-200 overflow-hidden shadow-md bg-white">
                            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col">
                            <h2 className="text-lg font-bold text-purple-950 truncate max-w-[160px]" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                                {profile.displayName}
                            </h2>
                            <span className="text-[10px] font-extrabold uppercase tracking-widest text-pink-500 mt-0.5">
                                {profile.role === 'gm' ? 'Game Master' : profile.title || `Lv. ${profile.level || 1} Hero`}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Navigasi Links - Scrollable Area */}
                <nav className="flex-1 overflow-y-auto p-4 space-y-1 overscroll-contain">
                    {links.map((link) => {
                        const isActive = pathname === link.href || pathname?.startsWith(`${link.href}/`);
                        const isNotif = link.name === 'Notifications';

                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all font-bold ${isActive
                                    ? 'bg-purple-50 text-purple-700 border border-purple-100 shadow-sm'
                                    : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                                style={{ fontFamily: 'var(--font-nunito), sans-serif' }}
                            >
                                <div className="flex items-center gap-4">
                                    <span className={isActive ? 'text-purple-600' : 'text-slate-400'}>
                                        {link.icon}
                                    </span>
                                    <span className="text-sm">{link.name}</span>
                                </div>

                                {isNotif && unreadCount > 0 && (
                                    <span className="bg-pink-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
                                        {unreadCount}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer Actions - Tetap di Bawah */}
                <div className="p-4 border-t border-purple-100 bg-slate-50 flex-shrink-0 grid grid-cols-2 gap-3 pb-[env(safe-area-inset-bottom,16px)]">
                    <Link
                        href="/profile"
                        className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white border border-purple-100 text-slate-600 font-bold text-xs shadow-sm"
                        style={{ fontFamily: 'var(--font-nunito), sans-serif' }}
                    >
                        <Settings className="w-4 h-4 text-purple-400" />
                        <span>Settings</span>
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-2 py-3 rounded-xl bg-rose-50 text-rose-500 font-bold text-xs border border-rose-100 shadow-sm"
                        style={{ fontFamily: 'var(--font-nunito), sans-serif' }}
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Log Out</span>
                    </button>
                </div>
            </div>
        </>
    );
}