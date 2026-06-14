'use client';

import { useState } from 'react';
import { createQuest } from '@/lib/db';
import { AI_GM_ID } from '@/constants/ai';
import type { JournalEntry, Quest, UserProfile } from '@/types';
import type { QuestDraft } from '@/lib/ai/questGenerator';

function endOfTodayIso(): string {
    const d = new Date();
    d.setHours(23, 59, 59, 0);
    return d.toISOString();
}

/**
 * Drives the "Generate Quest" flow: calls the server AI route, then writes the
 * returned drafts into Firestore as pending quests assigned to the player.
 */
export function useAIQuests(profile: UserProfile | null, journals: JournalEntry[] = []) {
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [createdCount, setCreatedCount] = useState(0);

    async function generate(
        memorySummary?: string,
        completionRate7d?: number,
        arcTheme?: string,
        arcNarrative?: string,
        arcWeeklyGoals?: string[],
        lifeContext?: {
            situationStatus?: string;
            workload?: string;
            weekFocus?: string;
            activeWorkTasks?: string[];
            todayActivitiesSummary?: string;
        }
    ): Promise<number> {
        if (!profile) return 0;
        setGenerating(true);
        setError(null);
        setCreatedCount(0);

        try {
            const res = await fetch('/api/ai/generate-quests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    displayName: profile.displayName,
                    level: profile.level,
                    title: profile.title,
                    streak: profile.streak,
                    totalQuestsCompleted: profile.totalQuestsCompleted,
                    recentJournalTitles: journals
                        .slice(0, 5)
                        .map((j) => j.questTitle || '')
                        .filter(Boolean),
                    memorySummary,
                    completionRate7d,
                    arcTheme,
                    arcNarrative,
                    arcWeeklyGoals,
                    ...lifeContext,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || 'Gagal generate quest.');

            const drafts: QuestDraft[] = data.quests || [];
            const deadline = endOfTodayIso();

            for (const d of drafts) {
                const questData: Omit<Quest, 'id' | 'createdAt' | 'updatedAt'> = {
                    title: d.title,
                    description: d.description,
                    category: d.category,
                    difficulty: d.difficulty,
                    expReward: d.expReward,
                    deadline,
                    status: 'pending',
                    createdBy: AI_GM_ID,
                    motivation: d.motivation,
                    assignedTo: profile.uid,
                };
                await createQuest(questData);
            }

            setCreatedCount(drafts.length);
            return drafts.length;
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Gagal generate quest.');
            return 0;
        } finally {
            setGenerating(false);
        }
    }

    return { generating, error, createdCount, generate };
}
