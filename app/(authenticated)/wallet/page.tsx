'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
    getLinkedProfiles,
    createWithdrawalRequest,
    subscribeToHeroWithdrawals,
    resolveWithdrawal
} from '@/lib/db';
import { UserProfile, Withdrawal } from '@/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Toast from '@/components/ui/Toast';
import {
    Wallet, Banknote, ArrowRightLeft, Send, Sparkles,
    AlertCircle, Clock, CheckCircle2, FileText, ExternalLink, XCircle
} from 'lucide-react';

export default function WalletPage() {
    const { profile } = useAuth();
    const [gmProfiles, setGmProfiles] = useState<Record<string, UserProfile>>({});
    const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [toast, setToast] = useState({ show: false, msg: '', type: 'success' as 'success' | 'info' | 'error' });

    // State untuk pop-up penolakan
    const [rejectingId, setRejectingId] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState('');

    // Menyimpan state lokal agar saldo langsung nol saat ditarik (optimistic UI update)
    const [localBalances, setLocalBalances] = useState<Record<string, number>>({});

    useEffect(() => {
        if (!profile) return;

        // Fetch Saldo dan Profil GM
        if (profile.balances) {
            setLocalBalances(profile.balances);
            const gmUids = Object.keys(profile.balances);

            if (gmUids.length > 0) {
                getLinkedProfiles(gmUids).then(profiles => {
                    const map: Record<string, UserProfile> = {};
                    profiles.forEach(p => { map[p.uid] = p; });
                    setGmProfiles(map);
                });
            }
        }

        // Subscribe Realtime ke Riwayat Penarikan
        const unsubscribe = subscribeToHeroWithdrawals(profile.uid, (data) => {
            setWithdrawals(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [profile]);

    const totalBalance = Object.values(localBalances).reduce((acc, curr) => acc + (curr || 0), 0);

    // 1. Fungsi Minta Tarik Dana
    const handleWithdraw = async (gmUid: string, amount: number) => {
        if (!profile || amount <= 0) return;

        const gmName = gmProfiles[gmUid]?.displayName || 'Game Master';
        const confirmWithdraw = window.confirm(`Kirim tagihan pencairan sebesar Rp ${amount.toLocaleString('id-ID')} ke ${gmName}?\n\nPastikan kamu sudah memberikan nomor rekening/e-wallet-mu ke GM.`);

        if (!confirmWithdraw) return;

        setProcessingId(gmUid);
        try {
            await createWithdrawalRequest(profile, gmUid, amount);
            setLocalBalances(prev => ({ ...prev, [gmUid]: 0 })); // Update UI Langsung
            setToast({ show: true, msg: `Tagihan berhasil dikirim ke ${gmName}!`, type: 'success' });
        } catch (err) {
            console.error(err);
            setToast({ show: true, msg: "Gagal memproses penarikan.", type: 'error' });
        } finally {
            setProcessingId(null);
        }
    };

    // 2. Fungsi Konfirmasi Dana Masuk
    const handleResolve = async (id: string, action: 'approve' | 'reject') => {
        if (action === 'reject' && !rejectReason.trim()) {
            alert("Tuliskan alasan penolakan terlebih dahulu!");
            return;
        }

        setProcessingId(id);
        try {
            // Cari withdrawal untuk kirim notifPayload ke GM
            const wd = withdrawals.find(w => w.id === id);
            await resolveWithdrawal(id, action, rejectReason, wd && profile ? {
                heroUid: profile.uid,
                heroName: profile.displayName,
                gmUid: wd.gmUid,
                amount: wd.amount
            } : undefined);
            setToast({
                show: true,
                msg: action === 'approve' ? "Dana berhasil dikonfirmasi!" : "Bukti transfer ditolak.",
                type: 'success'
            });
            setRejectingId(null);
            setRejectReason('');
        } catch (error) {
            console.error(error);
            setToast({ show: true, msg: "Terjadi kesalahan sistem.", type: 'error' });
        } finally {
            setProcessingId(null);
        }
    };

    // Helper Status Tagihan
    const getStatusUI = (status: string) => {
        switch (status) {
            case 'pending': return { color: 'text-amber-600 bg-amber-50 border-amber-200', icon: <Clock className="w-3.5 h-3.5" />, text: 'Menunggu Transfer GM' };
            case 'transfer_submitted': return { color: 'text-blue-600 bg-blue-50 border-blue-200', icon: <FileText className="w-3.5 h-3.5" />, text: 'Menunggu Konfirmasi Hero' };
            case 'completed': return { color: 'text-emerald-600 bg-emerald-50 border-emerald-200', icon: <CheckCircle2 className="w-3.5 h-3.5" />, text: 'Berhasil Dicairkan' };
            default: return { color: 'text-slate-600 bg-slate-50 border-slate-200', icon: <AlertCircle className="w-3.5 h-3.5" />, text: status };
        }
    };

    if (profile?.role === 'gm') {
        return <div className="min-h-screen flex items-center justify-center text-slate-500 font-bold">Halaman ini khusus untuk Hero.</div>;
    }

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center font-bold text-emerald-600">Menghitung pundi-pundi emas...</div>;
    }

    return (
        <div
            className="min-h-screen p-4 md:p-6 lg:p-8 relative overflow-hidden text-slate-800"
            style={{
                background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 50%, #A7F3D0 100%)',
                fontFamily: 'var(--font-nunito), sans-serif'
            }}
        >
            <div className="absolute top-[-10%] right-[-5%] w-[40rem] h-[40rem] bg-emerald-400/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-5%] w-[30rem] h-[30rem] bg-teal-400/20 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-4xl mx-auto relative z-10 pt-4 space-y-12">

                {/* ─── HEADER & DOMPET UTAMA ─── */}
                <header className="text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-[0_10px_30px_rgba(16,185,129,0.3)] mb-6 border-4 border-white transform hover:rotate-6 transition-transform duration-300">
                        <Wallet className="w-10 h-10 text-white" />
                    </div>
                    <p className="text-emerald-700 text-[10px] md:text-xs tracking-[0.3em] uppercase mb-2 font-extrabold flex items-center justify-center gap-2">
                        <Sparkles className="w-4 h-4" /> The Guild Treasury
                    </p>
                    <h1 className="text-4xl md:text-5xl font-black text-emerald-950 mb-4" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                        Dompet Quest
                    </h1>

                    <div className="inline-block bg-white p-6 md:p-8 rounded-3xl shadow-md border-2 border-emerald-100 relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 text-emerald-100 opacity-50 rotate-12">
                            <Banknote className="w-32 h-32" />
                        </div>
                        <p className="text-sm font-extrabold text-slate-400 uppercase tracking-widest mb-1 relative z-10">Total Harta Terkumpul</p>
                        <p className="text-4xl md:text-5xl font-black text-emerald-600 relative z-10" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                            Rp {totalBalance.toLocaleString('id-ID')}
                        </p>
                    </div>
                </header>

                {/* ─── BAGIAN 1: SALDO AKTIF ─── */}
                <div>
                    <h2 className="text-xl font-bold text-emerald-900 mb-4 flex items-center gap-2" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                        <ArrowRightLeft className="w-5 h-5 text-emerald-500" /> Saldo Per Sponsor (GM)
                    </h2>

                    {Object.keys(localBalances).length === 0 ? (
                        <Card className="text-center py-10 bg-white/50 backdrop-blur-sm border-dashed border-emerald-200">
                            <AlertCircle className="w-10 h-10 text-emerald-300 mx-auto mb-2" />
                            <p className="text-emerald-900 font-bold">Belum Ada Pemasukan</p>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(localBalances).map(([gmUid, amount]) => {
                                const gm = gmProfiles[gmUid];
                                const isZero = amount === 0;

                                return (
                                    <Card key={gmUid} className={`p-5 transition-all duration-300 border-2 ${isZero ? 'bg-white/60 border-slate-100 opacity-70' : 'bg-white border-emerald-100 shadow-md hover:-translate-y-1'}`}>
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-12 h-12 rounded-full border-2 border-emerald-200 overflow-hidden bg-slate-50 flex-shrink-0">
                                                <img
                                                    src={gm?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(gm?.displayName || 'GM')}&background=d1fae5&color=047857&bold=true`}
                                                    alt="GM Avatar"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sponsor Quest</p>
                                                <h3 className="text-lg font-bold text-slate-800 leading-tight">{gm?.displayName || 'Game Master'}</h3>
                                            </div>
                                        </div>

                                        <div className="bg-slate-50 p-4 rounded-2xl mb-4 border border-slate-100">
                                            <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Saldo Tersedia</p>
                                            <p className={`text-2xl font-black ${isZero ? 'text-slate-400' : 'text-emerald-600'}`}>
                                                Rp {amount.toLocaleString('id-ID')}
                                            </p>
                                        </div>

                                        <Button
                                            variant={isZero ? "outline" : "primary"}
                                            onClick={() => handleWithdraw(gmUid, amount)}
                                            disabled={isZero || processingId === gmUid}
                                            className={`w-full py-3.5 flex items-center justify-center gap-2 ${!isZero ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-none shadow-lg' : 'text-slate-400 border-slate-200'}`}
                                        >
                                            {processingId === gmUid ? <span className="animate-pulse">Memproses...</span> : isZero ? 'Saldo Kosong' : <><Send className="w-4 h-4" /> Ajukan Pencairan</>}
                                        </Button>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* ─── BAGIAN 2: RIWAYAT & KONFIRMASI TAGIHAN ─── */}
                <div>
                    <h2 className="text-xl font-bold text-emerald-900 mb-4 flex items-center gap-2" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                        <FileText className="w-5 h-5 text-emerald-500" /> Riwayat Pencairan
                    </h2>

                    {withdrawals.length === 0 ? (
                        <Card className="text-center py-10 bg-white/50 border-dashed border-emerald-200">
                            <p className="text-slate-400 font-bold text-sm">Belum ada riwayat tagihan.</p>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {withdrawals.map((wd) => {
                                const statusUI = getStatusUI(wd.status);
                                const isActionable = wd.status === 'transfer_submitted'; // Hanya bisa diklik kalau statusnya butuh konfirmasi hero
                                const gmName = gmProfiles[wd.gmUid]?.displayName || 'GM';

                                return (
                                    <Card key={wd.id} className={`p-5 border-l-4 ${isActionable ? 'border-l-blue-400 shadow-md' : wd.status === 'completed' ? 'border-l-emerald-400 opacity-80' : 'border-l-amber-400'} bg-white transition-all`}>
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-3">
                                            <div>
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-wider mb-2 ${statusUI.color}`}>
                                                    {statusUI.icon} {statusUI.text}
                                                </span>
                                                <h3 className="text-xl font-black text-slate-800">Rp {wd.amount.toLocaleString('id-ID')}</h3>
                                                <p className="text-xs text-slate-500 font-medium">Tagihan ke: <span className="font-bold text-slate-700">{gmName}</span></p>
                                            </div>
                                            <p className="text-[10px] font-bold text-slate-400 whitespace-nowrap bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                                {new Date(wd.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>

                                        {/* Kalo ada bukti transfer */}
                                        {wd.proofUrl && (
                                            <a href={wd.proofUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors mb-3">
                                                <ExternalLink className="w-3.5 h-3.5" /> Lihat Bukti Transfer dari GM
                                            </a>
                                        )}

                                        {/* Kalo ada note/alasan penolakan */}
                                        {wd.note && (
                                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mb-3">
                                                <p className="text-xs font-bold text-slate-500 uppercase mb-0.5">Catatan:</p>
                                                <p className="text-sm font-medium text-slate-700 italic">"{wd.note}"</p>
                                            </div>
                                        )}

                                        {/* Tombol Konfirmasi (Hanya Muncul Jika Status "transfer_submitted") */}
                                        {isActionable && (
                                            <div className="pt-3 border-t border-slate-100 mt-2">
                                                {rejectingId === wd.id ? (
                                                    <div className="bg-rose-50 p-3 rounded-xl border border-rose-100 animate-in slide-in-from-top-2">
                                                        <input
                                                            type="text"
                                                            placeholder="Kenapa ditolak? (misal: Uang belum masuk)"
                                                            value={rejectReason}
                                                            onChange={(e) => setRejectReason(e.target.value)}
                                                            className="w-full text-sm p-2.5 rounded-lg border border-rose-200 mb-2 focus:outline-none focus:ring-2 focus:ring-rose-400"
                                                        />
                                                        <div className="flex justify-end gap-2">
                                                            <Button size="sm" variant="ghost" onClick={() => setRejectingId(null)}>Batal</Button>
                                                            <Button size="sm" variant="primary" className="bg-rose-500 text-white border-none" onClick={() => handleResolve(wd.id, 'reject')} isLoading={processingId === wd.id}>Tolak Bukti</Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="primary"
                                                            onClick={() => handleResolve(wd.id, 'approve')}
                                                            disabled={processingId !== null}
                                                            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white border-none"
                                                        >
                                                            <CheckCircle2 className="w-4 h-4 mr-1.5" /> Dana Sudah Masuk
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => setRejectingId(wd.id)}
                                                            disabled={processingId !== null}
                                                            className="flex-1 text-rose-500 border-rose-200 hover:bg-rose-50"
                                                        >
                                                            <XCircle className="w-4 h-4 mr-1.5" /> Tolak
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Supaya Toast bisa muncul sempurna */}
            <Toast isVisible={toast.show} onClose={() => setToast({ ...toast, show: false })} message={toast.msg} type={toast.type as any} />
        </div>
    );
}