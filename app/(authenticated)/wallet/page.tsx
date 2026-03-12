'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getLinkedProfiles, sendNotification } from '@/lib/db';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserProfile } from '@/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Toast from '@/components/ui/Toast';
import { Wallet, Banknote, ArrowRightLeft, Send, Sparkles, AlertCircle } from 'lucide-react';

export default function WalletPage() {
    const { profile } = useAuth();
    const [gmProfiles, setGmProfiles] = useState<Record<string, UserProfile>>({});
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [toast, setToast] = useState({ show: false, msg: '', type: 'success' as 'success' | 'info' });

    // Menyimpan state lokal agar saldo langsung nol saat ditarik (tanpa perlu refresh)
    const [localBalances, setLocalBalances] = useState<Record<string, number>>({});

    useEffect(() => {
        if (profile?.balances) {
            setLocalBalances(profile.balances);

            // Ambil UID GM yang pernah memberi uang (meski saldonya 0, tetap kita ambil datanya)
            const gmUids = Object.keys(profile.balances);
            if (gmUids.length > 0) {
                getLinkedProfiles(gmUids).then(profiles => {
                    const map: Record<string, UserProfile> = {};
                    profiles.forEach(p => { map[p.uid] = p; });
                    setGmProfiles(map);
                    setLoading(false);
                });
            } else {
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    }, [profile]);

    // Hitung Total Semua Saldo
    const totalBalance = Object.values(localBalances).reduce((acc, curr) => acc + (curr || 0), 0);

    const handleWithdraw = async (gmUid: string, amount: number) => {
        if (!profile || amount <= 0) return;

        const gmName = gmProfiles[gmUid]?.displayName || 'Game Master';
        const confirmWithdraw = window.confirm(`Kirim tagihan pencairan sebesar Rp ${amount.toLocaleString('id-ID')} ke ${gmName}?\n\nPastikan kamu menginformasikan nomor rekening/e-wallet-mu secara pribadi.`);

        if (!confirmWithdraw) return;

        setProcessingId(gmUid);
        try {
            // 1. Potong saldo jadi 0 di database
            const userRef = doc(db, 'users', profile.uid);
            await updateDoc(userRef, {
                [`balances.${gmUid}`]: 0
            });

            // 2. Kirim Notifikasi ke GM (Bisa pakai type 'reminder' yang sudah ada di types)
            await sendNotification({
                toUid: gmUid,
                fromUid: profile.uid,
                fromName: profile.displayName,
                type: 'reminder',
                title: '💸 Permintaan Pencairan Dana',
                message: `${profile.displayName} mengajukan penarikan Bounty sebesar Rp ${amount.toLocaleString('id-ID')}. Mohon segera proses transfer ke rekeningnya.`
            });

            // 3. Update UI lokal
            setLocalBalances(prev => ({ ...prev, [gmUid]: 0 }));
            setToast({ show: true, msg: `Tagihan berhasil dikirim ke ${gmName}!`, type: 'success' });

        } catch (err) {
            console.error(err);
            alert("Gagal memproses penarikan. Coba lagi nanti.");
        } finally {
            setProcessingId(null);
        }
    };

    // Halaman ini khusus untuk Player/Hero
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
            {/* Dekorasi Background */}
            <div className="absolute top-[-10%] right-[-5%] w-[40rem] h-[40rem] bg-emerald-400/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-5%] w-[30rem] h-[30rem] bg-teal-400/20 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-4xl mx-auto relative z-10 pt-4">

                <header className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-[0_10px_30px_rgba(16,185,129,0.3)] mb-6 border-4 border-white transform hover:rotate-6 transition-transform duration-300">
                        <Wallet className="w-10 h-10 text-white" />
                    </div>
                    <p className="text-emerald-700 text-xs tracking-[0.3em] uppercase mb-2 font-extrabold flex items-center justify-center gap-2">
                        <Sparkles className="w-4 h-4" /> The Guild Treasury
                    </p>
                    <h1 className="text-4xl md:text-5xl font-black text-emerald-950 mb-4" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                        Dompet Quest
                    </h1>

                    {/* Kartu Total Saldo */}
                    <div className="inline-block bg-white p-6 md:p-8 rounded-3xl shadow-[0_15px_40px_rgba(16,185,129,0.15)] border-2 border-emerald-100 relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 text-emerald-100 opacity-50 rotate-12">
                            <Banknote className="w-32 h-32" />
                        </div>
                        <p className="text-sm font-extrabold text-slate-400 uppercase tracking-widest mb-1 relative z-10">Total Harta Terkumpul</p>
                        <p className="text-4xl md:text-5xl font-black text-emerald-600 relative z-10" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                            Rp {totalBalance.toLocaleString('id-ID')}
                        </p>
                    </div>
                </header>

                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-emerald-900 mb-4 flex items-center gap-2" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                        <ArrowRightLeft className="w-5 h-5 text-emerald-500" /> Saldo Per Sponsor (GM)
                    </h2>

                    {Object.keys(localBalances).length === 0 ? (
                        <Card className="text-center py-16 bg-white/50 backdrop-blur-sm border-dashed border-emerald-200">
                            <AlertCircle className="w-12 h-12 text-emerald-300 mx-auto mb-3" />
                            <p className="text-emerald-900 font-bold text-lg">Belum Ada Pemasukan</p>
                            <p className="text-emerald-700/70 text-sm max-w-sm mx-auto mt-1">Selesaikan quest yang memiliki Bounty (uang) untuk mulai mengumpulkan harta di sini.</p>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(localBalances).map(([gmUid, amount]) => {
                                const gm = gmProfiles[gmUid];
                                const isZero = amount === 0;

                                return (
                                    <Card key={gmUid} className={`p-5 md:p-6 transition-all duration-300 border-2 ${isZero ? 'bg-white/60 border-slate-100 opacity-70' : 'bg-white border-emerald-100 shadow-md hover:-translate-y-1'}`}>
                                        <div className="flex items-center gap-4 mb-5">
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

                                        <div className="bg-slate-50 p-4 rounded-2xl mb-5 border border-slate-100">
                                            <p className="text-xs font-bold text-slate-500 mb-1">Saldo Tersedia</p>
                                            <p className={`text-2xl font-black ${isZero ? 'text-slate-400' : 'text-emerald-600'}`}>
                                                Rp {amount.toLocaleString('id-ID')}
                                            </p>
                                        </div>

                                        <Button
                                            variant={isZero ? "outline" : "primary"}
                                            onClick={() => handleWithdraw(gmUid, amount)}
                                            disabled={isZero || processingId === gmUid}
                                            className={`w-full py-3.5 flex items-center justify-center gap-2 ${!isZero ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-none shadow-lg shadow-emerald-500/30' : 'text-slate-400 border-slate-200'}`}
                                        >
                                            {processingId === gmUid ? (
                                                <span className="animate-pulse">Memproses...</span>
                                            ) : isZero ? (
                                                'Saldo Kosong'
                                            ) : (
                                                <><Send className="w-4 h-4" /> Tarik Tunai</>
                                            )}
                                        </Button>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            <Toast isVisible={toast.show} onClose={() => setToast({ ...toast, show: false })} message={toast.msg} type={toast.type} />
        </div>
    );
}