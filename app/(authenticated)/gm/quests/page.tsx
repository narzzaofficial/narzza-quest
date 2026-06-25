'use client';

import React from 'react';
import Link from 'next/link';
import { ListTodo, Plus, Zap, Loader2 } from 'lucide-react';
import { useGMQuests } from '@/hooks/useGMQuests';
import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/ui/EmptyState';
import Toast from '@/components/ui/Toast';
import { GMQuestCard } from '@/components/gm/GMQuestCard';

export default function GMQuestListPage() {
    const { quests, loading, toast, setToast, remove } = useGMQuests();

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
                icon={<ListTodo className="w-6 h-6 text-white" />}
                title="Manage Quests"
                subtitle="Kelola semua quest yang kamu buat untuk hero."
                badge="GM Panel"
                actions={
                    <>
                        <Link href="/gm/quests/new" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white text-brand px-4 py-2.5 font-bold text-sm shadow-card hover:bg-white/90 transition">
                            <Plus className="w-4 h-4" /> Quest Baru
                        </Link>
                        <Link href="/gm/quests/new/json" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/15 ring-1 ring-white/25 text-white px-4 py-2.5 font-bold text-sm hover:bg-white/25 transition">
                            <Zap className="w-4 h-4" /> JSON Batch
                        </Link>
                    </>
                }
            />

            {quests.length === 0 ? (
                <EmptyState icon={ListTodo} title="Belum ada quest" desc='Klik "Quest Baru" untuk mulai membuat misi.' />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {quests.map((q) => (
                        <GMQuestCard key={q.id} quest={q} onDelete={() => remove(q.id)} />
                    ))}
                </div>
            )}

            <Toast isVisible={toast.show} onClose={() => setToast({ ...toast, show: false })} message={toast.message} type="success" />
        </div>
    );
}
