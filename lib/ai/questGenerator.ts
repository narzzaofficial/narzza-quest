import { getAIProvider } from './index';
import { DIFFICULTY_EXP } from '@/constants/game';
import type { QuestCategory, QuestDifficulty } from '@/types';

// Server-side only (pulls in the AI provider). Never import the runtime
// exports of this file from a client component — import `type QuestDraft` only.

export interface QuestGenContext {
    displayName: string;
    level: number;
    title: string;
    streak: number;
    totalQuestsCompleted: number;
    recentJournalTitles?: string[];
    goals?: string;
    memorySummary?: string;
    count?: number;
}

export interface QuestDraft {
    title: string;
    description: string;
    category: QuestCategory;
    difficulty: QuestDifficulty;
    motivation: string;
    expReward: number;
}

const CATEGORIES: QuestCategory[] = ['daily', 'weekly', 'main', 'side'];
const DIFFICULTIES: QuestDifficulty[] = ['E', 'D', 'C', 'B', 'A', 'S'];

function buildSystemPrompt(): string {
    return [
        'Kamu adalah AI Game Master untuk aplikasi RPG kehidupan nyata bernama Narzza Quest.',
        'Tugasmu menyusun "quest" (misi produktivitas dunia nyata) yang menantang tapi realistis,',
        'disesuaikan dengan level, streak, dan target user.',
        '',
        'Aturan:',
        '- Difficulty: E (sangat mudah) → S (sangat sulit). Sesuaikan dengan level user.',
        '- Category: daily (harian), weekly (mingguan), main (tujuan besar), side (tambahan ringan).',
        '- Quest harus konkret & bisa diselesaikan, bukan abstrak.',
        '- Tulis dalam Bahasa Indonesia yang membumi & memotivasi.',
        '',
        'Balas HANYA dalam format JSON berikut, tanpa teks lain:',
        '{ "quests": [ { "title": string, "description": string, "category": "daily|weekly|main|side", "difficulty": "E|D|C|B|A|S", "motivation": string } ] }',
    ].join('\n');
}

function buildUserPrompt(ctx: QuestGenContext): string {
    const count = ctx.count ?? 4;
    const lines = [
        `Profil hero: ${ctx.displayName}, Level ${ctx.level} (${ctx.title}), streak ${ctx.streak} hari, total quest selesai ${ctx.totalQuestsCompleted}.`,
    ];
    if (ctx.goals) lines.push(`Target/goal user: ${ctx.goals}.`);
    if (ctx.memorySummary) lines.push(`Konteks user (memory AI): ${ctx.memorySummary}`);
    if (ctx.recentJournalTitles?.length) {
        lines.push(`Aktivitas terakhir: ${ctx.recentJournalTitles.join(', ')}.`);
    }
    lines.push(`Buat ${count} quest untuk dikerjakan hari ini sebagai JSON.`);
    return lines.join('\n');
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeDraft(q: any): QuestDraft {
    const category: QuestCategory = CATEGORIES.includes(q?.category) ? q.category : 'daily';
    const difficulty: QuestDifficulty = DIFFICULTIES.includes(q?.difficulty) ? q.difficulty : 'E';
    return {
        title: String(q?.title ?? 'Quest Baru').slice(0, 120),
        description: String(q?.description ?? '').slice(0, 1000),
        category,
        difficulty,
        motivation: String(q?.motivation ?? '').slice(0, 500),
        expReward: DIFFICULTY_EXP[difficulty],
    };
}

export async function generateQuestDrafts(ctx: QuestGenContext): Promise<QuestDraft[]> {
    const ai = getAIProvider();
    const count = ctx.count ?? 4;

    const res = await ai.generateJSON<{ quests?: unknown[] }>({
        system: buildSystemPrompt(),
        messages: [{ role: 'user', content: buildUserPrompt(ctx) }],
        maxTokens: 2048,
        temperature: 0.8,
    });

    const raw = Array.isArray(res?.quests) ? res.quests : [];
    return raw.slice(0, count).map(normalizeDraft);
}
