'use client';

import React from 'react';
import {
    AlertCircle, Clock, CheckCircle2, FileText, ExternalLink, XCircle, Loader2,
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import type { useWallet } from '@/hooks/useWallet';
import type { Withdrawal } from '@/types';

const STATUS_UI: Record<string, { soft: string; color: string; icon: React.ElementType; text: string }> = {
    pending:            { soft: 'bg-warn-soft',    color: 'var(--color-warn)',    icon: Clock,        text: 'Menunggu Transfer GM'     },
    transfer_submitted: { soft: 'bg-brand-soft',   color: 'var(--color-brand)',   icon: FileText,     text: 'Menunggu Konfirmasimu'    },
    completed:          { soft: 'bg-success-soft',  color: 'var(--color-success)', icon: CheckCircle2, text: 'Berhasil Dicairkan'        },
};

type WalletData = ReturnType<typeof useWallet>;

interface Props {
    wd: Withdrawal;
    w: WalletData;
}

export function WithdrawalRow({ wd, w }: Props) {
    const status     = STATUS_UI[wd.status] ?? { soft: 'bg-surface-2', color: 'var(--color-ink-soft)', icon: AlertCircle, text: wd.status };
    const isActionable = wd.status === 'transfer_submitted';
    const gmName     = w.gmProfiles[wd.gmUid]?.displayName || 'GM';

    return (
        <GlassCard className="p-5">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-3">
                <div>
                    <span className={`${status.soft} inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mb-2`} style={{ color: status.color }}>
                        <status.icon className="w-3.5 h-3.5" /> {status.text}
                    </span>
                    <h3 className="text-xl font-black text-ink">Rp {wd.amount.toLocaleString('id-ID')}</h3>
                    <p className="text-xs text-ink-soft">Tagihan ke: <span className="font-bold text-ink">{gmName}</span></p>
                </div>
                <p className="text-[10px] font-bold text-ink-muted whitespace-nowrap bg-surface-2 px-3 py-1.5 rounded-lg">
                    {new Date(wd.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
            </div>

            {wd.proofUrl && (
                <a href={wd.proofUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold text-brand bg-brand-soft px-3 py-2 rounded-lg hover:brightness-95 transition mb-3">
                    <ExternalLink className="w-3.5 h-3.5" /> Lihat Bukti Transfer dari GM
                </a>
            )}

            {wd.note && (
                <div className="bg-surface-2 p-3 rounded-lg mb-3">
                    <p className="text-xs font-bold text-ink-muted uppercase mb-0.5">Catatan:</p>
                    <p className="text-sm font-medium text-ink-soft italic">&ldquo;{wd.note}&rdquo;</p>
                </div>
            )}

            {isActionable && (
                <div className="pt-3 border-t border-line mt-2">
                    {w.rejectingId === wd.id ? (
                        <div className="bg-danger-soft p-3 rounded-xl">
                            <input
                                type="text"
                                placeholder="Kenapa ditolak? (misal: uang belum masuk)"
                                value={w.rejectReason}
                                onChange={(e) => w.setRejectReason(e.target.value)}
                                className="w-full text-sm p-2.5 rounded-lg border border-line bg-surface mb-2 outline-none focus:ring-2 focus:ring-danger/20"
                            />
                            <div className="flex justify-end gap-2">
                                <Button size="sm" variant="ghost" onClick={() => w.setRejectingId(null)}>Batal</Button>
                                <button onClick={() => w.handleResolve(wd.id, 'reject')} disabled={w.processingId === wd.id} className="inline-flex items-center gap-1.5 rounded-xl bg-danger text-white px-4 py-2 text-sm font-bold hover:brightness-95 disabled:opacity-60">
                                    {w.processingId === wd.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Tolak Bukti'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <button
                                onClick={() => w.handleResolve(wd.id, 'approve')}
                                disabled={w.processingId !== null}
                                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-success text-white py-2.5 font-bold text-sm hover:brightness-95 disabled:opacity-60"
                            >
                                <CheckCircle2 className="w-4 h-4" /> Dana Sudah Masuk
                            </button>
                            <button
                                onClick={() => w.setRejectingId(wd.id)}
                                disabled={w.processingId !== null}
                                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-line text-danger py-2.5 font-bold text-sm hover:bg-danger-soft disabled:opacity-60"
                            >
                                <XCircle className="w-4 h-4" /> Tolak
                            </button>
                        </div>
                    )}
                </div>
            )}
        </GlassCard>
    );
}
