'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useGoal } from '@/hooks/useGoal';
import GoalForm from '@/components/ui/GoalForm';

export default function GoalOnboarding() {
    const { profile, loading } = useAuth();
    const { goal, hasGoal, saving, save } = useGoal();

    if (loading || !profile || profile.role !== 'player' || hasGoal) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm">
            <div className="w-full max-w-lg bg-white rounded-card shadow-pop p-6 md:p-8 max-h-[92vh] overflow-y-auto">
                <div className="mb-4">
                    <h2 className="text-xl font-extrabold text-ink">Tetapkan Tujuanmu 🎯</h2>
                    <p className="text-ink-soft text-sm mt-1">Sebelum mulai, ceritakan kamu mau jadi apa — AI Game Master akan menyusun misimu menuju ke sana.</p>
                </div>
                <GoalForm initial={goal} saving={saving} onSave={save} submitLabel="Mulai Petualangan" />
            </div>
        </div>
    );
}
