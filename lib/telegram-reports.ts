import { adminDb } from './firebase-admin';
import { sendTelegramMessage } from './telegram';
import { getAIProvider } from './ai';
import type { UserProfile, Quest, ActivityEntry, FinancialTransaction, Habit, HabitLog } from '@/types';

// ── Persona ──────────────────────────────────────────────────────────────────
// Brutal honest coach. No sugarcoating. Every message references the user's
// actual goal so the stakes feel real, not generic.

const BRUTAL_COACH_PERSONA = `Kamu adalah coach brutal jujur yang gak kenal basa-basi. Gaya kamu seperti pelatih keras yang peduli tapi gak ada ampunnya.
Aturan wajib:
- TIDAK ada kalimat motivasi kosong seperti "kamu pasti bisa!" atau "tetap semangat!".
- SELALU sebut nama orang dan tujuan spesifik mereka dalam pesan.
- SELALU hubungkan tindakan hari ini ke konsekuensi nyata di masa depan.
- Nada: keras, jujur, tapi bukan jahat. Seperti teman yang peduli dan mau lo sukses, tapi gak mau bullshit lo.
- Bahasa Indonesia gaul/santai, tanpa markdown, maks 3 kalimat pendek yang menohok.`;

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

// ── Dedup log ─────────────────────────────────────────────────────────────────

async function wasTelegramSent(uid: string, key: string): Promise<boolean> {
    const snap = await adminDb.collection('telegramReminderLog').doc(uid).collection('entries').doc(key).get();
    return snap.exists;
}

async function markTelegramSent(uid: string, key: string): Promise<void> {
    await adminDb.collection('telegramReminderLog').doc(uid).collection('entries').doc(key).set({
        createdAt: new Date().toISOString(),
    });
}

// ── Shared data fetch ─────────────────────────────────────────────────────────

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
        if (inRange(checkDate)) { questsCount++; exp += (q.expReward ?? 0) + (q.bonusExp ?? 0); }
    });

    let hours = 0;
    let moodSum = 0;
    let moodCount = 0;
    activitiesSnap.docs.forEach((d) => {
        const a = d.data() as ActivityEntry;
        const dateStr = a.startTime?.split('T')[0];
        if (!dateStr || !inRange(dateStr)) return;
        if (a.endTime) hours += (new Date(a.endTime).getTime() - new Date(a.startTime).getTime()) / 3_600_000;
        if (a.mood) { moodSum += a.mood; moodCount++; }
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

/** How many consecutive days has the user had zero activity logged. */
async function getDaysWithoutActivity(uid: string): Promise<number> {
    const snap = await adminDb.collection('activities').where('uid', '==', uid).get();
    const loggedDates = new Set(snap.docs.map((d) => (d.data() as ActivityEntry).startTime?.split('T')[0]).filter(Boolean));

    let streak = 0;
    const d = new Date();
    while (streak < 30) {
        const key = d.toISOString().split('T')[0];
        if (loggedDates.has(key)) break;
        streak++;
        d.setDate(d.getDate() - 1);
    }
    return streak;
}

function goalContext(user: UserProfile): string {
    if (!user.goal) return 'tidak ada tujuan yang dicatat';
    const focus = user.goal.focusAreas?.length ? user.goal.focusAreas.join(', ') : '';
    const tf = user.goal.timeframe ? ` dalam ${user.goal.timeframe}` : '';
    return `Tujuan: "${user.goal.aspiration}"${tf}. Fokus: ${focus || '-'}.`;
}

// ── AI text generators ────────────────────────────────────────────────────────

async function generateDailySummaryText(user: UserProfile, stats: PeriodStats, missedHabits: string[]): Promise<string> {
    const noActivity = stats.hours < 0.1;
    const noQuests = stats.questsCount === 0;

    const situation = [
        noActivity && noQuests
            ? `Hari ini NOLNYA SEMPURNA — tidak ada quest, tidak ada aktivitas tercatat, tidak ada progress sama sekali.`
            : `${stats.questsCount} quest selesai (${stats.exp} EXP), ${stats.hours.toFixed(1)} jam aktivitas tercatat.`,
        missedHabits.length > 0 ? `Habit yang dilewatin hari ini: ${missedHabits.join(', ')}.` : `Semua habit selesai.`,
        stats.avgMood !== null ? `Mood rata-rata: ${stats.avgMood.toFixed(1)}/5.` : '',
        goalContext(user),
    ].filter(Boolean).join(' ');

    try {
        const ai = getAIProvider(user.aiSettings);
        return await ai.generateText({
            system: BRUTAL_COACH_PERSONA,
            messages: [{
                role: 'user',
                content: `Tulis ringkasan brutal jujur untuk ${user.displayName} tentang hari ini. ${situation} Kalau hasilnya buruk, bilang apa adanya dan hubungkan ke tujuan mereka. Kalau bagus, akui tapi tetap push lebih keras. Maks 3 kalimat, bahasa santai, tanpa markdown.`,
            }],
            maxTokens: 180,
            temperature: 0.85,
        });
    } catch {
        if (noActivity && noQuests) {
            return `${user.displayName}, hari ini lo buang 24 jam tanpa satu pun progress. ${user.goal?.aspiration ? `Tujuan lo "${user.goal.aspiration}" gak bakal dateng sendiri.` : ''} Besok jangan ulangi ini.`;
        }
        return `${stats.questsCount} quest, ${stats.hours.toFixed(1)} jam. ${missedHabits.length > 0 ? `Tapi ${missedHabits.join(', ')} masih kelewat.` : 'Konsisten.'} Lanjutkan.`;
    }
}

async function generateWeeklySummaryText(
    user: UserProfile, curr: PeriodStats, prev: PeriodStats, habitRate: number | null
): Promise<string> {
    const hoursDiff = curr.hours - prev.hours;
    const situation = [
        `Minggu ini: ${curr.questsCount} quest (${curr.exp} EXP), ${curr.hours.toFixed(1)} jam aktif (minggu lalu ${prev.hours.toFixed(1)}j, ${hoursDiff >= 0 ? '+' : ''}${hoursDiff.toFixed(1)}j).`,
        curr.avgMood !== null ? `Mood rata-rata ${curr.avgMood.toFixed(1)}/5.` : '',
        habitRate !== null ? `Konsistensi habit: ${habitRate}%.` : 'Tidak ada data habit.',
        `Pengeluaran: ${fmtRupiah(curr.expense)} (${hoursDiff >= 0 ? 'naik' : 'turun'} dari ${fmtRupiah(prev.expense)}).`,
        goalContext(user),
    ].filter(Boolean).join(' ');

    try {
        const ai = getAIProvider(user.aiSettings);
        return await ai.generateText({
            system: BRUTAL_COACH_PERSONA,
            messages: [{
                role: 'user',
                content: `Tulis evaluasi mingguan brutal jujur untuk ${user.displayName}. ${situation} Jangan tutup dengan kalimat semangat kosong. Tutup dengan 1 kalimat yang menggambarkan konsekuensi konkret kalau pola ini dilanjutkan. Maks 4 kalimat, tanpa markdown.`,
            }],
            maxTokens: 220,
            temperature: 0.85,
        });
    } catch {
        const lines = [
            `${curr.questsCount} quest, ${curr.hours.toFixed(1)} jam aktif${fmtTrend(pctChange(curr.hours, prev.hours))}.`,
            habitRate !== null ? `Habit: ${habitRate}%.` : '',
            `Pengeluaran ${fmtRupiah(curr.expense)}${fmtTrend(pctChange(curr.expense, prev.expense), false)}.`,
        ].filter(Boolean);
        return lines.join(' ');
    }
}

async function generateBrutalNudge(
    user: UserProfile,
    conditions: { noActiveQuest: boolean; pendingHabits: string[]; noActivityToday: boolean; daysWithoutActivity: number }
): Promise<string> {
    const { noActiveQuest, pendingHabits, noActivityToday, daysWithoutActivity } = conditions;
    const escalation = daysWithoutActivity >= 3
        ? `KRITIS: Lo udah ${daysWithoutActivity} hari berturut-turut tanpa aktivitas tercatat.`
        : daysWithoutActivity >= 1 ? `Kemarin juga lo gak catat apapun.` : '';

    const issues = [
        noActiveQuest && 'tidak ada quest aktif',
        pendingHabits.length > 0 && `habit "${pendingHabits.join('", "')}" belum dikerjain`,
        noActivityToday && 'belum ada aktivitas tercatat hari ini',
    ].filter(Boolean).join(', ');

    try {
        const ai = getAIProvider(user.aiSettings);
        return await ai.generateText({
            system: BRUTAL_COACH_PERSONA,
            messages: [{
                role: 'user',
                content: `Tulis reminder keras untuk ${user.displayName}. ${escalation} Masalah sekarang: ${issues}. ${goalContext(user)} Hubungkan langsung ke konsekuensi nyata kalau ini terus terjadi. Maks 2-3 kalimat, jangan lembut, jangan kasih pujian.`,
            }],
            maxTokens: 150,
            temperature: 0.9,
        });
    } catch {
        const name = user.displayName.split(' ')[0];
        if (daysWithoutActivity >= 3) return `${name}, ${daysWithoutActivity} hari hilang tanpa jejak. ${user.goal?.aspiration ? `"${user.goal.aspiration}" bukan mimpi yang bisa dicapai dengan cara ini.` : 'Lo serius sama tujuan lo?'}`;
        return `${name}: ${issues}. Sekarang, bukan nanti.`;
    }
}

// ── Daily report ──────────────────────────────────────────────────────────────

export async function runDailyTelegramReport(): Promise<{ processed: number; sent: number }> {
    const users = await getLinkedUsers();
    const today = TODAY();
    let sent = 0;

    for (const user of users) {
        const [stats, habitsSnap, habitLogsSnap] = await Promise.all([
            computePeriodStats(user.uid, today, today),
            adminDb.collection('habits').where('uid', '==', user.uid).get(),
            adminDb.collection('habitLogs').where('uid', '==', user.uid).where('date', '==', today).where('completed', '==', true).get(),
        ]);

        const now = new Date();
        const todayWeekday = now.getDay();
        const habits = habitsSnap.docs.map((d) => d.data() as Habit);
        const completedIds = new Set(habitLogsSnap.docs.map((d) => (d.data() as HabitLog).habitId));
        const missedHabits = habits
            .filter((h) => (h.targetDays.length === 0 || h.targetDays.includes(todayWeekday)) && !completedIds.has(h.id))
            .map((h) => h.name);

        const body = await generateDailySummaryText(user, stats, missedHabits);
        await sendTelegramMessage(user.telegramChatId, `📊 <b>Laporan Hari Ini</b>\n\n${body}`);
        sent++;
    }

    return { processed: users.length, sent };
}

// ── Weekly report ─────────────────────────────────────────────────────────────

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
        await sendTelegramMessage(user.telegramChatId, `📅 <b>Evaluasi Mingguan</b>\n\n${body}`);
        sent++;
    }

    return { processed: users.length, sent };
}

// ── Reminders ─────────────────────────────────────────────────────────────────

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
        const questsSnap = await adminDb.collection('quests').where('assignedTo', '==', user.uid).get();
        const quests = questsSnap.docs.map((d) => d.data() as Quest);

        // Deadline warnings (deduped per quest)
        for (let i = 0; i < questsSnap.docs.length; i++) {
            const doc = questsSnap.docs[i];
            const q = quests[i];
            if (q.status !== 'pending' && q.status !== 'in_progress') continue;
            if (!q.deadline) continue;
            const hoursLeft = (new Date(q.deadline).getTime() - now.getTime()) / 3_600_000;
            if (hoursLeft <= 0 || hoursLeft > 3) continue;

            const key = `quest_deadline_${doc.id}`;
            if (await wasTelegramSent(user.uid, key)) continue;

            const name = user.displayName.split(' ')[0];
            const goalHint = user.goal?.aspiration ? ` Ini bagian dari perjalanan lo menuju "${user.goal.aspiration}".` : '';
            await sendTelegramMessage(
                user.telegramChatId,
                `⚠️ <b>DEADLINE MEPET</b>\n\n${name}, quest "<b>${q.title}</b>" tinggal ${Math.max(1, Math.round(hoursLeft))} jam lagi.${goalHint} Gagal di sini bukan pilihan.`
            );
            await markTelegramSent(user.uid, key);
            deadlineReminders++;
        }

        if (!isActiveHours) continue;

        const todayWeekday = now.getDay();
        const [habitsSnap, habitLogsSnap, activitiesSnap] = await Promise.all([
            adminDb.collection('habits').where('uid', '==', user.uid).get(),
            adminDb.collection('habitLogs').where('uid', '==', user.uid).where('date', '==', TODAY()).where('completed', '==', true).get(),
            adminDb.collection('activities').where('uid', '==', user.uid).get(),
        ]);

        const habits = habitsSnap.docs.map((d) => d.data() as Habit);
        const completedHabitIds = new Set(habitLogsSnap.docs.map((d) => (d.data() as HabitLog).habitId));
        const pendingHabits = habits
            .filter((h) => (h.targetDays.length === 0 || h.targetDays.includes(todayWeekday)) && !completedHabitIds.has(h.id))
            .map((h) => h.name);

        const hasActiveQuest = quests.some((q) => q.status === 'pending' || q.status === 'in_progress' || q.status === 'submitted');
        const hasActivityToday = activitiesSnap.docs.some(
            (d) => (d.data() as ActivityEntry).startTime?.startsWith(TODAY())
        );

        const noCondition = hasActiveQuest && pendingHabits.length === 0 && hasActivityToday;
        if (noCondition) continue;

        const daysWithoutActivity = hasActivityToday ? 0 : await getDaysWithoutActivity(user.uid);

        const nudge = await generateBrutalNudge(user, {
            noActiveQuest: !hasActiveQuest,
            pendingHabits,
            noActivityToday: !hasActivityToday,
            daysWithoutActivity,
        });

        const header = daysWithoutActivity >= 3 ? `🚨 <b>KRITIS</b>` : `🔔 <b>Reminder</b>`;
        await sendTelegramMessage(user.telegramChatId, `${header}\n\n${nudge}`);
        nudges++;
    }

    return { processed: users.length, deadlineReminders, nudges };
}
