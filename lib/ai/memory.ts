import { getAIProvider } from './index';

// Server-side only. Maintains the AI Game Master's evolving "memory" of a user.

export interface MemoryContext {
    displayName: string;
    level: number;
    title: string;
    streak: number;
    totalQuestsCompleted: number;
    totalHoursWorked: number;
    recentQuestTitles?: string[];
    recentJournalTitles?: string[];
    goals?: string;
    previousSummary?: string;
}

export interface MemoryResult {
    summary: string;
    insights: string[];
}

export async function generateMemory(ctx: MemoryContext): Promise<MemoryResult> {
    const ai = getAIProvider();

    const system = [
        'Kamu adalah AI Game Master yang memelihara "memory" tentang seorang user di aplikasi RPG kehidupan.',
        'Rangkum siapa user ini: kebiasaan, kekuatan, kelemahan, dan fokus saat ini — supaya quest & review berikutnya makin personal.',
        'Kalau ada memory sebelumnya, perbarui & sempurnakan dengan info baru, jangan diulang mentah.',
        'Balas HANYA JSON: { "summary": string (2-4 kalimat), "insights": string[] (3-6 poin singkat & actionable) }',
        'Bahasa Indonesia.',
    ].join('\n');

    const lines = [
        `User: ${ctx.displayName}, Level ${ctx.level} (${ctx.title}), streak ${ctx.streak}, total quest selesai ${ctx.totalQuestsCompleted}, total jam fokus ${ctx.totalHoursWorked.toFixed(1)}.`,
    ];
    if (ctx.goals) lines.push(`Target user: ${ctx.goals}.`);
    if (ctx.recentQuestTitles?.length) lines.push(`Quest terakhir: ${ctx.recentQuestTitles.join(', ')}.`);
    if (ctx.recentJournalTitles?.length) lines.push(`Aktivitas jurnal terakhir: ${ctx.recentJournalTitles.join(', ')}.`);
    if (ctx.previousSummary) lines.push(`Memory sebelumnya: ${ctx.previousSummary}`);
    lines.push('Perbarui memory sebagai JSON.');

    const res = await ai.generateJSON<Partial<MemoryResult>>({
        system,
        messages: [{ role: 'user', content: lines.join('\n') }],
        maxTokens: 700,
        temperature: 0.6,
    });

    return {
        summary: String(res?.summary ?? '').slice(0, 1000),
        insights: Array.isArray(res?.insights)
            ? res.insights.map((s) => String(s).slice(0, 200)).slice(0, 8)
            : [],
    };
}
