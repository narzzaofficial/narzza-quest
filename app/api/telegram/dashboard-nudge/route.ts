import { adminDb } from '@/lib/firebase-admin';
import { sendTelegramMessage } from '@/lib/telegram';
import { getAIProvider } from '@/lib/ai';
import type { UserProfile, ActivityEntry } from '@/types';

export const runtime = 'nodejs';
export const maxDuration = 30;

const TODAY = () => new Date().toISOString().split('T')[0];

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

    // Load user profile
    const userSnap = await adminDb.collection('users').doc(uid).get();
    if (!userSnap.exists) return Response.json({ error: 'user not found' }, { status: 404 });
    const user = userSnap.data() as UserProfile;

    // Only fire if Telegram is linked
    if (!user.telegramChatId) return Response.json({ sent: false, reason: 'no telegram' });

    // Dedup: send at most once per calendar day
    const dedupKey = `dashboard_open_${TODAY()}`;
    const logRef = adminDb.collection('telegramReminderLog').doc(uid).collection('entries').doc(dedupKey);
    const already = await logRef.get();
    if (already.exists) return Response.json({ sent: false, reason: 'already_sent_today' });

    // Check if user has any activity logged today
    const activitiesSnap = await adminDb
        .collection('activities')
        .where('uid', '==', uid)
        .get();
    const hasActivityToday = activitiesSnap.docs.some(
        (d) => (d.data() as ActivityEntry).startTime?.startsWith(TODAY())
    );

    // If they already logged today — no nudge needed
    if (hasActivityToday) return Response.json({ sent: false, reason: 'already_active' });

    // Compute consecutive days without activity for escalation
    const loggedDates = new Set(
        activitiesSnap.docs
            .map((d) => (d.data() as ActivityEntry).startTime?.split('T')[0])
            .filter(Boolean)
    );
    let daysEmpty = 0;
    const cursor = new Date();
    cursor.setDate(cursor.getDate() - 1); // start from yesterday
    while (daysEmpty < 30) {
        const key = cursor.toISOString().split('T')[0];
        if (loggedDates.has(key)) break;
        daysEmpty++;
        cursor.setDate(cursor.getDate() - 1);
    }

    const goalText = user.goal?.aspiration
        ? `Tujuan mereka: "${user.goal.aspiration}".`
        : '';
    const escalationCtx = daysEmpty >= 3
        ? `Sudah ${daysEmpty} hari berturut-turut tanpa satu pun aktivitas yang dicatat.`
        : daysEmpty >= 1
        ? `Kemarin juga tidak ada aktivitas yang dicatat.`
        : `Hari ini belum ada aktivitas sama sekali.`;

    let nudgeText: string;
    try {
        const ai = getAIProvider(user.aiSettings);
        nudgeText = await ai.generateText({
            system: BRUTAL_COACH_PERSONA,
            messages: [{
                role: 'user',
                content: `Tulis pesan keras untuk ${user.displayName} yang baru buka app tapi belum lakuin apa-apa. ${escalationCtx} ${goalText} Buat mereka merasa bersalah dengan cara yang konstruktif. Maks 2 kalimat.`,
            }],
            maxTokens: 120,
            temperature: 0.9,
        });
    } catch {
        const name = user.displayName.split(' ')[0];
        nudgeText = daysEmpty >= 3
            ? `${name}, lo buka app tapi udah ${daysEmpty} hari kosong — buka doang gak cukup. ${user.goal?.aspiration ? `"${user.goal.aspiration}" butuh tindakan, bukan niat.` : 'Lakuin sesuatu sekarang.'}`
            : `${name}, lo buka app — sekarang lakukan sesuatu yang worth dibuka. ${user.goal?.aspiration ? `Tujuan lo gak bakal nunggu.` : ''}`;
    }

    const header = daysEmpty >= 3 ? `🚨 <b>KRITIS</b>` : `👁 <b>Lo Baru Buka App</b>`;
    await sendTelegramMessage(user.telegramChatId, `${header}\n\n${nudgeText}`);
    await logRef.set({ createdAt: new Date().toISOString() });

    return Response.json({ sent: true, daysEmpty });
}
