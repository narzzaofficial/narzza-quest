'use client';

import { Swords, Users, CheckCircle2, Lock, Zap, Wallet, Clock, Loader2 } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import DifficultyBadge from '@/components/ui/DifficultyBadge';
import { formatRupiah } from '@/lib/currency';
import { formatDeadlineShort } from '@/lib/dateUtils';
import type { GuildQuest } from '@/types';

interface Props {
    gq: GuildQuest;
    uid: string;
    claimingId: string | null;
    onClaim: (gq: GuildQuest) => void;
}

export function GuildQuestCard({ gq, uid, claimingId, onClaim }: Props) {
    const isClaimed   = gq.claimedBy.includes(uid);
    const isFull      = gq.status === 'closed';
    const claimedCount = gq.claimedBy.length;
    const slotsLeft   = gq.maxClaims - claimedCount;
    const isExpired   = new Date(gq.deadline) < new Date();
    const disabled    = isClaimed || isFull || isExpired;

    return (
        <GlassCard className="flex flex-col p-5">
            <div className="flex justify-between items-start mb-3">
                <DifficultyBadge difficulty={gq.difficulty} className="px-2.5 py-1 text-sm" />
                {isClaimed ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black text-success bg-success-soft px-2 py-0.5 rounded-full"><CheckCircle2 className="w-3 h-3" /> Sudah Diambil</span>
                ) : isFull ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black text-danger bg-danger-soft px-2 py-0.5 rounded-full"><Lock className="w-3 h-3" /> Slot Penuh</span>
                ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black text-warn bg-warn-soft px-2 py-0.5 rounded-full"><Users className="w-3 h-3" /> {slotsLeft} Slot Tersisa</span>
                )}
            </div>

            <span className="text-[10px] font-black text-brand uppercase tracking-wide bg-brand-soft px-2 py-1 rounded self-start mb-2">dari: {gq.createdByName}</span>

            <h3 className="text-lg font-extrabold text-ink leading-tight mb-1.5">{gq.title}</h3>
            <p className="text-ink-soft text-sm leading-relaxed mb-4 line-clamp-3">{gq.description}</p>

            {gq.motivation && (
                <div className="bg-brand-soft border border-brand/15 rounded-xl p-3 mb-4">
                    <p className="text-ink text-xs italic">💌 &ldquo;{gq.motivation}&rdquo;</p>
                </div>
            )}

            <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-[10px] font-bold text-brand bg-brand-soft px-2.5 py-1 rounded-lg">+{gq.expReward} EXP</span>
                {gq.moneyReward && gq.moneyReward > 0 ? (
                    <span className="text-[10px] font-bold text-success bg-success-soft px-2.5 py-1 rounded-lg inline-flex items-center gap-1"><Wallet className="w-3 h-3" /> {formatRupiah(gq.moneyReward)}</span>
                ) : null}
                <span className="text-[10px] font-bold text-ink-soft bg-surface-2 px-2.5 py-1 rounded-lg inline-flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {formatDeadlineShort(gq.deadline)}
                </span>
            </div>

            <div className="mb-4">
                <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${isFull ? 'bg-danger' : 'bg-brand'}`} style={{ width: `${Math.min(100, (claimedCount / gq.maxClaims) * 100)}%` }} />
                </div>
                <p className="text-[10px] font-bold text-ink-muted mt-1">{claimedCount}/{gq.maxClaims} hero telah mengambil</p>
            </div>

            <button
                onClick={() => onClaim(gq)}
                disabled={disabled || claimingId === gq.id}
                className={`w-full mt-auto inline-flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all disabled:cursor-not-allowed ${disabled ? 'bg-surface-2 text-ink-muted' : 'bg-brand text-white shadow-card hover:bg-brand-hover'}`}
            >
                {claimingId === gq.id
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : isClaimed ? <><CheckCircle2 className="w-4 h-4" /> Sudah Kamu Ambil</>
                    : isFull    ? <><Lock className="w-4 h-4" /> Slot Habis</>
                    : isExpired ? 'Kedaluwarsa'
                    : <><Zap className="w-4 h-4" /> Ambil Quest Ini!</>
                }
            </button>
        </GlassCard>
    );
}
