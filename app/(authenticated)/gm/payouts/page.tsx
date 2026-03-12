'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { subscribeToGMWithdrawals, submitWithdrawalProof } from '@/lib/db';
import { Withdrawal } from '@/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Toast from '@/components/ui/Toast';
import {
    Banknote, Receipt, CheckCircle2, Clock, FileText,
    Upload, AlertCircle, ExternalLink, MessageSquare
} from 'lucide-react';

export default function GMPayoutsPage() {
    const { profile } = useAuth();
    const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
    const [loading, setLoading] = useState(true);

    // State untuk form upload bukti
    const [uploadingId, setUploadingId] = useState<string | null>(null);
    const [proofUrl, setProofUrl] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const [toast, setToast] = useState({ show: false, msg: '', type: 'success' as 'success' | 'info' | 'error' });

    useEffect(() => {
        if (!profile || profile.role !== 'gm') return;

        const unsubscribe = subscribeToGMWithdrawals(profile.uid, (data) => {
            setWithdrawals(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [profile]);

    const handleSubmitProof = async (id: string) => {
        if (!proofUrl.trim()) {
            alert("Harap masukkan link/URL bukti transfer!");
            return;
        }

        setIsProcessing(true);
        try {
            await submitWithdrawalProof(id, proofUrl);
            setToast({ show: true, msg: "Bukti transfer berhasil dikirim ke Hero!", type: 'success' });
            setUploadingId(null);
            setProofUrl('');
        } catch (error) {
            console.error(error);
            setToast({ show: true, msg: "Gagal mengirim bukti transfer.", type: 'error' });
        } finally {
            setIsProcessing(false);
        }
    };

    const getStatusUI = (status: string) => {
        switch (status) {
            case 'pending': return { color: 'text-rose-600 bg-rose-50 border-rose-200', icon: <AlertCircle className="w-3.5 h-3.5" />, text: 'Butuh Pembayaran' };
            case 'transfer_submitted': return { color: 'text-blue-600 bg-blue-50 border-blue-200', icon: <Clock className="w-3.5 h-3.5" />, text: 'Menunggu Konfirmasi Hero' };
            case 'completed': return { color: 'text-emerald-600 bg-emerald-50 border-emerald-200', icon: <CheckCircle2 className="w-3.5 h-3.5" />, text: 'Pembayaran Selesai' };
            default: return { color: 'text-slate-600 bg-slate-50 border-slate-200', icon: <FileText className="w-3.5 h-3.5" />, text: status };
        }
    };

    if (profile?.role !== 'gm') {
        return <div className="min-h-screen flex items-center justify-center text-slate-500 font-bold">Akses Ditolak. Halaman ini khusus Game Master.</div>;
    }

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center font-bold text-purple-600">Membuka brankas Guild...</div>;
    }

    // Hitung total tagihan yang belum dibayar (pending)
    const pendingTotal = withdrawals
        .filter(w => w.status === 'pending')
        .reduce((acc, curr) => acc + curr.amount, 0);

    return (
        <div
            className="min-h-screen p-4 md:p-6 lg:p-8 relative overflow-hidden text-slate-800"
            style={{
                background: 'linear-gradient(135deg, #F8FAFC 0%, #F3E8FF 100%)',
                fontFamily: 'var(--font-nunito), sans-serif'
            }}
        >
            <div className="max-w-4xl mx-auto relative z-10 pt-4 space-y-8">

                <header className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white/70 backdrop-blur-md p-6 md:p-8 rounded-3xl border border-white shadow-sm">
                    <div>
                        <p className="text-purple-600 font-extrabold text-[10px] tracking-widest uppercase mb-1 flex items-center gap-1.5">
                            <Banknote className="w-3.5 h-3.5" /> Finance & Payroll
                        </p>
                        <h1 className="text-3xl lg:text-4xl font-bold text-purple-950 mb-2" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                            Daftar Tagihan Hero
                        </h1>
                        <p className="text-slate-500 text-sm font-medium">Proses pencairan dana dari quest yang telah diselesaikan.</p>
                    </div>
                    <div className="bg-rose-50 border border-rose-100 px-6 py-4 rounded-2xl text-right w-full md:w-auto">
                        <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest mb-1">Total Harus Dibayar</p>
                        <p className="text-2xl md:text-3xl font-black text-rose-600">Rp {pendingTotal.toLocaleString('id-ID')}</p>
                    </div>
                </header>

                {withdrawals.length === 0 ? (
                    <Card className="text-center py-16 bg-white/50 border-dashed border-purple-200">
                        <Receipt className="w-12 h-12 text-purple-300 mx-auto mb-3" />
                        <p className="text-purple-900 font-bold text-lg">Tidak Ada Tagihan</p>
                        <p className="text-purple-600/70 text-sm mt-1">Keuangan Guild sedang aman dan tenang.</p>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {withdrawals.map((wd) => {
                            const statusUI = getStatusUI(wd.status);
                            const isPending = wd.status === 'pending';

                            return (
                                <Card key={wd.id} className={`p-5 md:p-6 transition-all bg-white border-l-4 ${isPending ? 'border-l-rose-500 shadow-md' : wd.status === 'completed' ? 'border-l-emerald-400 opacity-70' : 'border-l-blue-400'}`}>
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                                        <div>
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-wider mb-3 ${statusUI.color}`}>
                                                {statusUI.icon} {statusUI.text}
                                            </span>
                                            <h3 className="text-2xl font-black text-slate-800 mb-1">Rp {wd.amount.toLocaleString('id-ID')}</h3>
                                            <p className="text-sm text-slate-500 font-medium">Pemohon: <span className="font-bold text-purple-700">{wd.heroName}</span></p>
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-400 whitespace-nowrap bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                                            {new Date(wd.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>

                                    {/* Jika ditolak oleh Hero, tampilkan alasannya */}
                                    {isPending && wd.note && (
                                        <div className="bg-rose-50/80 p-3.5 rounded-xl border border-rose-200 mb-4 flex gap-3 items-start">
                                            <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-1">Penolakan dari Hero</p>
                                                <p className="text-sm font-bold text-rose-900">"{wd.note}"</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Jika bukti sudah diupload tapi belum di-approve Hero */}
                                    {wd.proofUrl && wd.status !== 'pending' && (
                                        <a href={wd.proofUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 px-4 py-2.5 rounded-xl border border-blue-200 hover:bg-blue-100 transition-colors mb-2">
                                            <ExternalLink className="w-4 h-4" /> Buka Bukti Transfer Tersimpan
                                        </a>
                                    )}

                                    {/* Tombol & Form Upload Bukti (Khusus Status Pending) */}
                                    {isPending && (
                                        <div className="pt-4 border-t border-slate-100 mt-2">
                                            {uploadingId === wd.id ? (
                                                <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100 animate-in slide-in-from-top-2">
                                                    <label className="block text-[10px] font-black text-purple-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                                        <ExternalLink className="w-3.5 h-3.5" /> Link Bukti Transfer (Gdrive/Imgur)
                                                    </label>
                                                    <input
                                                        type="url"
                                                        placeholder="https://..."
                                                        value={proofUrl}
                                                        onChange={(e) => setProofUrl(e.target.value)}
                                                        className="w-full text-sm p-3 rounded-xl border border-purple-200 bg-white mb-3 focus:outline-none focus:ring-2 focus:ring-purple-400 font-medium"
                                                    />
                                                    <div className="flex justify-end gap-2">
                                                        <Button size="sm" variant="ghost" onClick={() => setUploadingId(null)} className="text-slate-500">Batal</Button>
                                                        <Button size="sm" variant="primary" className="bg-purple-600 text-white shadow-md flex items-center gap-1.5" onClick={() => handleSubmitProof(wd.id)} isLoading={isProcessing}>
                                                            <Upload className="w-3.5 h-3.5" /> Kirim Bukti
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <Button variant="primary" onClick={() => setUploadingId(wd.id)} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white shadow-md">
                                                    <Upload className="w-4 h-4" /> Proses Pembayaran & Upload Bukti
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
            <Toast isVisible={toast.show} onClose={() => setToast({ ...toast, show: false })} message={toast.msg} type={toast.type as any} />
        </div>
    );
}