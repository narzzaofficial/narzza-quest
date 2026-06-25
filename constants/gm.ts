import { Heart, Brain, Zap, Coffee, AlertCircle, Clock, CheckCircle2, FileText } from 'lucide-react';
import type { ElementType } from 'react';

/** Buff types a GM can attach to an encouragement message. */
export const BUFF_OPTIONS: { name: string; icon: ElementType }[] = [
    { name: 'Kasih Sayang', icon: Heart },
    { name: 'Fokus Penuh', icon: Brain },
    { name: 'Extra Energi', icon: Zap },
    { name: 'Secangkir Kopi', icon: Coffee },
];

/** Visual styling per Withdrawal status, used on the GM Payouts page. */
export const WITHDRAWAL_STATUS_UI: Record<string, { soft: string; color: string; icon: ElementType; text: string }> = {
    pending: { soft: 'bg-danger-soft', color: 'var(--color-danger)', icon: AlertCircle, text: 'Butuh Pembayaran' },
    transfer_submitted: { soft: 'bg-brand-soft', color: 'var(--color-brand)', icon: Clock, text: 'Menunggu Konfirmasi Hero' },
    completed: { soft: 'bg-success-soft', color: 'var(--color-success)', icon: CheckCircle2, text: 'Pembayaran Selesai' },
};

export const WITHDRAWAL_STATUS_UI_FALLBACK = { soft: 'bg-surface-2', color: 'var(--color-ink-soft)', icon: FileText, text: '' };
