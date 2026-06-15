'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard, ScrollText, Bot, Activity, Bell,
    ListTodo, ClipboardCheck, HeartHandshake,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useBadges } from '@/hooks/useBadges';

interface TabItem {
    name: string;
    href: string;
    icon: React.ElementType;
    badgeKey?: keyof ReturnType<typeof useBadges>;
}

const heroTabs: TabItem[] = [
    { name: 'Home',        href: '/dashboard',   icon: LayoutDashboard },
    { name: 'Quest',       href: '/quest-board', icon: ScrollText,      badgeKey: 'questBoard' },
    { name: 'AI GM',       href: '/ai-gm',       icon: Bot },
    { name: 'Life Log',    href: '/life-log',    icon: Activity },
    { name: 'Notif',       href: '/notifications', icon: Bell,           badgeKey: 'notifications' },
];

const gmTabs: TabItem[] = [
    { name: 'Home',     href: '/dashboard',   icon: LayoutDashboard },
    { name: 'Quests',   href: '/gm/quests',   icon: ListTodo,         badgeKey: 'manageQuests' },
    { name: 'Review',   href: '/gm/review',   icon: ClipboardCheck,   badgeKey: 'reviewSubmissions' },
    { name: 'Cheer',    href: '/gm/encourage',icon: HeartHandshake,   badgeKey: 'encourage' },
    { name: 'Notif',    href: '/notifications',icon: Bell,             badgeKey: 'notifications' },
];

export function BottomNav() {
    const pathname = usePathname();
    const { profile } = useAuth();
    const badges = useBadges();

    if (!profile) return null;

    const tabs = profile.role === 'gm' ? gmTabs : heroTabs;

    return (
        <nav
            className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-surface/95 backdrop-blur-md border-t border-line"
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
            <div className="flex items-stretch h-16">
                {tabs.map((tab) => {
                    const isActive = pathname === tab.href || (tab.href !== '/dashboard' && pathname?.startsWith(tab.href));
                    const badgeCount = tab.badgeKey ? badges[tab.badgeKey] : 0;
                    const Icon = tab.icon;

                    return (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            className={`flex-1 flex flex-col items-center justify-center gap-0.5 relative transition-colors active:scale-90 duration-100 ${
                                isActive ? 'text-brand' : 'text-ink-muted'
                            }`}
                        >
                            <div className="relative">
                                <Icon className="w-5 h-5" />
                                {badgeCount > 0 && (
                                    <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 bg-danger text-white text-[9px] font-black rounded-full flex items-center justify-center px-1 leading-none shadow">
                                        {badgeCount > 99 ? '99+' : badgeCount}
                                    </span>
                                )}
                            </div>
                            <span className="text-[10px] font-bold leading-none">{tab.name}</span>
                            {isActive && (
                                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-brand rounded-full" />
                            )}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
