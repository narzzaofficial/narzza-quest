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
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    const { profile, logout } = useAuth();
    const badges = useBadges();

    useEffect(() => {
        document.body.style.overflow = isMenuOpen ? 'hidden' : 'auto';
    }, [isMenuOpen]);

    const heroLinks: LinkItem[] = [
        { name: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, badgeKey: null },
        { name: 'AI Game Master', href: '/ai-gm', icon: <Bot className="w-5 h-5" />, badgeKey: null },
        { name: 'Quest Board', href: '/quest-board', icon: <ScrollText className="w-5 h-5" />, badgeKey: 'questBoard' },
        { name: 'Guild Quest', href: '/guild-quest', icon: <Swords className="w-5 h-5" />, badgeKey: 'guildQuest' },
        { name: 'Roadmap', href: '/calendar', icon: <CalendarDays className="w-5 h-5" />, badgeKey: null },
        { name: 'Leaderboard', href: '/leaderboard', icon: <Trophy className="w-5 h-5" />, badgeKey: null },
        { name: 'My Wallet', href: '/wallet', icon: <Wallet className="w-5 h-5" />, badgeKey: 'wallet' },
        { name: 'Jurnal', href: '/journal', icon: <BookOpen className="w-5 h-5" />, badgeKey: 'warRoom' },
        { name: 'Arena', href: '/arena', icon: <Swords className="w-5 h-5" />, badgeKey: 'arena' },
        { name: 'My Network', href: '/network', icon: <Users className="w-5 h-5" />, badgeKey: 'network' },
        { name: 'Notifications', href: '/notifications', icon: <Bell className="w-5 h-5" />, badgeKey: 'notifications' },
    ];

    const gmLinks: LinkItem[] = [
        { name: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, badgeKey: null },
        { name: 'Manage Quests', href: '/gm/quests', icon: <ListTodo className="w-5 h-5" />, badgeKey: 'manageQuests' },
        { name: 'Guild Quest', href: '/gm/guild-quest', icon: <Swords className="w-5 h-5" />, badgeKey: null },
        { name: 'Roadmap', href: '/calendar', icon: <CalendarDays className="w-5 h-5" />, badgeKey: 'roadmap' },
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

    const links = profile.role === 'gm' ? gmLinks : heroLinks;
    const avatarUrl = profile.avatar || dicebearAvatar(profile.displayName);

    const totalBadges = Object.values(badges).reduce((a, b) => a + b, 0);

    return (
        <>
            <header className="flex md:hidden items-center justify-between w-full p-4 sticky top-0 z-40 border-b border-line glass">
                {/* Hamburger + total badge indicator */}
                <div className="relative">
                    <button
                        onClick={() => setIsMenuOpen(true)}
                        className="p-2.5 rounded-xl bg-brand-soft text-brand border border-brand/15 active:scale-95 transition-transform"
                        aria-label="Buka menu"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    {totalBadges > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-danger text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-md">
                            {totalBadges > 99 ? '99+' : totalBadges}
                        </span>
                    )}
                </div>

                <Link href="/dashboard">
                    <h1 className="text-xl font-extrabold text-brand">Narzza Quest</h1>
                </Link>

                <Link href="/profile" className="w-10 h-10 rounded-xl border border-line overflow-hidden shadow-sm bg-surface active:scale-90 transition-transform">
                    <img src={avatarUrl} alt="PP" className="w-full h-full object-cover" />
                </Link>
            </header>

            {/* ─── MOBILE SLIDE-OUT OVERLAY ─── */}
            <div
                className={`fixed inset-0 bg-ink/50 backdrop-blur-sm z-50 md:hidden transition-opacity duration-300 ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
                onClick={() => setIsMenuOpen(false)}
            />

            {/* ─── SLIDE PANEL ─── */}
            <div
                className={`fixed inset-y-0 left-0 w-[85%] max-w-sm bg-surface z-50 md:hidden shadow-2xl flex flex-col transition-transform duration-300 ease-in-out transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
                style={{ height: '100dvh' }}
            >
                {/* Header */}
                <div className="p-6 border-b border-line bg-brand-soft relative shrink-0">
                    <button
                        onClick={() => setIsMenuOpen(false)}
                        className="absolute top-4 right-4 text-ink-muted p-2 hover:text-danger transition-colors"
                        aria-label="Tutup menu"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <div className="flex items-center gap-4 mt-2">
                        <div className="w-14 h-14 rounded-2xl border border-line overflow-hidden shadow-sm bg-surface">
                            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col">
                            <h2 className="text-lg font-bold text-ink truncate max-w-[160px]">{profile.displayName}</h2>
                            <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand mt-0.5">
                                {profile.role === 'gm' ? 'Game Master' : profile.title || `Lv. ${profile.level || 1} Hero`}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 overflow-y-auto p-4 space-y-1 overscroll-contain custom-scrollbar">
                    {links.map((link) => {
                        const isActive =
                            pathname === link.href || (link.href !== '/dashboard' && pathname?.startsWith(`${link.href}/`));
                        const badgeCount = link.badgeKey ? badges[link.badgeKey] : 0;

                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                onClick={() => setIsMenuOpen(false)}
                                className={`flex items-center justify-between px-4 py-3.5 rounded-xl font-bold transition-colors duration-150 border ${isActive
                                    ? 'bg-brand-soft text-brand border-brand/15 shadow-sm'
                                    : 'text-ink-soft hover:bg-surface-2 border-transparent'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <span className={isActive ? 'text-brand' : 'text-ink-muted'}>{link.icon}</span>
                                    <span className="text-sm">{link.name}</span>
                                </div>
                                <NavBadge count={badgeCount} />
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer actions */}
                <div className="p-4 pt-6 border-t border-line bg-surface-2 shrink-0 grid grid-cols-2 gap-4 pb-[calc(env(safe-area-inset-bottom,16px)+8px)]">
                    <Link
                        href="/profile"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-surface border border-line text-ink-soft font-bold text-xs shadow-sm active:scale-95 transition-transform"
                    >
                        <Settings className="w-4 h-4 text-brand" />
                        <span>Settings</span>
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-danger-soft text-danger font-bold text-xs border border-danger/15 shadow-sm active:scale-95 transition-transform"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Log Out</span>
                    </button>
                </div>
            </div>
        </>
    );
}
