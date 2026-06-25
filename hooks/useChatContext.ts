'use client';

import { useMemo } from 'react';
import type { UserProfile, TimelineItem } from '@/types';
import type { ChatContext } from '@/app/api/ai/chat/route';
import { formatGoal } from '@/constants/goal';
import type { useAIGameMaster } from './useAIGameMaster';
import type { useActivityLog } from './useActivityLog';
import type { useWorkTasks } from './useWorkTasks';
import type { useSituation } from './useSituation';
import type { useHabits } from './useHabits';
import type { useFinance } from './useFinance';
import type { useJournal } from './useJournal';

/** Assembles the full life-context object the AI Game Master chat needs from every other hook's state. */
export function useChatContext(
    profile: UserProfile | null | undefined,
    ai: ReturnType<typeof useAIGameMaster>,
    actLog: ReturnType<typeof useActivityLog>,
    workTasks: ReturnType<typeof useWorkTasks>,
    sit: ReturnType<typeof useSituation>,
    habits: ReturnType<typeof useHabits>,
    finance: ReturnType<typeof useFinance>,
    journal: ReturnType<typeof useJournal>
): ChatContext | null {
    return useMemo(() => {
        if (!profile) return null;

        return {
            displayName: profile.displayName,
            level: profile.level || 1,
            streak: profile.streak || 0,
            title: profile.title,
            goalSummary: formatGoal(profile.goal) || undefined,
            memorySummary: ai.memory?.summary,
            todayReview: ai.review ? {
                summary: ai.review.summary,
                wins: ai.review.wins,
                focus: ai.review.focus,
                questsCompleted: ai.review.questsCompleted,
                expEarned: ai.review.expEarned,
            } : null,
            recentQuestTitles: ai.aiQuests.slice(0, 5).map((q: { title: string }) => q.title),
            recentJournals: journal.timeline
                .filter((item): item is Extract<TimelineItem, { type: 'personal' }> => item.type === 'personal')
                .slice(0, 5)
                .map((item) => ({ content: item.data.content, createdAt: item.data.createdAt })),
            situation: sit.situation ? {
                currentStatus: sit.situation.currentStatus,
                weekFocus: sit.situation.weekFocus,
                workload: sit.situation.workload,
                activeProjects: sit.situation.activeProjects,
                contextNote: sit.situation.contextNote,
            } : null,
            workTasks: workTasks.tasks.map((t: { title: string; project?: string; priority: string; status: string; deadline?: string; blocker?: string }) => ({
                title: t.title, project: t.project, priority: t.priority,
                status: t.status, deadline: t.deadline, blocker: t.blocker,
            })),
            todayActivities: actLog.entries.map((a) => ({
                title: a.title, category: a.category, mood: a.mood, energy: a.energy,
                durationMinutes: actLog.getDurationMinutes(a),
            })),
            habitSummary: habits.todayTotal > 0
                ? { completed: habits.todayCount, total: habits.todayTotal }
                : null,
            financeSummary: {
                totalNetWorthIDR: finance.totalNetWorthIDR,
                incomeThisMonth: finance.getIncomeThisMonth(),
                expenseThisMonth: finance.getExpenseThisMonth(),
                goals: finance.goals.map((g: { title: string; currentAmount: number; targetAmount: number }) => ({
                    title: g.title,
                    progressPercentage: Math.round((g.currentAmount / g.targetAmount) * 100),
                })),
                recentTransactions: finance.transactions.slice(0, 5).map((t: { title: string; amount: number; type: string; category: string }) => ({
                    title: t.title, amount: t.amount, type: t.type, category: t.category,
                })),
            },
            arcTitle: ai.storyArc.arc?.title,
            arcNarrative: ai.storyArc.arc?.narrative,
        };
    }, [profile, ai, actLog, workTasks, sit, habits, finance, journal]);
}
