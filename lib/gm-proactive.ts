import { adminDb } from './firebase-admin';
import { getAIProvider } from './ai';
import type { UserProfile, GMMessageType } from '@/types';

const TODAY = () => new Date().toISOString().split('T')[0];
const DAYS_AGO = (n: number) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().split('T')[0];
};

// ── Helpers ────────────────────────────────────────────────

async function wasMessageSentRecently(uid: string, type: GMMessageType, withinHours = 20): Promise<boolean> {
    const since = new Date(Date.now() - withinHours * 60 * 60 * 1000).toISOString();
    const snap = await adminDb
        .collection('gmMessages')
        .doc(uid)
        .collection('messages')
        .where('type', '==', type)
        .where('createdAt', '>', since)
        .limit(1)
        .get();
    return !snap.empty;
}

async function saveGMMessage(
    uid: string,
    type: GMMessageType,
    content: string,
    priority: 'high' | 'normal' = 'normal'
): Promise<void> {
    await adminDb
        .collection('gmMessages')
        .doc(uid)
        .collection('messages')
        .add({
            uid,
            type,
            content,
            priority,
            isRead: false,
            createdAt: new Date().toISOString(),
        });

    // Also write to the regular notifications collection so the bell badge lights up
    await adminDb.collection('notifications').add({
        toUid: uid,
        fromUid: 'ai-gm',
        fromName: 'AI Game Master',
        type: 'encouragement',
        title: gmMessageTitle(type),
        message: content.slice(0, 120) + (content.length > 120 ? '…' : ''),
        isRead: false,
        createdAt: new Date().toISOString(),
    });
}

function gmMessageTitle(type: GMMessageType): string {
    switch (type) {
        case 'streak_warning':  return '⚠️ Streak kamu hampir putus!';
        case 'idle_warning':    return '👋 Kamu sudah lama menghilang...';
        case 'quest_deadline':  return '📅 Deadline quest mendekat!';
        case 'welcome_back':    return '🎉 Selamat datang kembali!';
        case 'level_up':        return '🚀 Kamu naik level!';
        case 'daily_check':     return '🌅 Pesan dari Game Master';
        default:                return '📨 Pesan dari AI Game Master';
    }
}

async function generateGMMessage(type: GMMessageType, profile: UserProfile, extra?: string): Promise<string> {
    const ai = getAIProvider();

    const prompts: Record<GMMessageType, string> = {
        streak_warning: `Kamu adalah AI Game Master yang peduli. User "${profile.displayName}" sedang di streak ${profile.streak} hari dan belum aktif hari ini — hari hampir habis. Tulis pesan singkat (2-3 kalimat) yang memotivasi mereka untuk menyelesaikan minimal satu quest sebelum tengah malam. Nada: hangat, sedikit urgen tapi tidak menakut-nakuti. Bahasa Indonesia. Jangan lebih dari 3 kalimat.`,
        idle_warning: `Kamu adalah AI Game Master. User "${profile.displayName}" (Level ${profile.level}) sudah tidak aktif selama 2+ hari. Tulis pesan singkat yang mengingatkan mereka dengan hangat untuk kembali. Nada: supportif, bukan menghakimi. Bahasa Indonesia. Maksimal 3 kalimat.`,
        quest_deadline: `Kamu adalah AI Game Master. User "${profile.displayName}" punya quest yang deadline-nya besok: ${extra || 'quest yang belum selesai'}. Tulis pengingat singkat yang memotivasi. Bahasa Indonesia. Maksimal 3 kalimat.`,
        welcome_back: `Kamu adalah AI Game Master. User "${profile.displayName}" baru saja kembali setelah absen lebih dari seminggu. Tulis pesan sambutan yang hangat dan memotivasi untuk memulai kembali. Bahasa Indonesia. Maksimal 3 kalimat.`,
        level_up: `Kamu adalah AI Game Master. User "${profile.displayName}" baru saja naik ke Level ${profile.level}! Tulis pesan perayaan yang epic dan memotivasi. Bahasa Indonesia. Maksimal 3 kalimat.`,
        daily_check: `Kamu adalah AI Game Master. Tulis pesan pagi singkat untuk "${profile.displayName}" (Level ${profile.level}, streak ${profile.streak} hari) yang menyemangati harinya. Bahasa Indonesia. Maksimal 2 kalimat.`,
    };

    return await ai.generateText({
        system: 'Kamu adalah AI Game Master dari game RPG kehidupan "Narzza Quest". Pesan harus terasa personal, hangat, dan ringkas. Jangan gunakan markdown.',
        messages: [{ role: 'user', content: prompts[type] }],
        maxTokens: 150,
        temperature: 0.8,
    });
}

// ── Condition checks ─────────────────────────────────────

export async function checkStreakWarning(profile: UserProfile): Promise<void> {
    const today = TODAY();
    if (profile.lastActiveDate >= today) return; // Already active today
    if (profile.streak < 1) return;              // No streak to protect

    const alreadySent = await wasMessageSentRecently(profile.uid, 'streak_warning', 20);
    if (alreadySent) return;

    const content = await generateGMMessage('streak_warning', profile);
    await saveGMMessage(profile.uid, 'streak_warning', content, 'high');
}

export async function checkIdleWarning(profile: UserProfile): Promise<void> {
    const twoDaysAgo = DAYS_AGO(2);
    if (profile.lastActiveDate > twoDaysAgo) return; // Active within 2 days

    const alreadySent = await wasMessageSentRecently(profile.uid, 'idle_warning', 44);
    if (alreadySent) return;

    const content = await generateGMMessage('idle_warning', profile);
    await saveGMMessage(profile.uid, 'idle_warning', content, 'high');
}

export async function checkQuestDeadlines(profile: UserProfile): Promise<void> {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const questsSnap = await adminDb
        .collection('quests')
        .where('assignedTo', '==', profile.uid)
        .where('deadline', '==', tomorrowStr)
        .where('status', 'in', ['pending', 'in_progress'])
        .get();

    if (questsSnap.empty) return;

    const alreadySent = await wasMessageSentRecently(profile.uid, 'quest_deadline', 20);
    if (alreadySent) return;

    const titles = questsSnap.docs.map(d => d.data().title).join(', ');
    const content = await generateGMMessage('quest_deadline', profile, titles);
    await saveGMMessage(profile.uid, 'quest_deadline', content, 'high');
}

export async function checkWelcomeBack(profile: UserProfile): Promise<void> {
    const sevenDaysAgo = DAYS_AGO(7);
    // "welcome_back" fires the FIRST time a user logs in after 7+ days away
    // We detect this by: lastActiveDate was 7+ days ago AND today they ARE active
    // This check runs on login — not in the hourly cron
    if (profile.lastActiveDate >= TODAY()) return; // Not yet marked as active today
    // The caller (login trigger) ensures this is their first request today after a long break

    const alreadySent = await wasMessageSentRecently(profile.uid, 'welcome_back', 168); // 7 days
    if (alreadySent) return;

    const content = await generateGMMessage('welcome_back', profile);
    await saveGMMessage(profile.uid, 'welcome_back', content, 'high');
}

// ── Main cron runner ──────────────────────────────────────

export async function runGMProactiveCheck(): Promise<{ processed: number; messages: number }> {
    const usersSnap = await adminDb.collection('users').get();
    let processed = 0;
    let messages = 0;

    const now = new Date();
    const hour = now.getUTCHours(); // 0-23 UTC

    for (const userDoc of usersSnap.docs) {
        const profile = userDoc.data() as UserProfile;
        if (!profile.uid || profile.role !== 'player') continue;

        const beforeCount = messages;

        try {
            // Streak warning: run at UTC 12:00 (evening WIB = 7 PM)
            if (hour >= 12 && hour < 14) {
                await checkStreakWarning(profile);
            }

            // Idle warning: run at UTC 01:00 (morning WIB = 8 AM)
            if (hour >= 1 && hour < 3) {
                await checkIdleWarning(profile);
            }

            // Quest deadline: run at UTC 12:00
            if (hour >= 12 && hour < 14) {
                await checkQuestDeadlines(profile);
            }
        } catch (err) {
            console.error(`GM check failed for ${profile.uid}:`, err);
        }

        if (messages > beforeCount) processed++;
    }

    return { processed: usersSnap.size, messages };
}
