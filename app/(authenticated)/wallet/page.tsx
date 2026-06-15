'use client';

import React from 'react';
import { Wallet, Banknote, ArrowRightLeft, Send, AlertCircle, FileText, Loader2 } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import PageHeader from '@/components/ui/PageHeader';
import GlassCard from '@/components/ui/GlassCard';
import EmptyState from '@/components/ui/EmptyState';
import SectionLabel from '@/components/ui/SectionLabel';
import Toast from '@/components/ui/Toast';
import { WithdrawalRow } from '@/components/wallet/WithdrawalRow';

function avatarFor(name: string) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=e7f6ef&color=18a06b&bold=true`;
}

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

            <GlassCard className="relative overflow-hidden p-6 md:p-7">
                <Banknote className="absolute -right-4 -top-4 w-28 h-28 text-success/10 rotate-12 pointer-events-none" />
                <p className="text-ink-muted text-[10px] uppercase tracking-widest font-bold mb-1">Total Harta Terkumpul</p>
                <p className="text-4xl md:text-5xl font-black text-success">Rp {w.totalBalance.toLocaleString('id-ID')}</p>
            </GlassCard>

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
