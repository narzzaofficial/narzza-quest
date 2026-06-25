'use client';

import React from 'react';
import { Swords, Loader2 } from 'lucide-react';
import { useGuildQuest } from '@/hooks/useGuildQuest';
import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/ui/EmptyState';
import Toast from '@/components/ui/Toast';
import { GuildQuestCard } from '@/components/guild-quest/GuildQuestCard';

export default function GuildQuestPage() {
    const { profile, loading, quests, claimingId, claim, toast, setToast } = useGuildQuest();

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-brand animate-spin" />
            </div>
        );
    }

    const noGm = !profile?.partnerIds || profile.partnerIds.length === 0;

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
            <PageHeader
                grad="sky"
                icon={<Swords className="w-6 h-6 text-white" />}
                title="Guild Quest"
                subtitle="Quest terbuka dari GM-mu — ambil sebelum slot habis!"
                badge="Public"
            />

            {noGm ? (
                <EmptyState icon={Swords} title="Belum terhubung dengan GM" desc="Hubungi GM untuk terhubung dan akses Guild Quest." />
            ) : quests.length === 0 ? (
                <EmptyState icon={Swords} title="Belum ada Guild Quest" desc="GM belum membuka guild quest saat ini. Pantau terus!" />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {quests.map((gq) => (
                        <GuildQuestCard key={gq.id} gq={gq} uid={profile?.uid || ''} claimingId={claimingId} onClaim={claim} />
                    ))}
                </div>
            )}

            <Toast isVisible={toast.show} onClose={() => setToast((t) => ({ ...t, show: false }))} message={toast.msg} type={toast.type} />
        </div>
    );
}
