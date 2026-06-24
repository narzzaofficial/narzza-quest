'use client';

import { approveQuest, rejectQuest } from '@/lib/db';
import { formatGoal } from '@/constants/goal';
import type { Quest, UserProfile } from '@/types';

export interface AIReviewOutcome {
    decision: 'approve' | 'reject';
    feedback: string;
    bonusExp: number;
    expEarned?: number;
    newLevel?: number;
}

/**
 * Solo-mode auto-review: ask the AI Game Master to grade a submission, then
 * apply the outcome to Firestore (approve → grant EXP, or reject).
 * Call this after the quest has been submitted online.
 */
export async function runAIReview(
    quest: Quest,
    submissionNote: string,
    profile: UserProfile,
    hasProof: boolean
): Promise<AIReviewOutcome> {
    const res = await fetch('/api/ai/review-quest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            title: quest.title,
            description: quest.description,
            difficulty: quest.difficulty,
            expReward: quest.expReward,
            submissionNote,
            hasProof,
            playerLevel: profile.level,
            goalSummary: formatGoal(profile.goal) || undefined,
            aiSettings: profile.aiSettings,
        }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || 'Gagal review quest.');

    const submittedQuest: Quest = {
        ...quest,
        status: 'submitted',
        submissionNote,
        submittedAt: new Date().toISOString(),
    };

    if (data.decision === 'approve') {
        const r = await approveQuest(quest.id, submittedQuest, profile, data.feedback, data.bonusExp || 0);
        return {
            decision: 'approve',
            feedback: data.feedback,
            bonusExp: data.bonusExp || 0,
            expEarned: r.expEarned,
            newLevel: r.level,
        };
    }

    await rejectQuest(quest.id, data.feedback);
    return { decision: 'reject', feedback: data.feedback, bonusExp: 0 };
}
