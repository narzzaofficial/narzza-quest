'use client';

import React from 'react';
import { Target } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useGoal } from '@/hooks/useGoal';
import GoalForm from '@/components/ui/GoalForm';

/**
 * First-run gate: players who haven't set a North Star goal get a blocking
 * modal asking for it. The goal becomes the AI's primary reference.
 */
export default function GoalOnboarding() {
    const { profile, loading } = useAuth();
    const { goal, hasGoal, saving, save } = useGoal();

    if (loading || !profile || profile.role !== 'player' || hasGoal) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm">
            <div className="w-full max-w-lg glass rounded-card shadow-pop p-6 md:p-8 max-h-[92vh] overflow-y-auto">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-card" style={{ backgroundImage: 'linear-gradient(135deg, #4f7cff 0%, #38bdf8 100%)' }}>
                        <Target className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-extrabold text-ink">Tetapkan Tujuanmu 🎯</h2>
                        <p className="text-ink-soft text-sm">Sebelum mulai, ceritakan kamu mau jadi apa — AI Game Master akan menyusun misimu menuju ke sana.</p>
                    </div>
                </div>
                <GoalForm initial={goal} saving={saving} onSave={save} submitLabel="Mulai Petualangan" />
            </div>
        </div>
    );
}
