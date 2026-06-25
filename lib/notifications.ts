import { Bell, Heart, CheckCircle2, AlertTriangle, ScrollText, Wallet, Swords } from 'lucide-react';
import type { ElementType } from 'react';

/** Icon + color styling for a notification row, based on its type. */
export function getNotifStyle(type: string): { Icon: ElementType; soft: string; color: string } {
    switch (type) {
        case 'encouragement':       return { Icon: Heart,        soft: 'bg-danger-soft',  color: 'var(--color-danger)'  };
        case 'quest_approved':      return { Icon: CheckCircle2, soft: 'bg-success-soft', color: 'var(--color-success)' };
        case 'quest_rejected':      return { Icon: AlertTriangle, soft: 'bg-danger-soft', color: 'var(--color-danger)'  };
        case 'quest_assigned':
        case 'quest_created':       return { Icon: ScrollText,   soft: 'bg-brand-soft',   color: 'var(--color-brand)'   };
        case 'guild_quest_open':
        case 'guild_quest_claimed': return { Icon: Swords,       soft: 'bg-info-soft',    color: 'var(--color-info)'    };
        case 'withdrawal_requested':
        case 'withdrawal_transferred':
        case 'withdrawal_confirmed':
        case 'withdrawal_rejected': return { Icon: Wallet,       soft: 'bg-success-soft', color: 'var(--color-success)' };
        default:                    return { Icon: Bell,          soft: 'bg-surface-2',    color: 'var(--color-ink-soft)' };
    }
}

/** Resolves where a notification should navigate to when tapped, based on its type. */
export function getNotificationHref(type: string, role?: string, refId?: string): string | null {
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
