'use client';

import { useEffect, useMemo, useState } from 'react';
import { getActivitiesRange, getHabitLogs, getJournals, getMissedQuestsInRange, subscribeToQuests, subscribeToHabits } from '@/lib/db';
import { localDateStr } from '@/lib/dateUtils';
import { isAIQuest } from '@/constants/ai';
import { ACTIVITY_CAT_COLORS, ACTIVITY_CAT_LABELS, MONTH_NAMES_SHORT, DAY_NAMES_SHORT } from '@/constants/ui';
import { DIFF_WEIGHT, QUEST_CATEGORIES } from '@/constants/game';
import { CATEGORY_LABEL } from '@/constants/ui';
import type { ActivityEntry, ActivityCategory, Quest, JournalEntry, HabitLog, Habit } from '@/types';

// Best-effort mapping from a goal's free-text focus area tag to the closest
// ActivityCategory — the two use different vocabularies, so this is a
// heuristic for "goal alignment", not an exact classification.
const FOCUS_AREA_TO_CATEGORY: Record<string, ActivityCategory> = {
    Coding: 'learning', Bahasa: 'learning', Belajar: 'learning',
    Bisnis: 'work', Karier: 'work', Keuangan: 'work',
    Fitness: 'health',
    Kreatif: 'personal', Spiritual: 'personal', Hobi: 'personal',
};

function pctChange(curr: number, prev: number): number | null {
    if (prev === 0) return null;
    return ((curr - prev) / prev) * 100;
}

/** Both current & longest streak derived from the same sequence of scheduled days, so they stay consistent. */
function computeHabitStreaks(habits: Habit[], logs: HabitLog[]) {
    const logsByHabit: Record<string, Record<string, boolean>> = {};
    logs.forEach((l) => {
        if (!logsByHabit[l.habitId]) logsByHabit[l.habitId] = {};
        logsByHabit[l.habitId][l.date] = l.completed;
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return habits.map((h) => {
        const byDate = logsByHabit[h.id] ?? {};
        const created = new Date(h.createdAt);
        created.setHours(0, 0, 0, 0);

        const scheduled: boolean[] = [];
        for (const d = new Date(created); d <= today; d.setDate(d.getDate() + 1)) {
            if (h.targetDays.length === 0 || h.targetDays.includes(d.getDay())) {
                scheduled.push(!!byDate[localDateStr(d)]);
            }
        }

        let longest = 0, run = 0;
        scheduled.forEach((done) => {
            run = done ? run + 1 : 0;
            longest = Math.max(longest, run);
        });

        let current = 0;
        for (let i = scheduled.length - 1; i >= 0; i--) {
            if (scheduled[i]) current++; else break;
        }

        return { habitId: h.id, name: h.name, icon: h.icon, current, longest };
    });
}

function dateRange(days: number): { from: string; to: string } {
    return {
        from: localDateStr(new Date(Date.now() - days * 86_400_000)),
        to:   localDateStr(new Date()),
    };
}

export function dateKey(iso: string) {
    // Convert UTC ISO string to local date (YYYY-MM-DD) so WIB/WITA/WIT users
    // see dates in their timezone, not UTC.
    return localDateStr(iso);
}

function durationHours(e: ActivityEntry): number {
    const end = e.endTime ? new Date(e.endTime) : new Date();
    return (end.getTime() - new Date(e.startTime).getTime()) / 3_600_000;
}

export function useAnalytics(uid: string | undefined, goalFocusAreas?: string[]) {
    const [activities, setActivities] = useState<ActivityEntry[]>([]);
    const [quests, setQuests] = useState<Quest[]>([]);
    const [journals, setJournals] = useState<JournalEntry[]>([]);
    const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
    const [habits, setHabits] = useState<Habit[]>([]);
    const [missed, setMissed] = useState<Array<{ date: string; penalty: number; questTitle: string }>>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!uid) return;
        const { from, to } = dateRange(182); // 6 months back for heatmap coverage
        const { from: from30 } = dateRange(30);

        Promise.all([
            getActivitiesRange(uid, from, to),
            getJournals(uid),
            getHabitLogs(uid, from, to),
            getMissedQuestsInRange(uid, from30, to),
        ]).then(([acts, jnls, hlogs, missedQuests]) => {
            setActivities(acts);
            setJournals(jnls);
            setHabitLogs(hlogs);
            setMissed(missedQuests);
            setLoading(false);
        }).catch(() => setLoading(false));

        const unsubQuests = subscribeToQuests(uid, setQuests);
        const unsubHabits = subscribeToHabits(uid, setHabits);
        return () => { unsubQuests(); unsubHabits(); };
    }, [uid]);

    const moodEnergyData = useMemo(() => {
        const byDate: Record<string, { moods: number[]; energies: number[] }> = {};
        activities.forEach(a => {
            const k = dateKey(a.startTime);
            if (!byDate[k]) byDate[k] = { moods: [], energies: [] };
            byDate[k].moods.push(a.mood);
            byDate[k].energies.push(a.energy);
        });
        return Object.entries(byDate)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, v]) => {
                const d = new Date(date);
                return {
                    label: `${d.getDate()} ${MONTH_NAMES_SHORT[d.getMonth()]}`,
                    mood:   parseFloat((v.moods.reduce((s, x) => s + x, 0) / v.moods.length).toFixed(1)),
                    energy: parseFloat((v.energies.reduce((s, x) => s + x, 0) / v.energies.length).toFixed(1)),
                };
            });
    }, [activities]);

    const categoryData = useMemo(() => {
        const hours: Record<string, number> = {};
        activities.forEach(a => {
            hours[a.category] = (hours[a.category] ?? 0) + durationHours(a);
        });
        return Object.entries(hours)
            .filter(([, h]) => h > 0)
            .map(([cat, h]) => ({
                name:  ACTIVITY_CAT_LABELS[cat] ?? cat,
                value: parseFloat(h.toFixed(1)),
                color: ACTIVITY_CAT_COLORS[cat] ?? '#888',
            }))
            .sort((a, b) => b.value - a.value);
    }, [activities]);

    const peakHoursData = useMemo(() => {
        const counts = Array.from({ length: 24 }, (_, i) => ({ hour: `${String(i).padStart(2, '0')}:00`, count: 0 }));
        activities.forEach(a => { counts[new Date(a.startTime).getHours()].count++; });
        return counts.filter((_, i) => i >= 5 && i <= 23);
    }, [activities]);

    const bestDayData = useMemo(() => {
        const counts = DAY_NAMES_SHORT.map(d => ({ day: d, count: 0, hours: 0 }));
        activities.forEach(a => {
            const dow = new Date(a.startTime).getDay();
            counts[dow].count++;
            counts[dow].hours += durationHours(a);
        });
        return counts;
    }, [activities]);

    const radarData = useMemo(() => {
        const approved = quests.filter(q => q.status === 'approved');
        return QUEST_CATEGORIES.map(cat => {
            const score = approved
                .filter(q => q.category === cat)
                .reduce((s, q) => s + (DIFF_WEIGHT[q.difficulty] ?? 1), 0);
            return { category: CATEGORY_LABEL[cat], score };
        });
    }, [quests]);

    const expData = useMemo(() => {
        const { from } = dateRange(30);
        const recent = journals.filter(j => (j.createdAt ?? '') >= from);

        // Collect all dates that appear in earned or penalty data
        const earnedByDate: Record<string, number>  = {};
        const penaltyByDate: Record<string, number> = {};

        recent.forEach(j => {
            const k = dateKey(j.createdAt ?? '');
            earnedByDate[k] = (earnedByDate[k] ?? 0) + (j.expEarned ?? 0);
        });
        missed.forEach(m => {
            penaltyByDate[m.date] = (penaltyByDate[m.date] ?? 0) + m.penalty;
        });

        const allDates = Array.from(new Set([...Object.keys(earnedByDate), ...Object.keys(penaltyByDate)])).sort();

        let cumulative = 0;
        return allDates.map(date => {
            const exp     = earnedByDate[date]  ?? 0;
            const penalty = penaltyByDate[date] ?? 0;
            cumulative += exp - penalty;
            const d = new Date(date);
            return {
                label:      `${d.getDate()} ${MONTH_NAMES_SHORT[d.getMonth()]}`,
                exp,
                penalty:    -penalty,  // negative so bar goes downward
                net:        exp - penalty,
                cumulative,
            };
        });
    }, [journals, missed]);

    const moodVsQuestData = useMemo(() => {
        const aiApproved = quests.filter(q => q.status === 'approved' && isAIQuest(q.createdBy));
        const byDate: Record<string, number> = {};
        aiApproved.forEach(q => {
            // Key by the same "D MMM" label format moodEnergyData uses, not the raw
            // YYYY-MM-DD date — otherwise the lookup below never matches and quests
            // always shows 0.
            const d = new Date(dateKey(q.updatedAt ?? ''));
            const label = `${d.getDate()} ${MONTH_NAMES_SHORT[d.getMonth()]}`;
            byDate[label] = (byDate[label] ?? 0) + 1;
        });
        return moodEnergyData
            .map(d => ({ ...d, quests: byDate[d.label] ?? 0 }))
            .filter(d => d.quests > 0 || d.mood > 0);
    }, [moodEnergyData, quests]);

    const habitRate = useMemo(() => {
        if (!habitLogs.length) return null;
        return Math.round((habitLogs.filter(l => l.completed).length / habitLogs.length) * 100);
    }, [habitLogs]);

    const totalHoursLogged = useMemo(() =>
        activities.reduce((s, a) => s + durationHours(a), 0).toFixed(0), [activities]);

    const avgMood = useMemo(() => {
        if (!activities.length) return '-';
        return (activities.reduce((s, a) => s + a.mood, 0) / activities.length).toFixed(1);
    }, [activities]);

    const peakHour = useMemo(() => {
        if (!peakHoursData.length) return '-';
        const max = peakHoursData.reduce((m, h) => h.count > m.count ? h : m, peakHoursData[0]);
        return max.count > 0 ? max.hour : '-';
    }, [peakHoursData]);

    const questsDone = quests.filter(q => q.status === 'approved').length;

    // Minggu ini vs minggu lalu — jam aktif & rata-rata mood.
    const periodComparison = useMemo(() => {
        const dayKey = (n: number) => localDateStr(new Date(Date.now() - n * 86_400_000));
        const inRange = (a: ActivityEntry, from: string, to: string) => {
            const k = dateKey(a.startTime);
            return k >= from && k <= to;
        };
        const thisWeek = activities.filter(a => inRange(a, dayKey(6), dayKey(0)));
        const lastWeek = activities.filter(a => inRange(a, dayKey(13), dayKey(7)));
        const hoursThis = thisWeek.reduce((s, a) => s + durationHours(a), 0);
        const hoursLast = lastWeek.reduce((s, a) => s + durationHours(a), 0);
        const moodThis = thisWeek.length ? thisWeek.reduce((s, a) => s + a.mood, 0) / thisWeek.length : 0;
        const moodLast = lastWeek.length ? lastWeek.reduce((s, a) => s + a.mood, 0) / lastWeek.length : 0;
        return {
            hoursPct: lastWeek.length ? pctChange(hoursThis, hoursLast) : null,
            moodPct: lastWeek.length ? pctChange(moodThis, moodLast) : null,
        };
    }, [activities]);

    // Selarasnya jam aktivitas dengan focus area yang ditulis di goal (heuristik, lihat FOCUS_AREA_TO_CATEGORY).
    const goalAlignment = useMemo(() => {
        const areas = goalFocusAreas ?? [];
        if (!areas.length || !activities.length) return null;
        const mapped = new Set(areas.map(a => FOCUS_AREA_TO_CATEGORY[a]).filter(Boolean));
        if (mapped.size === 0) return null;
        let aligned = 0, total = 0;
        activities.forEach(a => {
            const h = durationHours(a);
            total += h;
            if (mapped.has(a.category)) aligned += h;
        });
        return {
            focusAreas: areas,
            alignedHours: parseFloat(aligned.toFixed(1)),
            totalHours: parseFloat(total.toFixed(1)),
            pct: total > 0 ? Math.round((aligned / total) * 100) : 0,
        };
    }, [goalFocusAreas, activities]);

    const habitStreaks = useMemo(() => computeHabitStreaks(habits, habitLogs), [habits, habitLogs]);

    return {
        loading,
        activities,
        moodEnergyData,
        categoryData,
        peakHoursData,
        bestDayData,
        radarData,
        expData,
        moodVsQuestData,
        habitRate,
        totalHoursLogged,
        avgMood,
        peakHour,
        questsDone,
        periodComparison,
        goalAlignment,
        habitStreaks,
    };
}
