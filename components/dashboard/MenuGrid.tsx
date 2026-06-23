'use client';

import Link from 'next/link';
import {
    Bot, MessageCircle, BookMarked, Activity, BarChart2,
    Swords, CalendarDays, Trophy, Users, BookOpen, Bell, Wallet,
    ListTodo, ClipboardCheck, HeartHandshake, ShieldAlert,
} from 'lucide-react';
import { useBadges } from '@/hooks/useBadges';

interface MenuItem {
    name: string;
    href: string;
    icon: React.ElementType;
    badgeKey?: keyof ReturnType<typeof useBadges>;
    colorClass: string;
    bgClass: string;
}

const heroMenuItems: MenuItem[] = [
    { name: 'AI GM', href: '/ai-gm', icon: Bot, colorClass: 'text-brand', bgClass: 'bg-brand-soft' },
    { name: 'AI Coach', href: '/chat', icon: MessageCircle, colorClass: 'text-purple-500', bgClass: 'bg-purple-500/10' },
    { name: 'Story Arc', href: '/story-arc', icon: BookMarked, colorClass: 'text-amber-500', bgClass: 'bg-amber-500/10' },
    { name: 'Life Log', href: '/life-log', icon: Activity, colorClass: 'text-green-500', bgClass: 'bg-green-500/10' },
    { name: 'Analytics', href: '/analytics', icon: BarChart2, colorClass: 'text-sky-500', bgClass: 'bg-sky-500/10' },
    { name: 'Guild Quest', href: '/guild-quest', icon: Swords, colorClass: 'text-rose-500', bgClass: 'bg-rose-500/10' },
    { name: 'Kalender', href: '/calendar', icon: CalendarDays, colorClass: 'text-indigo-500', bgClass: 'bg-indigo-500/10' },
    { name: 'Jurnal', href: '/journal', icon: BookOpen, badgeKey: 'warRoom', colorClass: 'text-teal-500', bgClass: 'bg-teal-500/10' },
    { name: 'Leaderboard', href: '/leaderboard', icon: Trophy, colorClass: 'text-yellow-500', bgClass: 'bg-yellow-500/10' },
    { name: 'Arena', href: '/arena', icon: Swords, badgeKey: 'arena', colorClass: 'text-red-500', bgClass: 'bg-red-500/10' },
    { name: 'Network', href: '/network', icon: Users, badgeKey: 'network', colorClass: 'text-blue-500', bgClass: 'bg-blue-500/10' },
    { name: 'Notifikasi', href: '/notifications', icon: Bell, badgeKey: 'notifications', colorClass: 'text-orange-500', bgClass: 'bg-orange-500/10' },
];

const gmMenuItems: MenuItem[] = [
    { name: 'Review', href: '/gm/review', icon: ClipboardCheck, badgeKey: 'reviewSubmissions', colorClass: 'text-brand', bgClass: 'bg-brand-soft' },
    { name: 'Manage', href: '/gm/quests', icon: ListTodo, badgeKey: 'manageQuests', colorClass: 'text-purple-500', bgClass: 'bg-purple-500/10' },
    { name: 'Guild', href: '/gm/guild-quest', icon: Swords, colorClass: 'text-rose-500', bgClass: 'bg-rose-500/10' },
    { name: 'Encourage', href: '/gm/encourage', icon: HeartHandshake, badgeKey: 'encourage', colorClass: 'text-amber-500', bgClass: 'bg-amber-500/10' },
    { name: 'Leaderboard', href: '/leaderboard', icon: Trophy, colorClass: 'text-yellow-500', bgClass: 'bg-yellow-500/10' },
    { name: 'Network', href: '/network', icon: Users, badgeKey: 'network', colorClass: 'text-blue-500', bgClass: 'bg-blue-500/10' },
    { name: 'Notifikasi', href: '/notifications', icon: Bell, badgeKey: 'notifications', colorClass: 'text-orange-500', bgClass: 'bg-orange-500/10' },
];

export function MenuGrid({ role }: { role: 'hero' | 'gm' }) {
    const badges = useBadges();
    const items = role === 'gm' ? gmMenuItems : heroMenuItems;

    return (
        <section className="md:hidden glass rounded-card p-4 shadow-card">
            <div className="grid grid-cols-4 md:grid-cols-6 gap-y-4 gap-x-2">
                {items.map((item) => {
                    const badgeCount = item.badgeKey ? badges[item.badgeKey] : 0;
                    return (
                        <Link key={item.href} href={item.href} className="flex flex-col items-center gap-2 group">
                            <div className={`relative flex items-center justify-center w-12 h-12 rounded-2xl ${item.bgClass} transition-transform group-hover:scale-110 active:scale-95`}>
                                <item.icon className={`w-6 h-6 ${item.colorClass}`} />
                                {badgeCount > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-danger text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-sm border-2 border-white">
                                        {badgeCount > 99 ? '99+' : badgeCount}
                                    </span>
                                )}
                            </div>
                            <span className="text-[10px] font-bold text-ink-soft text-center leading-tight px-1">
                                {item.name}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}
