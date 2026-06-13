'use client';

import React from 'react';
import {
    Wallet,
    Banknote,
    ArrowRightLeft,
    Send,
    AlertCircle,
    Clock,
    CheckCircle2,
    FileText,
    ExternalLink,
    XCircle,
    Loader2,
} from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { GRAD } from '@/constants/ui';
import PageHeader from '@/components/ui/PageHeader';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import SectionLabel from '@/components/ui/SectionLabel';
import Toast from '@/components/ui/Toast';
import type { Withdrawal } from '@/types';

function avatarFor(name: string) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=e7f6ef&color=18a06b&bold=true`;
}

const STATUS_UI: Record<string, { soft: string; color: string; icon: React.ElementType; text: string }> = {
    pending: { soft: 'bg-warn-soft', color: 'var(--color-warn)', icon: Clock, text: 'Menunggu Transfer GM' },
    transfer_submitted: { soft: 'bg-brand-soft', color: 'var(--color-brand)', icon: FileText, text: 'Menunggu Konfirmasimu' },
    completed: { soft: 'bg-success-soft', color: 'var(--color-success)', icon: CheckCircle2, text: 'Berhasil Dicairkan' },
};

export default function WalletPage() {
    const w = useWallet();

    if (w.profile?.role === 'gm') {
        return <div className="min-h-[60vh] flex items-center justify-center text-ink-soft font-bold">Halaman ini khusus untuk Hero.</div>;
    }

    if (w.loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-success animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
            <PageHeader
                grad="green"
                icon={<Wallet className="w-6 h-6 text-white" />}
                title="Dompet Quest"
                subtitle="Harta dari quest berhadiah — tarik kapan saja."
                badge="Treasury"
            />

            {/* Total balance */}
            <GlassCard className="relative overflow-hidden p-6 md:p-7">
                <Banknote className="absolute -right-4 -top-4 w-28 h-28 text-success/10 rotate-12 pointer-events-none" />
                <p className="text-ink-muted text-[10px] uppercase tracking-widest font-bold mb-1">Total Harta Terkumpul</p>
                <p className="text-4xl md:text-5xl font-black text-success">Rp {w.totalBalance.toLocaleString('id-ID')}</p>
            </GlassCard>

            {/* Balance per GM */}
            <section className="space-y-3">
                <SectionLabel className="flex items-center gap-1.5"><ArrowRightLeft className="w-3.5 h-3.5" /> Saldo Per Sponsor (GM)</SectionLabel>
                {Object.keys(w.localBalances).length === 0 ? (
                    <EmptyState icon={AlertCircle} title="Belum ada pemasukan" desc="Selesaikan quest berhadiah untuk mengisi dompet." />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(w.localBalances).map(([gmUid, amount]) => {
                            const gm = w.gmProfiles[gmUid];
                            const isZero = amount === 0;
                            return (
                                <GlassCard key={gmUid} className={`p-5 ${isZero ? 'opacity-70' : ''}`}>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 rounded-xl overflow-hidden ring-2 ring-success/15 bg-surface shrink-0">
                                            <img src={gm?.avatar || avatarFor(gm?.displayName || 'GM')} alt="GM" className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-ink-muted uppercase tracking-widest">Sponsor Quest</p>
                                            <h3 className="text-lg font-bold text-ink leading-tight">{gm?.displayName || 'Game Master'}</h3>
                                        </div>
                                    </div>
                                    <div className="bg-surface-2 p-4 rounded-xl mb-4">
                                        <p className="text-[10px] font-bold text-ink-muted uppercase mb-1">Saldo Tersedia</p>
                                        <p className={`text-2xl font-black ${isZero ? 'text-ink-muted' : 'text-success'}`}>Rp {amount.toLocaleString('id-ID')}</p>
                                    </div>
                                    <button
                                        onClick={() => w.handleWithdraw(gmUid, amount)}
                                        disabled={isZero || w.processingId === gmUid}
                                        className={`w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-colors disabled:cursor-not-allowed ${isZero ? 'bg-surface-2 text-ink-muted' : 'bg-success text-white hover:brightness-95 shadow-card'}`}
                                    >
                                        {w.processingId === gmUid ? <Loader2 className="w-4 h-4 animate-spin" /> : isZero ? 'Saldo Kosong' : <><Send className="w-4 h-4" /> Ajukan Pencairan</>}
                                    </button>
                                </GlassCard>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* History */}
            <section className="space-y-3">
                <SectionLabel className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Riwayat Pencairan</SectionLabel>
                {w.withdrawals.length === 0 ? (
                    <EmptyState icon={FileText} title="Belum ada riwayat" desc="Tagihan pencairanmu akan muncul di sini." />
                ) : (
                    <div className="space-y-3">
                        {w.withdrawals.map((wd) => (
                            <WithdrawalRow key={wd.id} wd={wd} w={w} />
                        ))}
                    </div>
                )}
            </section>

            <Toast isVisible={w.toast.show} onClose={() => w.setToast({ ...w.toast, show: false })} message={w.toast.msg} type={w.toast.type} />
        </div>
    );
}

type WalletData = ReturnType<typeof useWallet>;

function WithdrawalRow({ wd, w }: { wd: Withdrawal; w: WalletData }) {
    const status = STATUS_UI[wd.status] ?? { soft: 'bg-surface-2', color: 'var(--color-ink-soft)', icon: AlertCircle, text: wd.status };
    const isActionable = wd.status === 'transfer_submitted';
    const gmName = w.gmProfiles[wd.gmUid]?.displayName || 'GM';

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
