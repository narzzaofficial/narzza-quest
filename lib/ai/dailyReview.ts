import { getAIProvider } from './index';

// Server-side only. Generates the AI Game Master's daily review.

export interface DailyReviewContext {
    displayName: string;
    level: number;
    streak: number;
    questsCompletedToday: number;
    expEarnedToday: number;
    completedTitles?: string[];
    memorySummary?: string;
    goalSummary?: string;
}

export interface DailyReviewResult {
    summary: string;
    wins: string[];
    focus: string[];
    encouragement: string;
}

export async function generateDailyReview(ctx: DailyReviewContext): Promise<DailyReviewResult> {
    const ai = getAIProvider();

    const system = [
        'Kamu adalah AI Game Master yang memberi review harian untuk user aplikasi RPG kehidupan.',
        'Beri evaluasi jujur tapi suportif atas aktivitas hari ini, plus saran fokus untuk besok.',
        'Kalau hari ini kosong/sedikit, tetap dorong dengan lembut tanpa menghakimi.',
        'Balas HANYA JSON: { "summary": string (2-3 kalimat), "wins": string[] (hal baik hari ini, 0-4), "focus": string[] (saran besok, 1-3), "encouragement": string (1 kalimat penyemangat) }',
        'Bahasa Indonesia, hangat & membumi.',
    ].join('\n');

    const lines = [
        `User: ${ctx.displayName}, Level ${ctx.level}, streak ${ctx.streak}.`,
        `Hari ini: ${ctx.questsCompletedToday} quest selesai, +${ctx.expEarnedToday} EXP.`,
    ];
    if (ctx.goalSummary) lines.push(`Tujuan utama user (North Star): ${ctx.goalSummary}`);
    if (ctx.completedTitles?.length) lines.push(`Quest yang selesai hari ini: ${ctx.completedTitles.join(', ')}.`);
    if (ctx.memorySummary) lines.push(`Konteks user: ${ctx.memorySummary}`);
    lines.push('Buat review harian sebagai JSON.');

    const res = await ai.generateJSON<Partial<DailyReviewResult>>({
        system,
        messages: [{ role: 'user', content: lines.join('\n') }],
        maxTokens: 700,
        temperature: 0.7,
    });

    return {
        summary: String(res?.summary ?? '').slice(0, 1000),
        wins: Array.isArray(res?.wins) ? res.wins.map((s) => String(s).slice(0, 200)).slice(0, 4) : [],
        focus: Array.isArray(res?.focus) ? res.focus.map((s) => String(s).slice(0, 200)).slice(0, 3) : [],
        encouragement: String(res?.encouragement ?? '').slice(0, 300),
    };
}
