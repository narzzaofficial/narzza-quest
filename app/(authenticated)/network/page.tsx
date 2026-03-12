'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
    sendPartnerRequest,
    acceptPartnerRequest,
    rejectPartnerRequest,
    getLinkedProfiles
} from '@/lib/db';
import { UserProfile } from '@/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Toast from '@/components/ui/Toast';
import {
    Users,
    UserPlus,
    Mail,
    Check,
    X,
    UserCircle2,
    ShieldAlert,
    Crown
} from 'lucide-react';

export default function NetworkPage() {
    const { profile, loading, refreshProfile } = useAuth();

    const [partnerEmail, setPartnerEmail] = useState('');
    const [linkedPartners, setLinkedPartners] = useState<UserProfile[]>([]);

    const [isLinking, setIsLinking] = useState(false);
    const [loadingPartners, setLoadingPartners] = useState(true);

    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    // 1. Tarik Data Relasi (Anggota Guild)
    useEffect(() => {
        if (profile?.partnerIds && profile.partnerIds.length > 0) {
            getLinkedProfiles(profile.partnerIds).then(partners => {
                setLinkedPartners(partners);
                setLoadingPartners(false);
            });
        } else {
            setLoadingPartners(false);
        }
    }, [profile]);

    // 2. Fungsi Kirim Undangan
    const handleSendRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile || !partnerEmail.trim()) return;

        if (partnerEmail === profile.email) {
            alert('Tidak bisa mengirim request ke diri sendiri!');
            return;
        }

        setIsLinking(true);
        try {
            const successId = await sendPartnerRequest(profile.uid, partnerEmail);
            if (successId) {
                setToastMessage('Undangan berhasil dikirim! Menunggu konfirmasi.');
                setShowToast(true);
                setPartnerEmail('');
            } else {
                alert('Email tidak ditemukan di sistem. Pastikan dia sudah mendaftar.');
            }
        } catch (error) {
            console.error("Gagal mengirim request:", error);
            alert('Terjadi kesalahan. Coba lagi nanti.');
        } finally {
            setIsLinking(false);
        }
    };

    // 3. Fungsi Terima/Tolak Undangan
    const handleAccept = async () => {
        if (!profile?.pendingPartnerRequest) return;
        setIsLinking(true);
        try {
            await acceptPartnerRequest(profile.uid, profile.pendingPartnerRequest.uid);
            setToastMessage('🎉 Berhasil terhubung dengan anggota baru!');
            setShowToast(true);
            await refreshProfile();
        } catch (error) {
            console.error("Gagal menerima:", error);
        } finally {
            setIsLinking(false);
        }
    };

    const handleReject = async () => {
        if (!profile?.pendingPartnerRequest) return;
        setIsLinking(true);
        try {
            await rejectPartnerRequest(profile.uid);
            await refreshProfile();
        } catch (error) {
            console.error("Gagal menolak:", error);
        } finally {
            setIsLinking(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center font-bold text-purple-600">Memuat data jaringan...</div>;
    }

    return (
        <div
            className="min-h-screen p-4 md:p-8 relative overflow-hidden text-slate-800"
            style={{
                background: 'linear-gradient(135deg, #F8FAFC 0%, #F3E8FF 100%)',
                fontFamily: 'var(--font-nunito), sans-serif'
            }}
        >
            <div className="max-w-6xl mx-auto space-y-8 relative z-10 pt-4">

                <header className="mb-8">
                    <p className="text-purple-600 text-sm tracking-widest uppercase mb-1 font-bold">Koneksi Sosial</p>
                    <h1 className="text-3xl md:text-4xl font-bold text-purple-950 flex items-center gap-3" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                        <Users className="w-8 h-8 text-purple-500" /> Jaringan Guild
                    </h1>
                    <p className="text-slate-500 font-medium mt-2 text-sm md:text-base">
                        Kelola undangan dan lihat siapa saja yang terhubung dengan akunmu.
                    </p>
                </header>

                {/* ─── 1. KOTAK PERMINTAAN MASUK (Jika Ada) ─── */}
                {profile?.pendingPartnerRequest && (
                    <Card className="border-emerald-200 bg-emerald-50 shadow-sm relative overflow-hidden">
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 border border-emerald-200">
                                    <ShieldAlert className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-emerald-900 mb-1">Ada Permintaan Baru!</h2>
                                    <p className="text-emerald-700 text-sm font-medium">
                                        <strong className="text-emerald-900">{profile.pendingPartnerRequest.displayName}</strong> ({profile.pendingPartnerRequest.email}) ingin terhubung denganmu.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0">
                                <Button variant="outline" onClick={handleReject} disabled={isLinking} className="flex-1 md:flex-none border-emerald-300 text-emerald-700 hover:bg-emerald-100 px-4">
                                    Tolak
                                </Button>
                                <Button variant="primary" onClick={handleAccept} isLoading={isLinking} className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-700 px-6">
                                    Terima
                                </Button>
                            </div>
                        </div>
                    </Card>
                )}

                {/* ─── 2. FORM UNDANG ANGGOTA ─── */}
                <Card className="bg-white shadow-[0_10px_30px_rgba(168,85,247,0.06)] border-purple-100">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="flex-1 text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                                <UserPlus className="w-5 h-5 text-purple-600" />
                                <h2 className="text-xl font-bold text-purple-900" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                                    Undang Anggota Baru!
                                </h2>
                            </div>
                            <p className="text-slate-500 font-medium text-sm">
                                Kirim permintaan ke email Hero atau GM lain untuk bergabung ke jaringanmu.
                            </p>
                        </div>

                        <form onSubmit={handleSendRequest} className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
                            <div className="relative w-full md:w-72">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="email"
                                    placeholder="Masukkan Email..."
                                    required
                                    value={partnerEmail}
                                    onChange={(e) => setPartnerEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white transition-all font-medium text-sm placeholder:text-slate-400"
                                />
                            </div>
                            <Button type="submit" variant="primary" isLoading={isLinking} className="shrink-0 bg-purple-600 hover:bg-purple-700 py-3 shadow-sm">
                                Kirim Undangan
                            </Button>
                        </form>
                    </div>
                </Card>

                {/* ─── 3. DAFTAR RELASI / ANGGOTA ─── */}
                <div>
                    <h2 className="text-xl font-bold text-purple-900 mb-4 flex items-center gap-2" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                        <Users className="w-5 h-5" /> Daftar Relasi Aktif
                    </h2>

                    {loadingPartners ? (
                        <div className="text-center py-10 text-purple-400 font-medium">Memuat daftar anggota...</div>
                    ) : linkedPartners.length === 0 ? (
                        <div className="text-center py-12 bg-white/50 border border-slate-200 rounded-2xl border-dashed">
                            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500 font-bold">Belum ada anggota di jaringanmu.</p>
                            <p className="text-slate-400 text-sm mt-1">Gunakan form di atas untuk mulai mengundang!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {linkedPartners.map((member) => (
                                <div key={member.uid} className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-purple-200 transition-colors">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${member.role === 'gm' ? 'bg-amber-50 text-amber-500 border-amber-200' : 'bg-purple-50 text-purple-500 border-purple-200'
                                        }`}>
                                        {member.role === 'gm' ? <Crown className="w-6 h-6" /> : <UserCircle2 className="w-6 h-6" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-slate-800 truncate">{member.displayName}</h3>
                                        <p className="text-xs text-slate-500 truncate">{member.email}</p>
                                    </div>
                                    <div>
                                        <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2 py-1 rounded-md ${member.role === 'gm' ? 'bg-amber-100 text-amber-700' : 'bg-purple-100 text-purple-700'
                                            }`}>
                                            {member.role === 'gm' ? 'GM' : 'Hero'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
            <Toast isVisible={showToast} onClose={() => setShowToast(false)} message={toastMessage} type="success" />
        </div>
    );
}