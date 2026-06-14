'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useBadges } from '@/hooks/useBadges';
import {
    LayoutDashboard, Bot, ScrollText, BookOpen, Swords, Bell,
    ListTodo, ClipboardCheck, HeartHandshake, LogOut, Users,
    Settings, CalendarDays, Trophy, Wallet, Receipt,
    Activity, BarChart2, PanelLeftClose, PanelLeftOpen, ChevronDown, MessageCircle, BookMarked,
} from 'lucide-react';

type BadgeKey = keyof ReturnType<typeof useBadges>;

interface NavLink {
    name: string;
    href: string;
    icon: React.ReactNode;
    badgeKey: BadgeKey | null;
}

interface NavGroup {
    label?: string;
    links: NavLink[];
}

// ── Sub-components ──────────────────────────────────────────────

function NavBadge({ count, collapsed }: { count: number; collapsed: boolean }) {
    if (count <= 0) return null;
    if (collapsed) return <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full" />;
    return (
        <span className="bg-danger text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm min-w-[20px] text-center leading-5">
            {count > 99 ? '99+' : count}
        </span>
    );
}

function NavGroupSection({
    group, gi, collapsed, pathname, badges, isOpen, onToggle,
}: {
    group: NavGroup;
    gi: number;
    collapsed: boolean;
    pathname: string;
    badges: ReturnType<typeof useBadges>;
    isOpen: boolean;
    onToggle: () => void;
}) {
    return (
        <div>
            {group.label && collapsed && gi > 0 && (
                <div className="my-2 border-t border-line mx-1" />
            )}
            {group.label && !collapsed && (
                <button
                    onClick={onToggle}
                    className="w-full flex items-center justify-between px-3 pt-4 pb-1 group/sec"
                >
                    <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-extrabold uppercase tracking-widest text-ink-muted/50 group-hover/sec:text-ink-muted transition-colors select-none">
                            {group.label}
                        </span>
                        {!isOpen && group.links.some(l => l.badgeKey && (badges[l.badgeKey] ?? 0) > 0) && (
                            <span className="w-1.5 h-1.5 rounded-full bg-danger shrink-0" />
                        )}
                    </div>
                    <ChevronDown
                        className={`w-3 h-3 text-ink-muted/40 group-hover/sec:text-ink-muted transition-all duration-200 ${isOpen ? '' : '-rotate-90'}`}
                    />
                </button>
            )}
            {isOpen && (
                <div className="space-y-0.5">
                    {group.links.map((link) => {
                        const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
                        const badgeCount = link.badgeKey ? badges[link.badgeKey] : 0;
                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                title={collapsed ? link.name : undefined}
                                className={[
                                    'relative flex items-center transition-colors duration-150 font-bold rounded-xl border',
                                    collapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2.5',
                                    isActive
                                        ? 'bg-brand-soft text-brand border-brand/15 shadow-sm'
                                        : 'text-ink-soft border-transparent hover:bg-surface-2 hover:text-brand',
                                ].join(' ')}
                            >
                                <div className={`flex items-center ${collapsed ? '' : 'gap-3'}`}>
                                    <span className={isActive ? 'text-brand' : 'text-ink-muted'}>
                                        {link.icon}
                                    </span>
                                    {!collapsed && <span className="text-sm">{link.name}</span>}
                                </div>
                                <NavBadge count={badgeCount} collapsed={collapsed} />
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ── Main Sidebar ────────────────────────────────────────────────

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { profile, logout, loading } = useAuth();
    const badges = useBadges();

    const [collapsed, setCollapsed] = useState(() => {
        if (typeof window === 'undefined') return false;
        return localStorage.getItem('sidebar_collapsed') === '1';
    });

    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
        if (typeof window === 'undefined') return {};
        try { return JSON.parse(localStorage.getItem('sidebar_groups') || '{}'); }
        catch { return {}; }
    });

    useEffect(() => {
        localStorage.setItem('sidebar_collapsed', collapsed ? '1' : '0');
    }, [collapsed]);

    const isGroupOpen = (label: string) => openGroups[label] !== false;

    const toggleGroup = (label: string) => {
        setOpenGroups(prev => {
            const next = { ...prev, [label]: !isGroupOpen(label) };
            localStorage.setItem('sidebar_groups', JSON.stringify(next));
            return next;
        });
    };

    const heroGroups: NavGroup[] = [
        {
            links: [
                { name: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, badgeKey: null },
            ],
        },
        {
            label: 'Life OS',
            links: [
                { name: 'AI Game Master', href: '/ai-gm', icon: <Bot className="w-5 h-5" />, badgeKey: null },
                { name: 'AI Coach', href: '/chat', icon: <MessageCircle className="w-5 h-5" />, badgeKey: null },
                { name: 'Story Arc', href: '/story-arc', icon: <BookMarked className="w-5 h-5" />, badgeKey: null },
                { name: 'Life Log', href: '/life-log', icon: <Activity className="w-5 h-5" />, badgeKey: null },
                { name: 'Analytics', href: '/analytics', icon: <BarChart2 className="w-5 h-5" />, badgeKey: null },
            ],
        },
        {
            label: 'Quests',
            links: [
                { name: 'Quest Board', href: '/quest-board', icon: <ScrollText className="w-5 h-5" />, badgeKey: 'questBoard' },
                { name: 'Guild Quest', href: '/guild-quest', icon: <Swords className="w-5 h-5" />, badgeKey: 'guildQuest' },
                { name: 'Roadmap', href: '/calendar', icon: <CalendarDays className="w-5 h-5" />, badgeKey: null },
            ],
        },
        {
            label: 'Social',
            links: [
                { name: 'Leaderboard', href: '/leaderboard', icon: <Trophy className="w-5 h-5" />, badgeKey: null },
                { name: 'Arena', href: '/arena', icon: <Swords className="w-5 h-5" />, badgeKey: 'arena' },
                { name: 'My Network', href: '/network', icon: <Users className="w-5 h-5" />, badgeKey: 'network' },
            ],
        },
        {
            label: 'Personal',
            links: [
                { name: 'Jurnal', href: '/journal', icon: <BookOpen className="w-5 h-5" />, badgeKey: 'warRoom' },
                { name: 'Notifications', href: '/notifications', icon: <Bell className="w-5 h-5" />, badgeKey: 'notifications' },
                { name: 'My Wallet', href: '/wallet', icon: <Wallet className="w-5 h-5" />, badgeKey: 'wallet' },
            ],
        },
    ];

    const gmGroups: NavGroup[] = [
        {
            links: [
                { name: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, badgeKey: null },
            ],
        },
        {
            label: 'Manage',
            links: [
                { name: 'Manage Quests', href: '/gm/quests', icon: <ListTodo className="w-5 h-5" />, badgeKey: 'manageQuests' },
                { name: 'Review', href: '/gm/review', icon: <ClipboardCheck className="w-5 h-5" />, badgeKey: 'reviewSubmissions' },
                { name: 'Guild Quest', href: '/gm/guild-quest', icon: <Swords className="w-5 h-5" />, badgeKey: null },
                { name: 'Payouts', href: '/gm/payouts', icon: <Receipt className="w-5 h-5" />, badgeKey: 'questBoard' },
            ],
        },
        {
            label: 'Community',
            links: [
                { name: 'Leaderboard', href: '/leaderboard', icon: <Trophy className="w-5 h-5" />, badgeKey: null },
                { name: 'Encourage', href: '/gm/encourage', icon: <HeartHandshake className="w-5 h-5" />, badgeKey: 'encourage' },
                { name: 'My Network', href: '/network', icon: <Users className="w-5 h-5" />, badgeKey: 'network' },
                { name: 'Notifications', href: '/notifications', icon: <Bell className="w-5 h-5" />, badgeKey: 'notifications' },
            ],
        },
    ];

    const handleLogout = async () => {
        try { await logout(); router.push('/login'); }
        catch (e) { console.error('Logout error:', e); }
    };

    if (loading) {
        return (
            <aside className="hidden md:flex flex-col w-16 h-screen p-3 border-r border-line glass-soft animate-pulse">
                <div className="w-10 h-10 rounded-2xl bg-surface-2 mx-auto mt-4" />
            </aside>
        );
    }

    if (!profile) return null;

    const groups = profile.role === 'gm' ? gmGroups : heroGroups;
    const avatarUrl = profile.avatar ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.displayName)}&background=e9eef7&color=4f7cff&bold=true`;

    return (
        <aside className={`hidden md:flex flex-col h-screen border-r border-line glass-soft transition-all duration-300 ease-in-out ${collapsed ? 'w-17' : 'w-64'}`}>

            {/* PROFILE */}
            <Link
                href="/dashboard"
                className={`flex items-center gap-3 border-b border-line hover:bg-surface-2 transition-colors rounded-xl cursor-pointer group mx-2 ${collapsed ? 'justify-center p-3 my-3' : 'px-3 pt-4 pb-5 mb-2'}`}
            >
                <div className="w-10 h-10 rounded-xl shrink-0 border border-line overflow-hidden bg-surface group-hover:border-brand/40 transition-colors">
                    <Image src={avatarUrl} alt="Avatar" width={40} height={40} className="w-full h-full object-cover" />
                </div>
                {!collapsed && (
                    <div className="flex flex-col overflow-hidden">
                        <h2 className="text-sm font-bold text-ink truncate group-hover:text-brand transition-colors">
                            {profile.displayName}
                        </h2>
                        <span className="text-[9px] font-extrabold uppercase tracking-widest text-brand truncate mt-0.5">
                            {profile.role === 'gm' ? 'Game Master' : profile.title || `Lv. ${profile.level || 1} Hero`}
                        </span>
                    </div>
                )}
            </Link>

            {/* NAVIGATION */}
            <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 custom-scrollbar">
                {groups.map((group, gi) => (
                    <NavGroupSection
                        key={gi}
                        group={group}
                        gi={gi}
                        collapsed={collapsed}
                        pathname={pathname ?? ''}
                        badges={badges}
                        isOpen={!group.label || isGroupOpen(group.label)}
                        onToggle={() => group.label && toggleGroup(group.label)}
                    />
                ))}
            </nav>

            {/* BOTTOM ACTIONS */}
            <div className={`mt-auto pt-3 border-t border-line flex items-center px-2 pb-3 ${collapsed ? 'flex-col gap-1' : 'gap-2'}`}>
                <button
                    onClick={() => setCollapsed(v => !v)}
                    title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    className={`flex items-center justify-center p-2.5 rounded-xl text-ink-muted hover:bg-surface-2 hover:text-brand transition-colors ${collapsed ? 'w-full' : ''}`}
                >
                    {collapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
                </button>

                <button
                    onClick={handleLogout}
                    title="Keluar"
                    className={`flex items-center justify-center gap-2 rounded-xl text-danger/70 hover:bg-danger-soft hover:text-danger transition-colors font-bold text-sm p-2.5 ${collapsed ? 'w-full' : 'flex-1'}`}
                >
                    <LogOut className="w-5 h-5 shrink-0" />
                    {!collapsed && <span>Keluar</span>}
                </button>

                <Link
                    href="/profile"
                    title="Settings"
                    className="relative group flex items-center justify-center p-2.5 rounded-xl text-ink-muted hover:bg-brand-soft hover:text-brand transition-colors"
                >
                    <Settings className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90" />
                </Link>
            </div>
        </aside>
    );
}
