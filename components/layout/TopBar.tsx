'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useBadges } from '@/hooks/useBadges';
import type { BadgeCounts } from '@/hooks/useBadges';
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
    Menu,
    X,
    CalendarDays,
    Trophy,
    Wallet,
    Receipt,
    MessageCircle,
    BookMarked,
    Activity,
    BarChart2,
    Landmark,
    ChevronLeft,
} from 'lucide-react';
import { dicebearAvatar } from '@/lib/avatar';

function NavBadge({ count }: { count: number }) {
    if (count <= 0) return null;
    return (
        <span className="bg-danger text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-sm min-w-5 text-center">
            {count > 99 ? '99+' : count}
        </span>
    );
}

type LinkItem = {
    name: string;
    href: string;
    icon: React.ReactNode;
    badgeKey: keyof BadgeCounts | null;
};

export default function TopBar() {
    const pathname = usePathname();
    const router = useRouter();

    const { profile, logout } = useAuth();
    const badges = useBadges();

    const heroLinks: LinkItem[] = [
        { name: 'Dashboard',     href: '/dashboard',     icon: <LayoutDashboard className="w-5 h-5" />, badgeKey: null },
        { name: 'AI Game Master',href: '/ai-gm',         icon: <Bot className="w-5 h-5" />,             badgeKey: null },
        { name: 'AI Coach',      href: '/chat',          icon: <MessageCircle className="w-5 h-5" />,   badgeKey: null },
        { name: 'Story Arc',     href: '/story-arc',     icon: <BookMarked className="w-5 h-5" />,      badgeKey: null },
        { name: 'Life Log',      href: '/life-log',      icon: <Activity className="w-5 h-5" />,        badgeKey: null },
        { name: 'Analytics',     href: '/analytics',     icon: <BarChart2 className="w-5 h-5" />,       badgeKey: null },
        { name: 'Quest Board',   href: '/quest-board',   icon: <ScrollText className="w-5 h-5" />,      badgeKey: 'questBoard' },
        { name: 'Guild Quest',   href: '/guild-quest',   icon: <Swords className="w-5 h-5" />,          badgeKey: 'guildQuest' },
        { name: 'Kalender',       href: '/calendar',      icon: <CalendarDays className="w-5 h-5" />,    badgeKey: null },
        { name: 'Leaderboard',   href: '/leaderboard',   icon: <Trophy className="w-5 h-5" />,          badgeKey: null },
        { name: 'Arena',         href: '/arena',         icon: <Swords className="w-5 h-5" />,          badgeKey: 'arena' },
        { name: 'My Network',    href: '/network',       icon: <Users className="w-5 h-5" />,           badgeKey: 'network' },
        { name: 'Jurnal',        href: '/journal',       icon: <BookOpen className="w-5 h-5" />,        badgeKey: 'warRoom' },
        { name: 'Keuangan',      href: '/finance',       icon: <Landmark className="w-5 h-5" />,        badgeKey: null },
        { name: 'Dompet Quest',  href: '/wallet',        icon: <Wallet className="w-5 h-5" />,          badgeKey: 'wallet' },
        { name: 'Notifications', href: '/notifications', icon: <Bell className="w-5 h-5" />,            badgeKey: 'notifications' },
    ];

    const gmLinks: LinkItem[] = [
        { name: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, badgeKey: null },
        { name: 'Manage Quests', href: '/gm/quests', icon: <ListTodo className="w-5 h-5" />, badgeKey: 'manageQuests' },
        { name: 'Guild Quest', href: '/gm/guild-quest', icon: <Swords className="w-5 h-5" />, badgeKey: null },
        { name: 'Kalender', href: '/calendar', icon: <CalendarDays className="w-5 h-5" />, badgeKey: 'roadmap' },
        { name: 'Leaderboard', href: '/leaderboard', icon: <Trophy className="w-5 h-5" />, badgeKey: null },
        { name: 'Review Submissions', href: '/gm/review', icon: <ClipboardCheck className="w-5 h-5" />, badgeKey: 'reviewSubmissions' },
        { name: 'Send Encouragement', href: '/gm/encourage', icon: <HeartHandshake className="w-5 h-5" />, badgeKey: 'encourage' },
        { name: 'Payouts', href: '/gm/payouts', icon: <Receipt className="w-5 h-5" />, badgeKey: 'questBoard' },
        { name: 'My Network', href: '/network', icon: <Users className="w-5 h-5" />, badgeKey: 'network' },
        { name: 'Notifications', href: '/notifications', icon: <Bell className="w-5 h-5" />, badgeKey: 'notifications' },
    ];

    const handleLogout = async () => {
        try {
            await logout();
            setIsMenuOpen(false);
            router.push('/login');
        } catch (error) {
            console.error('Gagal logout:', error);
        }
    };

    if (!profile) return null;

    const avatarUrl = profile.avatar || dicebearAvatar(profile.displayName);
    const topLevelPaths = ['/dashboard', '/quest-board', '/finance', '/profile', '/gm/quests', '/gm/payouts'];
    const isTopLevel = topLevelPaths.includes(pathname);

    return (
        <>
            <header className="flex md:hidden items-center justify-between w-full p-4 sticky top-0 z-40 border-b border-line glass">
                {isTopLevel ? (
                    <div className="w-10 h-10"></div>
                ) : (
                    <button
                        onClick={() => router.back()}
                        className="w-10 h-10 flex items-center justify-center rounded-xl text-ink-muted hover:bg-surface-2 hover:text-ink active:scale-95 transition-all border border-transparent hover:border-line"
                        aria-label="Kembali"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                )}
                
                <Link href="/dashboard">
                    <h1 className="text-xl font-extrabold text-brand">Narzza Quest</h1>
                </Link>

                <Link href="/profile" className="w-10 h-10 rounded-xl border border-line overflow-hidden shadow-sm bg-surface active:scale-90 transition-transform">
                    <img src={avatarUrl} alt="PP" className="w-full h-full object-cover" />
                </Link>
            </header>
        </>
    );
}
