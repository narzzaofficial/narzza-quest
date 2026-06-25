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
