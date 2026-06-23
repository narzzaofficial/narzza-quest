'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useBadges } from '@/hooks/useBadges';
import { ChevronLeft } from 'lucide-react';
import { dicebearAvatar } from '@/lib/avatar';

export default function TopBar() {
    const pathname = usePathname();
    const router = useRouter();

    const { profile } = useAuth();
    const badges = useBadges();

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

                <div className="w-10 h-10"></div>
            </header>
        </>
    );
}
