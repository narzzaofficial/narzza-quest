'use client';

import React from 'react';
import { Users, UserPlus, Mail, Loader2 } from 'lucide-react';
import { useNetwork } from '@/hooks/useNetwork';
import PageHeader from '@/components/ui/PageHeader';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import SectionLabel from '@/components/ui/SectionLabel';
import Toast from '@/components/ui/Toast';
import { MemberCard } from '@/components/network/MemberCard';
import { getAvatarUrl } from '@/lib/avatar';

export default function NetworkPage() {
    const {
        profile, loading, isLinking, reject, accept,
        partnerEmail, setPartnerEmail, sendRequest,
        loadingPartners, linkedPartners, toast, setToast,
    } = useNetwork();

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-brand animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
            <PageHeader
                icon={<Users className="w-6 h-6 text-white" />}
                title="Jaringan"
                subtitle="Kelola undangan & lihat siapa yang terhubung dengan akunmu."
            />

            {profile?.pendingPartnerRequest && (
                <GlassCard className="p-5 border border-success/20 bg-success-soft">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4 justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl overflow-hidden ring-2 ring-success/20 bg-surface shrink-0">
                                <img src={getAvatarUrl(profile.pendingPartnerRequest.avatar, profile.pendingPartnerRequest.displayName)} alt="Avatar" className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-ink mb-0.5">Ada Permintaan Baru!</h2>
                                <p className="text-ink-soft text-sm">
                                    <strong className="text-ink">{profile.pendingPartnerRequest.displayName}</strong> ingin terhubung denganmu.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                            <Button variant="outline" onClick={reject} disabled={isLinking} className="flex-1 md:flex-none">Tolak</Button>
                            <button onClick={accept} disabled={isLinking} className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 rounded-xl bg-success text-white px-5 py-2.5 font-bold text-sm hover:brightness-95 disabled:opacity-60">
                                {isLinking ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Terima'}
                            </button>
                        </div>
                    </div>
                </GlassCard>
            )}

            <GlassCard className="p-5 md:p-6">
                <div className="flex flex-col md:flex-row items-center gap-5">
                    <div className="flex-1 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                            <UserPlus className="w-5 h-5 text-brand" />
                            <h2 className="text-lg font-extrabold text-ink">Undang Anggota Baru</h2>
                        </div>
                        <p className="text-ink-soft text-sm">Masukkan email rekanmu untuk mengirim undangan.</p>
                    </div>
                    <form onSubmit={(e) => { e.preventDefault(); sendRequest(); }} className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
                        <div className="relative w-full md:w-72">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
                            <input
                                type="email"
                                placeholder="Masukkan email…"
                                required
                                value={partnerEmail}
                                onChange={(e) => setPartnerEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface border border-line text-ink outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/15 transition font-bold text-sm"
                            />
                        </div>
                        <Button type="submit" variant="primary" isLoading={isLinking} className="shrink-0">Kirim Undangan</Button>
                    </form>
                </div>
            </GlassCard>

            <section className="space-y-3">
                <SectionLabel className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Relasi Aktif</SectionLabel>
                {loadingPartners ? (
                    <div className="text-center py-10 text-ink-muted font-medium">Memuat daftar anggota…</div>
                ) : linkedPartners.length === 0 ? (
                    <EmptyState icon={Users} title="Belum ada anggota di jaringanmu" desc="Aliansi membuat perjalananmu lebih bermakna!" />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {linkedPartners.map((member) => (
                            <MemberCard key={member.uid} member={member} />
                        ))}
                    </div>
                )}
            </section>

            <Toast isVisible={toast.show} onClose={() => setToast({ ...toast, show: false })} message={toast.message} type="success" />
        </div>
    );
}
