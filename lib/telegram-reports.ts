import { adminDb } from './firebase-admin';
import { sendTelegramMessage } from './telegram';
import { getAIProvider } from './ai';
import type { UserProfile, Quest, ActivityEntry, FinancialTransaction, Habit, HabitLog } from '@/types';

const GM_PERSONA =
    'Kamu adalah AI Game Master dari game RPG kehidupan "Narzza Quest". Pesan harus terasa personal, hangat, dan ringkas. Jangan gunakan markdown.';

const TODAY = () => new Date().toISOString().split('T')[0];
const DAYS_AGO = (n: number) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().split('T')[0];
};

function fmtRupiah(n: number): string {
    return `Rp${Math.round(n).toLocaleString('id-ID')}`;
}

function pctChange(curr: number, prev: number): number | null {
    if (prev === 0) return null;
    return ((curr - prev) / prev) * 100;
}

function fmtTrend(pct: number | null, goodWhenUp = true): string {
    if (pct === null || !Number.isFinite(pct)) return '';
    const isUp = pct >= 0;
    const isGood = goodWhenUp ? isUp : !isUp;
    const arrow = isUp ? '↑' : '↓';
    return ` (${isGood ? '✅' : '⚠️'} ${arrow}${Math.abs(pct).toFixed(0)}%)`;
}

// ── Dedup log (deterministic doc id, no queries/indexes needed) ──

async function wasTelegramSent(uid: string, key: string): Promise<boolean> {
    const snap = await adminDb.collection('telegramReminderLog').doc(uid).collection('entries').doc(key).get();
    return snap.exists;
}

async function markTelegramSent(uid: string, key: string): Promise<void> {
    await adminDb.collection('telegramReminderLog').doc(uid).collection('entries').doc(key).set({
        createdAt: new Date().toISOString(),
    });
}

// ── Shared data fetch ──

async function getLinkedUsers(): Promise<UserProfile[]> {
    const snap = await adminDb.collection('users').get();
    return snap.docs
        .map((d) => d.data() as UserProfile)
        .filter((u) => !!u.uid && u.role === 'player' && !!u.telegramChatId);
}

interface PeriodStats {
    questsCount: number;
    exp: number;
    hours: number;
    avgMood: number | null;
    income: number;
    expense: number;
}

async function computePeriodStats(uid: string, fromDate: string, toDate: string): Promise<PeriodStats> {
    const inRange = (dateStr: string) => dateStr >= fromDate && dateStr <= toDate;

    const [questsSnap, activitiesSnap, txSnap] = await Promise.all([
        adminDb.collection('quests').where('assignedTo', '==', uid).where('status', '==', 'approved').get(),
        adminDb.collection('activities').where('uid', '==', uid).get(),
        adminDb.collection('financial_transactions').where('uid', '==', uid).get(),
    ]);

    let questsCount = 0;
    let exp = 0;
    questsSnap.docs.forEach((d) => {
        const q = d.data() as Quest;
        const checkDate = (q.reviewedAt ?? q.updatedAt ?? '').split('T')[0];
        if (inRange(checkDate)) {
            questsCount++;
            exp += (q.expReward ?? 0) + (q.bonusExp ?? 0);
        }
    });

    let hours = 0;
    let moodSum = 0;
    let moodCount = 0;
    activitiesSnap.docs.forEach((d) => {
        const a = d.data() as ActivityEntry;
        const dateStr = a.startTime?.split('T')[0];
        if (!dateStr || !inRange(dateStr)) return;
        if (a.endTime) {
            hours += (new Date(a.endTime).getTime() - new Date(a.startTime).getTime()) / 3_600_000;
        }
        if (a.mood) {
            moodSum += a.mood;
            moodCount++;
        }
    });

    let income = 0;
    let expense = 0;
    txSnap.docs.forEach((d) => {
        const t = d.data() as FinancialTransaction;
        if (!inRange(t.date)) return;
        if (t.type === 'income') income += t.amount;
        if (t.type === 'expense') expense += t.amount;
    });

    return { questsCount, exp, hours, avgMood: moodCount ? moodSum / moodCount : null, income, expense };
}

function dailyFallbackText(stats: PeriodStats): string {
    return [
        `✅ Quest selesai: ${stats.questsCount} (${stats.exp} EXP)`,
        `⏱ Jam aktif: ${stats.hours.toFixed(1)}j`,
        stats.avgMood !== null ? `😊 Mood rata-rata: ${stats.avgMood.toFixed(1)}/5` : null,
        `💰 Keuangan: +${fmtRupiah(stats.income)} / -${fmtRupiah(stats.expense)}`,
    ].filter((l) => l !== null).join('\n');
}

async function generateDailySummaryText(user: UserProfile, stats: PeriodStats): Promise<string> {
    try {
        const ai = getAIProvider(user.aiSettings);
        return await ai.generateText({
            system: GM_PERSONA,
            messages: [{
                role: 'user',
                content: `Tulis ringkasan hari ini untuk "${user.displayName}" dalam maksimal 3 kalimat pendek, nada hangat & memotivasi, bahasa Indonesia, tanpa markdown. Data hari ini: ${stats.questsCount} quest selesai (${stats.exp} EXP), ${stats.hours.toFixed(1)} jam aktif, ${stats.avgMood !== null ? `mood rata-rata ${stats.avgMood.toFixed(1)}/5` : 'belum ada catatan mood'}, pemasukan ${fmtRupiah(stats.income)}, pengeluaran ${fmtRupiah(stats.expense)}. Sebut angka pentingnya secara natural, jangan kaku seperti laporan.`,
            }],
            maxTokens: 150,
            temperature: 0.8,
        });
    } catch (err) {
        console.error('[Telegram Daily] AI generation failed, falling back to template:', err);
        return dailyFallbackText(stats);
    }
}

// ── Daily report ──

export async function runDailyTelegramReport(): Promise<{ processed: number; sent: number }> {
    const users = await getLinkedUsers();
    const today = TODAY();
    let sent = 0;

    for (const user of users) {
        const stats = await computePeriodStats(user.uid, today, today);
        const body = await generateDailySummaryText(user, stats);

        await sendTelegramMessage(user.telegramChatId, `📊 <b>Ringkasan Hari Ini</b>\n\n${body}`);
        sent++;
    }

    return { processed: users.length, sent };
}

// ── Weekly report ──

function weeklyFallbackText(curr: PeriodStats, prev: PeriodStats, habitRate: number | null): string {
    return [
        `✅ ${curr.questsCount} quest selesai (${curr.exp} EXP)`,
        `⏱ ${curr.hours.toFixed(1)}j aktif${fmtTrend(pctChange(curr.hours, prev.hours))}`,
        curr.avgMood !== null ? `😊 Mood rata-rata: ${curr.avgMood.toFixed(1)}/5` : null,
        `💸 Pengeluaran: ${fmtRupiah(curr.expense)}${fmtTrend(pctChange(curr.expense, prev.expense), false)}`,
        habitRate !== null ? `🔥 Konsistensi habit: ${habitRate}%` : null,
    ].filter((l) => l !== null).join('\n');
}

async function generateWeeklySummaryText(
    user: UserProfile,
    curr: PeriodStats,
    prev: PeriodStats,
    habitRate: number | null
): Promise<string> {
    try {
        const ai = getAIProvider(user.aiSettings);
        return await ai.generateText({
            system: GM_PERSONA,
            messages: [{
                role: 'user',
                content: `Tulis ringkasan minggu ini untuk "${user.displayName}" dalam maksimal 4 kalimat pendek, nada hangat & memotivasi, bahasa Indonesia, tanpa markdown. Data minggu ini: ${curr.questsCount} quest selesai (${curr.exp} EXP), ${curr.hours.toFixed(1)} jam aktif (minggu lalu ${prev.hours.toFixed(1)}j), ${curr.avgMood !== null ? `mood rata-rata ${curr.avgMood.toFixed(1)}/5` : 'belum ada catatan mood'}, pengeluaran ${fmtRupiah(curr.expense)} (minggu lalu ${fmtRupiah(prev.expense)})${habitRate !== null ? `, konsistensi habit ${habitRate}%` : ''}. Sebut tren naik/turunnya secara natural, tutup dengan semangat buat minggu depan.`,
            }],
            maxTokens: 200,
            temperature: 0.8,
        });
    } catch (err) {
        console.error('[Telegram Weekly] AI generation failed, falling back to template:', err);
        return weeklyFallbackText(curr, prev, habitRate);
    }
}

export async function runWeeklyTelegramReport(): Promise<{ processed: number; sent: number }> {
    const users = await getLinkedUsers();
    const from = DAYS_AGO(6);
    const today = TODAY();
    const prevFrom = DAYS_AGO(13);
    const prevTo = DAYS_AGO(7);
    let sent = 0;

    for (const user of users) {
        const [curr, prev] = await Promise.all([
            computePeriodStats(user.uid, from, today),
            computePeriodStats(user.uid, prevFrom, prevTo),
        ]);

        const habitLogsSnap = await adminDb.collection('habitLogs').where('uid', '==', user.uid).get();
        const weekLogs = habitLogsSnap.docs
            .map((d) => d.data() as HabitLog)
            .filter((l) => l.date >= from && l.date <= today);
        const habitRate = weekLogs.length ? Math.round((weekLogs.filter((l) => l.completed).length / weekLogs.length) * 100) : null;

        const body = await generateWeeklySummaryText(user, curr, prev, habitRate);

        await sendTelegramMessage(user.telegramChatId, `📅 <b>Ringkasan Minggu Ini</b>\n\n${body}`);
        sent++;
    }

    return { processed: users.length, sent };
}

// ── Reminders (deadline + condition-based nudges) ──
//
// Deadline reminders fire once per quest (dedup via telegramReminderLog).
// Nudges (no active quest / habit not done / no activity today) are NOT
// deduped — every cron cycle just re-checks the live condition and sends
// again if it's still unresolved, and naturally stays silent the moment
// it's resolved. No "already sent today" bookkeeping needed.

const ACTIVE_HOUR_START_WIB = 7;
const ACTIVE_HOUR_END_WIB = 22;

export async function runTelegramReminders(): Promise<{ processed: number; deadlineReminders: number; nudges: number }> {
    const users = await getLinkedUsers();
    const now = new Date();
    const hourWIB = (now.getUTCHours() + 7) % 24;
    const isActiveHours = hourWIB >= ACTIVE_HOUR_START_WIB && hourWIB < ACTIVE_HOUR_END_WIB;

    let deadlineReminders = 0;
    let nudges = 0;

    for (const user of users) {
        // Deadline-approaching quests — single equality filter only, to avoid
        // needing a new composite index for this fresh query shape.
        const questsSnap = await adminDb.collection('quests').where('assignedTo', '==', user.uid).get();
        const quests = questsSnap.docs.map((d) => d.data() as Quest);

        for (let i = 0; i < questsSnap.docs.length; i++) {
            const doc = questsSnap.docs[i];
            const q = quests[i];
            if (q.status !== 'pending' && q.status !== 'in_progress') continue;
            if (!q.deadline) continue;
            const hoursLeft = (new Date(q.deadline).getTime() - now.getTime()) / 3_600_000;
            if (hoursLeft <= 0 || hoursLeft > 3) continue;

            const key = `quest_deadline_${doc.id}`;
            if (await wasTelegramSent(user.uid, key)) continue;

            await sendTelegramMessage(
                user.telegramChatId,
                `⏰ Quest "<b>${q.title}</b>" deadline ${Math.max(1, Math.round(hoursLeft))} jam lagi! Yuk selesaikan sebelum kehabisan waktu.`
            );
            await markTelegramSent(user.uid, key);
            deadlineReminders++;
        }

        if (!isActiveHours) continue;

        const hasActiveQuest = quests.some((q) => q.status === 'pending' || q.status === 'in_progress' || q.status === 'submitted');

        const todayWeekday = now.getDay();
        const [habitsSnap, habitLogsSnap, activitiesSnap] = await Promise.all([
            adminDb.collection('habits').where('uid', '==', user.uid).get(),
            adminDb.collection('habitLogs').where('uid', '==', user.uid).where('date', '==', TODAY()).where('completed', '==', true).get(),
            adminDb.collection('activities').where('uid', '==', user.uid).get(),
        ]);

        const habits = habitsSnap.docs.map((d) => d.data() as Habit);
        const completedHabitIds = new Set(habitLogsSnap.docs.map((d) => (d.data() as HabitLog).habitId));
        const pendingHabits = habits.filter(
            (h) => (h.targetDays.length === 0 || h.targetDays.includes(todayWeekday)) && !completedHabitIds.has(h.id)
        );
        const hasActivityToday = activitiesSnap.docs.some((d) => (d.data() as ActivityEntry).startTime?.startsWith(TODAY()));

        const lines: string[] = [];
        if (!hasActiveQuest) lines.push(`🎯 Belum ada quest aktif — buka app & generate quest baru!`);
        if (pendingHabits.length > 0) lines.push(`🔁 Belum checklist: ${pendingHabits.map((h) => h.name).join(', ')}`);
        if (!hasActivityToday) lines.push(`📝 Belum ada aktivitas tercatat hari ini — catat sekarang!`);

        if (lines.length === 0) continue;

        await sendTelegramMessage(user.telegramChatId, [`🔔 <b>Reminder</b>`, ``, ...lines].join('\n'));
        nudges++;
    }

    return { processed: users.length, deadlineReminders, nudges };
}
