'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Bot, Loader2, Check, BellOff, BellRing } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { useGMMessages } from '@/hooks/useGMMessages';
import { useAuth } from '@/hooks/useAuth';
import { usePushSubscription } from '@/hooks/usePushSubscription';
import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/ui/EmptyState';
import { GMMessageRow } from '@/components/notifications/GMMessageRow';
import { NotifRow }     from '@/components/notifications/NotifRow';

function notifHref(type: string, role?: string, refId?: string): string | null {
    switch (type) {
        case 'quest_assigned':
        case 'quest_created':
        case 'quest_approved':
        case 'quest_rejected':
            return '/quest-board';
        case 'guild_quest_open':
            return '/guild-quest';
        case 'guild_quest_claimed':
            return '/gm/guild-quest';
        case 'withdrawal_requested':
        case 'withdrawal_confirmed':
        case 'withdrawal_rejected':
        case 'withdrawal_transferred':
        case 'reminder': {
            const base = role === 'gm' ? '/gm/payouts' : '/wallet';
            return refId ? `${base}?highlight=${refId}` : base;
        }
        default:
            return null;
    }
}

export default function NotificationsPage() {
    const { notifications, loading, unreadCount, markRead, markAllRead } = useNotifications();
    const { profile } = useAuth();
    const router = useRouter();
    const gm = useGMMessages(profile?.uid);
    const { state: pushState, subscribe, unsubscribe } = usePushSubscription();

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-brand animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
            <PageHeader
                icon={<Bell className="w-6 h-6 text-white" />}
                title="Notifikasi"
                subtitle="Pemberitahuan dari sistem & Game Master."
                badge={unreadCount > 0 ? `${unreadCount} baru` : undefined}
                actions={
                    <div className="flex items-center gap-2">
                        {pushState === 'unsubscribed' && (
                            <button
                                onClick={subscribe}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-brand/20 ring-1 ring-brand/40 px-4 py-2.5 text-brand text-sm font-bold hover:bg-brand/30 transition"
                            >
                                <BellRing className="w-4 h-4" /> Aktifkan Push
                            </button>
                        )}
                        {pushState === 'subscribed' && (
                            <button
                                onClick={unsubscribe}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 ring-1 ring-white/20 px-4 py-2.5 text-white/60 text-sm font-bold hover:bg-white/15 transition"
                            >
                                <BellOff className="w-4 h-4" /> Push Aktif
                            </button>
                        )}
                        {pushState === 'denied' && (
                            <span className="inline-flex items-center gap-1.5 px-4 py-2.5 text-red-400 text-sm font-bold">
                                <BellOff className="w-4 h-4" /> Notifikasi diblokir
                            </span>
                        )}
                        <button
                            onClick={markAllRead}
                            disabled={unreadCount === 0}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-white/15 ring-1 ring-white/25 px-4 py-2.5 text-white text-sm font-bold hover:bg-white/25 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Check className="w-4 h-4" /> Tandai semua dibaca
                        </button>
                    </div>
                }
            />

            {gm.messages.length > 0 && (
                <section>
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Bot className="w-4 h-4 text-brand" />
                            <p className="text-ink font-extrabold text-sm">Pesan dari AI Game Master</p>
                            {gm.unreadCount > 0 && (
                                <span className="bg-brand text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                                    {gm.unreadCount}
                                </span>
                            )}
                        </div>
                        {gm.unreadCount > 0 && (
                            <button onClick={gm.markAllRead} className="text-brand text-xs font-bold hover:underline">
                                Tandai semua dibaca
                            </button>
                        )}
                    </div>
                    <div className="space-y-3">
                        {gm.messages.map((msg) => (
                            <GMMessageRow key={msg.id} message={msg} onRead={gm.markRead} />
                        ))}
                    </div>
                </section>
            )}

            {notifications.length === 0 ? (
                <EmptyState icon={Bell} title="Kotak masukmu bersih!" desc="Belum ada notifikasi baru saat ini." />
            ) : (
                <div className="space-y-3">
                    {notifications.map((notif) => {
                        const href = notifHref(notif.type, profile?.role, notif.refId);
                        return (
                            <NotifRow
                                key={notif.id}
                                notif={notif}
                                href={href}
                                onActivate={() => {
                                    markRead(notif.id, notif.isRead);
                                    if (href) router.push(href);
                                }}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
}
