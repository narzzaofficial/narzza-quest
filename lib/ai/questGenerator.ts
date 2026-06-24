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
    memorySummary?: string;
    count?: number;
    // Arc context — quest is driven by the active arc, not raw North Star
    arcTheme?: string;
    arcNarrative?: string;
    arcWeeklyGoals?: string[];
    // Phase 4: Dynamic Difficulty
    completionRate7d?: number;
    // Life Context
    situationStatus?: string;
    workload?: string;
    weekFocus?: string;
    activeWorkTasks?: string[];
    todayActivitiesSummary?: string;
    // User AI Settings
    aiSettings?: {
        useOpenRouter: boolean;
        openRouterApiKey: string;
        openRouterModel: string;
    };
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

function difficultyHint(rate?: number): string {
    if (rate === undefined) return '';
    if (rate < 0.4) return 'PENTING: User sedang kesulitan (completion rate rendah). Fokus pada quest difficulty E-D yang kecil & cepat selesai — bantu mereka membangun momentum.';
    if (rate > 0.75) return 'PENTING: User sangat produktif (completion rate tinggi). Tingkatkan tantangan — berikan lebih banyak quest difficulty B-A-S.';
    return 'Completion rate normal — variasikan difficulty D-C-B secara seimbang.';
}

function buildUserPrompt(ctx: QuestGenContext): string {
    const count = ctx.count ?? 4;
    const lines = [
        `Profil hero: ${ctx.displayName}, Level ${ctx.level} (${ctx.title}), streak ${ctx.streak} hari, total quest selesai ${ctx.totalQuestsCompleted}.`,
    ];
    if (ctx.memorySummary) lines.push(`Konteks user (AI memory): ${ctx.memorySummary}`);
    if (ctx.arcTheme || ctx.arcNarrative || ctx.arcWeeklyGoals?.length) {
        lines.push('--- Story Arc Aktif ---');
        if (ctx.arcTheme) lines.push(`Tema: "${ctx.arcTheme}"`);
        if (ctx.arcNarrative) lines.push(`Narasi GM: "${ctx.arcNarrative}"`);
        if (ctx.arcWeeklyGoals?.length) lines.push(`Target arc: ${ctx.arcWeeklyGoals.join(' | ')}`);
        lines.push('Quest HARUS mendukung arc ini — jadikan target arc sebagai panduan utama.');
        lines.push('---');
    }
    if (ctx.recentJournalTitles?.length) {
        lines.push(`Aktivitas terakhir: ${ctx.recentJournalTitles.join(', ')}.`);
    }

    // Life context
    if (ctx.situationStatus) {
        lines.push(`Status hari ini: ${ctx.situationStatus}, workload: ${ctx.workload ?? 'normal'}.`);
        if (ctx.workload === 'high') lines.push('PENTING: Workload kantor sedang tinggi — prioritaskan quest ringan (daily/side, difficulty E-D) yang tidak menambah beban.');
        if (ctx.workload === 'low') lines.push('User punya banyak waktu bebas hari ini — boleh berikan quest lebih berat atau quest main/weekly.');
    }
    if (ctx.weekFocus) lines.push(`Fokus minggu ini: "${ctx.weekFocus}" — quest harus mendukung ini.`);
    if (ctx.activeWorkTasks?.length) lines.push(`Task kantor aktif: ${ctx.activeWorkTasks.slice(0, 4).join(' | ')} — jangan duplikasi task kantor sebagai quest.`);
    if (ctx.todayActivitiesSummary) lines.push(`Aktivitas hari ini: ${ctx.todayActivitiesSummary}.`);

    const hint = difficultyHint(ctx.completionRate7d);
    if (hint) lines.push(hint);
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
    const ai = getAIProvider(ctx.aiSettings);
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
