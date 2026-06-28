import { adminDb } from '@/lib/firebase-admin';
import { sendTelegramMessage } from '@/lib/telegram';
import { getAIProvider } from '@/lib/ai';
import { generateQuestDrafts } from '@/lib/ai/questGenerator';
import type { UserProfile, ActivityEntry, Quest } from '@/types';

export const runtime = 'nodejs';
export const maxDuration = 45;

const TODAY = () => new Date().toISOString().split('T')[0];

/** End of today in WIB (UTC+7), stored as ISO string — used as quest deadline. */
function todayDeadlineISO(): string {
    const now = new Date();
    // End of day WIB = 17:00 UTC (24:00 WIB)
    const endWIB = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 17, 0, 0));
    // If we're already past midnight WIB, push to next day
    if (Date.now() > endWIB.getTime()) {
        endWIB.setUTCDate(endWIB.getUTCDate() + 1);
    }
    return endWIB.toISOString();
}

const BRUTAL_COACH_PERSONA = `Kamu adalah coach brutal jujur yang gak kenal basa-basi. Gaya kamu seperti pelatih keras yang peduli tapi gak ada ampunnya.
Aturan wajib:
- TIDAK ada kalimat motivasi kosong seperti "kamu pasti bisa!" atau "tetap semangat!".
- SELALU sebut nama orang dan tujuan spesifik mereka dalam pesan.
- SELALU hubungkan tindakan hari ini ke konsekuensi nyata di masa depan.
- Nada: keras, jujur, tapi bukan jahat.
- Bahasa Indonesia gaul/santai, tanpa markdown, maks 2 kalimat yang langsung menohok.`;

export async function POST(req: Request) {
    const { uid } = await req.json() as { uid: string };
    if (!uid) return Response.json({ error: 'uid required' }, { status: 400 });

    const userSnap = await adminDb.collection('users').doc(uid).get();
    if (!userSnap.exists) return Response.json({ error: 'user not found' }, { status: 404 });
    const user = userSnap.data() as UserProfile;

    if (!user.telegramChatId) return Response.json({ sent: false, reason: 'no telegram' });

    // Dedup: one nudge per calendar day max
    const dedupKey = `dashboard_open_${TODAY()}`;
    const logRef = adminDb.collection('telegramReminderLog').doc(uid).collection('entries').doc(dedupKey);
    if ((await logRef.get()).exists) return Response.json({ sent: false, reason: 'already_sent_today' });

    // Parallel fetch: activities + active quests
    const [activitiesSnap, questsSnap] = await Promise.all([
        adminDb.collection('activities').where('uid', '==', uid).get(),
        adminDb.collection('quests').where('assignedTo', '==', uid).get(),
    ]);

    const hasActivityToday = activitiesSnap.docs.some(
        (d) => (d.data() as ActivityEntry).startTime?.startsWith(TODAY())
    );
    if (hasActivityToday) return Response.json({ sent: false, reason: 'already_active' });

    const hasActiveQuest = questsSnap.docs.some((d) => {
        const s = (d.data() as Quest).status;
        return s === 'pending' || s === 'in_progress';
    });

    // Consecutive days without activity (for escalation tone)
    const loggedDates = new Set(
        activitiesSnap.docs
            .map((d) => (d.data() as ActivityEntry).startTime?.split('T')[0])
            .filter(Boolean)
    );
    let daysEmpty = 0;
    const cursor = new Date();
    cursor.setDate(cursor.getDate() - 1);
    while (daysEmpty < 30) {
        const key = cursor.toISOString().split('T')[0];
        if (loggedDates.has(key)) break;
        daysEmpty++;
        cursor.setDate(cursor.getDate() - 1);
    }

    const goalText = user.goal?.aspiration ? `"${user.goal.aspiration}"` : null;
    const name = user.displayName.split(' ')[0];

    // ── Case 1: No active quest → auto-generate one and assign it ────────────
    if (!hasActiveQuest) {
        let questTitle = 'Quest Harian';
        let questDesc = '';
        let questMotivation = '';

        try {
            const drafts = await generateQuestDrafts({
                displayName: user.displayName,
                level: user.level ?? 1,
                title: user.title ?? 'Adventurer',
                streak: user.streak ?? 0,
                totalQuestsCompleted: user.totalQuestsCompleted ?? 0,
                arcTheme: undefined,
                count: 1,
                aiSettings: user.aiSettings,
            });

            if (drafts.length > 0) {
                const draft = drafts[0];
                questTitle    = draft.title;
                questDesc     = draft.description;
                questMotivation = draft.motivation;

                const now = new Date().toISOString();
                await adminDb.collection('quests').add({
                    title:       draft.title,
                    description: draft.description,
                    category:    draft.category,
                    difficulty:  draft.difficulty,
                    expReward:   draft.expReward,
                    motivation:  draft.motivation,
                    deadline:    todayDeadlineISO(),
                    status:      'pending',
                    assignedTo:  uid,
                    createdBy:   'system',
                    createdAt:   now,
                    updatedAt:   now,
                } satisfies Omit<Quest, 'id'>);
            }
        } catch (err) {
            console.error('[dashboard-nudge] Quest generation failed:', err);
        }

        const escalation = daysEmpty >= 3 ? `Lo udah ${daysEmpty} hari gak ngapa-ngapain. ` : '';
        const msg = [
            `⚔️ <b>QUEST BARU DITUGASKAN</b>`,
            ``,
            `${escalation}Lo gak punya quest, jadi sistem yang ngasih:`,
            ``,
            `<b>${questTitle}</b>`,
            questDesc ? `${questDesc}` : '',
            ``,
            `⏰ Deadline: malam ini.`,
            goalText ? `\n${name}, lo pengen ${goalText} — ini gak bakal terjadi kalau lo terus nunggu mood.` : `\n${name}, mulai sekarang bukan besok.`,
        ].filter((l) => l !== null).join('\n');

        await sendTelegramMessage(user.telegramChatId, msg);
        await logRef.set({ createdAt: new Date().toISOString(), autoQuest: questTitle });
        return Response.json({ sent: true, autoQuest: questTitle, daysEmpty });
    }

    // ── Case 2: Has quests but no activity yet today → brutal nudge ───────────
    const escalationCtx = daysEmpty >= 3
        ? `Sudah ${daysEmpty} hari berturut-turut tanpa aktivitas yang dicatat.`
        : daysEmpty >= 1 ? `Kemarin juga kosong.` : `Hari ini belum ada aktivitas sama sekali.`;

    let nudgeText: string;
    try {
        const ai = getAIProvider(user.aiSettings);
        nudgeText = await ai.generateText({
            system: BRUTAL_COACH_PERSONA,
            messages: [{
                role: 'user',
                content: `Tulis pesan keras untuk ${user.displayName} yang baru buka app, punya quest aktif tapi belum ngapa-ngapain. ${escalationCtx} ${goalText ? `Tujuan mereka: ${goalText}.` : ''} Sebutkan bahwa questnya nunggu. Maks 2 kalimat.`,
            }],
            maxTokens: 120,
            temperature: 0.9,
        });
    } catch {
        nudgeText = daysEmpty >= 3
            ? `${name}, ${daysEmpty} hari lo buka app tanpa ngerjain apapun — quest lo nunggu, ${goalText ? `tujuan lo nunggu` : 'waktu lo gak nunggu'}.`
            : `${name}, quest lo udah ada — tinggal dikerjain, bukan diliatin.`;
    }

    const header = daysEmpty >= 3 ? `🚨 <b>KRITIS</b>` : `👁 <b>Lo Baru Buka App</b>`;
    await sendTelegramMessage(user.telegramChatId, `${header}\n\n${nudgeText}`);
    await logRef.set({ createdAt: new Date().toISOString() });

    return Response.json({ sent: true, daysEmpty });
}
