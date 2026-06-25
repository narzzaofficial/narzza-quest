'use client';

import { useState } from 'react';
import { updateQuestReflection } from '@/lib/db';
import type { Quest } from '@/types';

/** Editable journal reflection note + AI re-review for a single completed quest. */
export function useJournalReflection(quest: Quest, playerLevel?: number) {
    const [isEditing, setIsEditing] = useState(false);
    const [note, setNote] = useState(quest.submissionNote || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentQuest, setCurrentQuest] = useState<Quest>(quest);

    const cancelEdit = () => {
        setIsEditing(false);
        setNote(currentQuest.submissionNote || '');
    };

    const save = async (): Promise<void> => {
        if (!note.trim()) {
            setIsEditing(false);
            return;
        }
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/ai/review-quest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: currentQuest.title,
                    description: currentQuest.description,
                    difficulty: currentQuest.difficulty,
                    expReward: currentQuest.expReward,
                    submissionNote: note,
                    hasProof: !!currentQuest.submissionUrls?.length,
                    playerLevel,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || 'Gagal mereview');

            const aiReview = data.feedback || 'Kerja bagus!';
            await updateQuestReflection(currentQuest.id, note, aiReview);

            setCurrentQuest(prev => ({
                ...prev,
                submissionNote: note,
                reviewNote: aiReview,
            }));
            setIsEditing(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    return { currentQuest, isEditing, setIsEditing, note, setNote, isSubmitting, save, cancelEdit };
}
