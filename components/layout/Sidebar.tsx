'use client';

import React, { useEffect, useState } from 'react';
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
    Settings // <--- TAMBAHAN IKON GEAR
} from 'lucide-react';

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const { profile, logout, loading } = useAuth();
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
            router.push('/login');
        } catch (error) {
            console.error('Gagal logout:', error);
        }
    };

    if (loading) {
        return (
            <aside className="hidden md:flex flex-col w-64 h-screen p-4 border-r bg-white/50 border-purple-100">
                <div className="animate-pulse flex flex-col items-center pt-10">
                    <div className="w-16 h-16 bg-purple-100 rounded-2xl mb-4"></div>
                    <div className="w-24 h-4 bg-purple-100 rounded mb-2"></div>
                </div>
            </aside>
        );
    }

    if (!profile) return null;

    const links = profile.role === 'gm' ? gmLinks : heroLinks;

    const avatarUrl =
        profile.avatar ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(
            profile.displayName
        )}&background=fce7f3&color=db2777&bold=true`;

    return (
        <aside
            className="hidden md:flex flex-col w-64 h-screen p-4 border-r"
            style={{
                background:
                    'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(243,232,255,0.5) 100%)',
                borderColor: 'rgba(233,213,255,0.5)',
            }}
        >
            {/* PROFILE HEADER */}
            <Link
                href="/dashboard"
                className="flex items-center gap-3 px-2 pt-4 pb-6 mb-6 border-b border-purple-100 hover:bg-purple-50/50 transition-colors rounded-xl cursor-pointer group"
            >
                {/* Foto Profil */}
                <div className="w-12 h-12 rounded-full flex-shrink-0 border-2 border-pink-200 overflow-hidden shadow-sm bg-white group-hover:border-pink-400 transition-colors relative">
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>

                {/* Nama & Title */}
                <div className="flex flex-col overflow-hidden">
                    <h2 className="text-base font-bold text-purple-950 truncate group-hover:text-purple-700 transition-colors" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                        {profile.displayName}
                    </h2>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-pink-500 truncate mt-0.5" style={{ fontFamily: 'var(--font-nunito), sans-serif' }}>
                        {profile.role === 'gm' ? 'Game Master' : profile.title || `Lv. ${profile.level || 1} Hero`}
                    </span>
                </div>
            </Link>

            {/* NAVIGATION */}
            <nav className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
                {links.map((link) => {
                    const isActive =
                        pathname === link.href || pathname?.startsWith(`${link.href}/`);
                    const isNotif = link.name === 'Notifications';

                    return (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`flex items-center justify-between px-4 py-3 rounded-2xl
              border border-transparent
              transition-colors duration-200 font-bold
              ${isActive
                                    ? 'bg-purple-50 text-purple-700 border-purple-100 shadow-sm'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-purple-600'
                                }`}
                            style={{ fontFamily: 'var(--font-nunito), sans-serif' }}
                        >
                            <div className="flex items-center gap-3">
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

            {/* ─── BOTTOM ACTIONS (LOGOUT & SETTINGS) ─── */}
            <div className="mt-auto pt-4 border-t border-purple-100 flex items-center gap-2">

                {/* Tombol Logout */}
                <button
                    onClick={handleLogout}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-rose-400 hover:bg-rose-50 hover:text-rose-600 transition-colors font-bold text-sm"
                    style={{ fontFamily: 'var(--font-nunito), sans-serif' }}
                >
                    <LogOut className="w-5 h-5" />
                    <span>Keluar</span>
                </button>

                {/* Tombol Settings dengan Pop-up Tooltip */}
                <Link
                    href="/profile"
                    className="relative group flex items-center justify-center p-3 rounded-2xl text-slate-400 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                >
                    <Settings className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90" />

                    {/* Tooltip Pop-up (Muncul saat di-hover) */}
                    <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-slate-800 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-xl pointer-events-none whitespace-nowrap">
                        Settings
                        {/* Segitiga panah ke bawah */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                    </div>
                </Link>

            </div>
        </aside>
    );
}