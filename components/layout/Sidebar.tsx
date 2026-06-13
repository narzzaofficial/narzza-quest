'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useBadges } from '@/hooks/useBadges';
import {
    LayoutDashboard,
    Bot,
    ScrollText,
    BookOpen,
    Swords,
    Bell,
    ListTodo,
    ClipboardCheck,
    HeartHandshake,
    LogOut,
    Users,
    Settings,
    CalendarDays,
    Trophy,
    Wallet,
    Receipt
} from 'lucide-react';

function NavBadge({ count }: { count: number }) {
    if (count <= 0) return null;
    return (
        <span className="bg-danger text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm min-w-[20px] text-center leading-5">
            {count > 99 ? '99+' : count}
        </span>
    );
}

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const { profile, logout, loading } = useAuth();
    const badges = useBadges();

    const heroLinks = [
        { name: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, badgeKey: null as keyof typeof badges | null },
        { name: 'AI Game Master', href: '/ai-gm', icon: <Bot className="w-5 h-5" />, badgeKey: null as keyof typeof badges | null },
        { name: 'Quest Board', href: '/quest-board', icon: <ScrollText className="w-5 h-5" />, badgeKey: 'questBoard' as keyof typeof badges },
        { name: 'Guild Quest', href: '/guild-quest', icon: <Swords className="w-5 h-5" />, badgeKey: 'guildQuest' as keyof typeof badges },
        { name: 'Roadmap', href: '/calendar', icon: <CalendarDays className="w-5 h-5" />, badgeKey: null as keyof typeof badges | null },
        { name: 'Leaderboard', href: '/leaderboard', icon: <Trophy className="w-5 h-5" />, badgeKey: null as keyof typeof badges | null },
        { name: 'Jurnal', href: '/journal', icon: <BookOpen className="w-5 h-5" />, badgeKey: 'warRoom' as keyof typeof badges },
        { name: 'Arena', href: '/arena', icon: <Swords className="w-5 h-5" />, badgeKey: 'arena' as keyof typeof badges },
        { name: 'My Network', href: '/network', icon: <Users className="w-5 h-5" />, badgeKey: 'network' as keyof typeof badges },
        { name: 'Notifications', href: '/notifications', icon: <Bell className="w-5 h-5" />, badgeKey: 'notifications' as keyof typeof badges },
        { name: 'My Wallet', href: '/wallet', icon: <Wallet className="w-5 h-5" />, badgeKey: 'wallet' as keyof typeof badges },
    ];

    const gmLinks = [
        { name: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, badgeKey: null as keyof typeof badges | null },
        { name: 'Manage Quests', href: '/gm/quests', icon: <ListTodo className="w-5 h-5" />, badgeKey: 'manageQuests' as keyof typeof badges },
        { name: 'Guild Quest', href: '/gm/guild-quest', icon: <Swords className="w-5 h-5" />, badgeKey: null as keyof typeof badges | null },
        { name: 'Roadmap', href: '/calendar', icon: <CalendarDays className="w-5 h-5" />, badgeKey: 'roadmap' as keyof typeof badges },
        { name: 'Leaderboard', href: '/leaderboard', icon: <Trophy className="w-5 h-5" />, badgeKey: null as keyof typeof badges | null },
        { name: 'Review Submissions', href: '/gm/review', icon: <ClipboardCheck className="w-5 h-5" />, badgeKey: 'reviewSubmissions' as keyof typeof badges },
        { name: 'Payouts', href: '/gm/payouts', icon: <Receipt className="w-5 h-5" />, badgeKey: 'questBoard' as keyof typeof badges },
        { name: 'Send Encouragement', href: '/gm/encourage', icon: <HeartHandshake className="w-5 h-5" />, badgeKey: 'encourage' as keyof typeof badges },
        { name: 'My Network', href: '/network', icon: <Users className="w-5 h-5" />, badgeKey: 'network' as keyof typeof badges },
        { name: 'Notifications', href: '/notifications', icon: <Bell className="w-5 h-5" />, badgeKey: 'notifications' as keyof typeof badges },
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
        <aside className="hidden md:flex flex-col w-64 h-screen p-4 border-r border-line glass-soft">
            {/* PROFILE HEADER */}
            <Link
                href="/dashboard"
                className="flex items-center gap-3 px-2 pt-4 pb-6 mb-6 border-b border-line hover:bg-surface-2 transition-colors rounded-xl cursor-pointer group"
            >
                {/* Foto Profil */}
                <div className="w-12 h-12 rounded-2xl shrink-0 border border-line overflow-hidden shadow-sm bg-surface group-hover:border-brand/40 transition-colors relative">
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                </div>

                {/* Nama & Title */}
                <div className="flex flex-col overflow-hidden">
                    <h2 className="text-base font-bold text-ink truncate group-hover:text-brand transition-colors">
                        {profile.displayName}
                    </h2>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand truncate mt-0.5">
                        {profile.role === 'gm' ? 'Game Master' : profile.title || `Lv. ${profile.level || 1} Hero`}
                    </span>
                </div>
            </Link>

            {/* NAVIGATION */}
            <nav className="flex-1 space-y-1.5 overflow-y-auto pr-2 custom-scrollbar">
                {links.map((link) => {
                    const isActive =
                        pathname === link.href || pathname?.startsWith(`${link.href}/`);
                    const badgeCount = link.badgeKey ? badges[link.badgeKey] : 0;

                    return (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`flex items-center justify-between px-4 py-2.5 rounded-xl border transition-colors duration-200 font-bold
              ${isActive
                                    ? 'bg-brand-soft text-brand border-brand/15 shadow-sm'
                                    : 'text-ink-soft border-transparent hover:bg-surface-2 hover:text-brand'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className={isActive ? 'text-brand' : 'text-ink-muted'}>
                                    {link.icon}
                                </span>

                                <span className="text-sm">{link.name}</span>
                            </div>

                            <NavBadge count={badgeCount} />
                        </Link>
                    );
                })}
            </nav>

            {/* ─── BOTTOM ACTIONS (LOGOUT & SETTINGS) ─── */}
            <div className="mt-auto pt-4 border-t border-line flex items-center gap-2">

                {/* Tombol Logout */}
                <button
                    onClick={handleLogout}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-danger/80 hover:bg-danger-soft hover:text-danger transition-colors font-bold text-sm"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Keluar</span>
                </button>

                {/* Tombol Settings dengan Pop-up Tooltip */}
                <Link
                    href="/profile"
                    className="relative group flex items-center justify-center p-3 rounded-xl text-ink-muted hover:bg-brand-soft hover:text-brand transition-colors"
                >
                    <Settings className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90" />

                    {/* Tooltip Pop-up (Muncul saat di-hover) */}
                    <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-ink text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-xl pointer-events-none whitespace-nowrap">
                        Settings
                        {/* Segitiga panah ke bawah */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-ink"></div>
                    </div>
                </Link>

            </div>
        </aside>
    );
}