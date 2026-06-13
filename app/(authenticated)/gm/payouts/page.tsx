'use client';

import React from 'react';
import {
    Receipt,
    CheckCircle2,
    Clock,
    FileText,
    Upload,
    AlertCircle,
    ExternalLink,
    X,
    Image as ImageIcon,
    UploadCloud,
    Loader2,
} from 'lucide-react';
import { useGMPayouts } from '@/hooks/useGMPayouts';
import PageHeader from '@/components/ui/PageHeader';
import GlassCard from '@/components/ui/GlassCard';
import EmptyState from '@/components/ui/EmptyState';
import Button from '@/components/ui/Button';
import Toast from '@/components/ui/Toast';
import type { Withdrawal } from '@/types';

const STATUS_UI: Record<string, { soft: string; color: string; icon: React.ElementType; text: string }> = {
    pending: { soft: 'bg-danger-soft', color: 'var(--color-danger)', icon: AlertCircle, text: 'Butuh Pembayaran' },
    transfer_submitted: { soft: 'bg-brand-soft', color: 'var(--color-brand)', icon: Clock, text: 'Menunggu Konfirmasi Hero' },
    completed: { soft: 'bg-success-soft', color: 'var(--color-success)', icon: CheckCircle2, text: 'Pembayaran Selesai' },
};

export default function GMPayoutsPage() {
    const p = useGMPayouts();

    if (p.profile && p.profile.role !== 'gm') {
        return <div className="min-h-[60vh] flex items-center justify-center text-ink-soft font-bold">Akses ditolak. Khusus Game Master.</div>;
    }
    if (p.loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-brand animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
            <PageHeader
                grad="green"
                icon={<Receipt className="w-6 h-6 text-white" />}
                title="Payouts"
                subtitle="Proses pencairan dana dari quest yang diselesaikan hero."
                badge="Finance"
                actions={
                    <div className="bg-white/15 ring-1 ring-white/25 px-5 py-3 rounded-xl text-center">
                        <p className="text-white/70 text-[10px] font-black uppercase tracking-widest mb-0.5">Harus Dibayar</p>
                        <p className="text-2xl font-black text-white">Rp {p.pendingTotal.toLocaleString('id-ID')}</p>
                    </div>
                }
            />

            {p.withdrawals.length === 0 ? (
                <EmptyState icon={Receipt} title="Tidak ada tagihan" desc="Keuangan Guild sedang aman dan tenang." />
            ) : (
                <div className="space-y-4">
                    {p.withdrawals.map((wd) => (
                        <PayoutRow key={wd.id} wd={wd} p={p} />
                    ))}
                </div>
            )}

            <Toast isVisible={p.toast.show} onClose={() => p.setToast({ ...p.toast, show: false })} message={p.toast.msg} type={p.toast.type} />
        </div>
    );
}

type PayoutData = ReturnType<typeof useGMPayouts>;

function PayoutRow({ wd, p }: { wd: Withdrawal; p: PayoutData }) {
    const status = STATUS_UI[wd.status] ?? { soft: 'bg-surface-2', color: 'var(--color-ink-soft)', icon: FileText, text: wd.status };
    const isPending = wd.status === 'pending';

    return (
        <GlassCard className="p-5 md:p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
                <div>
                    <span className={`${status.soft} inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider mb-2`} style={{ color: status.color }}>
                        <status.icon className="w-3.5 h-3.5" /> {status.text}
                    </span>
                    <h3 className="text-2xl font-black text-ink mb-0.5">Rp {wd.amount.toLocaleString('id-ID')}</h3>
                    <p className="text-sm text-ink-soft">Pemohon: <span className="font-bold text-ink">{wd.heroName}</span></p>
                </div>
                <p className="text-[10px] font-bold text-ink-muted whitespace-nowrap bg-surface-2 px-3 py-2 rounded-xl">
                    {new Date(wd.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
            </div>

            {isPending && wd.note && (
                <div className="bg-danger-soft p-3.5 rounded-xl mb-4 flex gap-3 items-start">
                    <AlertCircle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
                    <div>
                        <p className="text-[10px] font-black text-danger uppercase tracking-widest mb-1">Penolakan dari Hero</p>
                        <p className="text-sm font-bold text-ink">&ldquo;{wd.note}&rdquo;</p>
                    </div>
                </div>
            )}

            {wd.proofUrl && wd.status !== 'pending' && (
                <a href={wd.proofUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-xs font-bold text-brand bg-brand-soft px-4 py-2.5 rounded-xl hover:brightness-95 transition mb-2">
                    <ExternalLink className="w-4 h-4" /> Buka Bukti Transfer
                </a>
            )}

            {isPending && (
                <div className="pt-4 border-t border-line mt-2">
                    {p.uploadingId === wd.id ? (
                        <div className="bg-brand-soft p-4 rounded-xl">
                            <p className="text-[10px] font-black text-brand uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                <UploadCloud className="w-3.5 h-3.5" /> Bukti Transfer
                            </p>
                            {!p.selectedFile ? (
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-line rounded-xl cursor-pointer bg-surface hover:bg-surface-2 transition-colors mb-4">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-ink-soft">
                                        <UploadCloud className="w-8 h-8 mb-2 text-brand" />
                                        <p className="mb-1 text-sm font-bold">Pilih gambar bukti</p>
                                        <p className="text-xs opacity-70">PNG, JPG (maks. 5MB)</p>
                                    </div>
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && p.setSelectedFile(e.target.files[0])} />
                                </label>
                            ) : (
                                <div className="flex items-center justify-between p-3 bg-surface border border-line rounded-xl mb-4">
                                    <div className="flex items-center gap-3 overflow-hidden text-ink-soft">
                                        <ImageIcon className="w-5 h-5 shrink-0 text-brand" />
                                        <span className="text-sm font-bold truncate">{p.selectedFile.name}</span>
                                    </div>
                                    <button type="button" onClick={() => p.setSelectedFile(null)} className="text-ink-muted hover:text-danger"><X className="w-4 h-4" /></button>
                                </div>
                            )}
                            <div className="flex justify-end gap-2">
                                <Button size="sm" variant="ghost" onClick={() => { p.setUploadingId(null); p.setSelectedFile(null); }}>Batal</Button>
                                <button onClick={() => p.submitProof(wd.id)} disabled={!p.selectedFile || p.isProcessing} className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand text-white px-4 py-2 text-sm font-bold hover:bg-brand-hover disabled:opacity-60 min-w-[140px]">
                                    {p.isProcessing ? p.uploadProgress || 'Memproses…' : <><Upload className="w-3.5 h-3.5" /> Kirim Bukti</>}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button onClick={() => p.setUploadingId(wd.id)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand text-white px-5 py-3 font-bold text-sm hover:bg-brand-hover transition-colors">
                            <Upload className="w-4 h-4" /> Proses Pembayaran & Upload Bukti
                        </button>
                    )}
                </div>
            )}
        </GlassCard>
    );
}
